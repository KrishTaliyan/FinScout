import { ChatGoogle } from "@langchain/google/node";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { env } from "../config/env.js";
import { companyFactsSchema, investmentJudgmentSchema, followUpAnswerSchema } from "./schemas.js";
import { normalizeFacts, normalizeJudgment } from "../utils/normalizeAnalysis.js";
import createHttpError from "../utils/httpError.js";

const GROUNDING_TIMEOUT_MS = 7000;
const GROUNDING_ENABLED = env.GROUNDING_ENABLED !== "false";

function createGeminiModel() {
  if (!env.GOOGLE_API_KEY) {
    throw createHttpError(503, "Google Gemini API key is missing. Add GOOGLE_API_KEY to your server environment.");
  }
  return new ChatGoogle({ apiKey: env.GOOGLE_API_KEY, model: env.GEMINI_MODEL, maxRetries: 2 });
}

function extractMessageText(message) {
  if (typeof message?.text === "string" && message.text.trim()) return message.text.trim();
  if (typeof message?.content === "string") return message.content.trim();
  if (Array.isArray(message?.content)) {
    return message.content.map((block) => (typeof block === "string" ? block : block.text || "")).join("\n").trim();
  }
  return "";
}

function withTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function getResearchNotes(model, company) {
  const messages = [
    new SystemMessage(
        [
          "You are FinScout's research assistant answering a follow-up question about a company that has ALREADY been researched.",
          "Answer using ONLY the fact sheet and investment judgment JSON provided below — never invent new facts, numbers, or events not present in it.",
          "Respond as 3-6 short, direct bullet points, each under 25 words. No preamble, no restating the question, no filler.",
          "If the question compares this company to another company, or asks 'which one' / 'from both', and the context JSON only contains data for ONE company, your first bullet must clearly state you only have research on this one company here and cannot compare it to another — then still summarize this company's relevant data as the remaining bullets.",
          "If the provided context genuinely does not contain enough information to answer at all, set isAnswerable to false and return one honest bullet point saying so instead of guessing.",
          "Do not give personalized financial advice."
        ].join(" ")
      ),
    new HumanMessage(
      `Research ${company}. Return compact research notes with only the most decision-relevant facts. Hard limit: 250 words.`
    )
  ];

  if (GROUNDING_ENABLED) {
    try {
      const groundedModel = model.bindTools([{ googleSearch: {} }]);
      const groundedResponse = await withTimeout(groundedModel.invoke(messages), GROUNDING_TIMEOUT_MS);
      const groundedText = extractMessageText(groundedResponse);
      if (groundedText) return groundedText;
    } catch (error) {
      console.warn("Grounded research skipped (slow or unavailable):", error.message);
    }
  }

  const fallbackResponse = await model.invoke(messages);
  return extractMessageText(fallbackResponse);
}

// Stage: research + fact extraction. Fast-ish (no judgment reasoning),
// so the UI can show this the moment it's ready.
export async function getCompanyFacts(company) {
  const model = createGeminiModel();

  try {
    const researchNotes = await getResearchNotes(model, company);
    const factsModel = model.withStructuredOutput(companyFactsSchema);

    const facts = await factsModel.invoke([
      new SystemMessage(
        [
          "You are a research analyst extracting structured facts about a company. Be concise.",
          "First, decide whether the input is a real, identifiable company or organization. If the research notes contain no genuine information about a real company — e.g. the input is gibberish, a random word, an unrelated person's name, or a made-up/fictional company — set companyExists to false, give a short notFoundReason, and fill the remaining fields with 'Not available' (or empty arrays for list fields). Do not invent a fake research profile to fill the fields.",
          "If it IS a real company, set companyExists to true and omit notFoundReason.",
          "Only report what is supported by the research notes provided.",
          "Do not add investment opinions, scores, or recommendations at this stage.",
          "Keep lists tight: exactly 3 growthOpportunities, exactly 3 risks, at most 4 competitors (when the company exists).",
          "If a field is unavailable, write 'Not available'."
        ].join(" ")
      ),
      new HumanMessage(
        [`Company: ${company}`, "", "Research notes:", researchNotes || "No external notes were returned.", "", "Extract the structured fact sheet."].join("\n")
      )
    ]);

    const parsed = companyFactsSchema.safeParse(facts);
    if (!parsed.success) {
      throw createHttpError(502, "The AI returned an invalid facts format.", parsed.error.flatten());
    }

    return normalizeFacts(parsed.data, company);
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(502, "FinScout could not research this company. Please try again.", error.message);
  }
}

// Stage: judgment. Takes already-extracted facts, no re-research needed —
// this is why it's noticeably faster than the facts stage.
export async function getInvestmentJudgment(company, facts) {
  // Short-circuit: if the facts stage couldn't confirm this is a real company,
  // don't waste a model call trying to force a score onto empty/fake data.
  if (facts?.companyExists === false) {
    return {
      scoreBreakdown: { financialHealth: 0, marketPosition: 0, growthPotential: 0, riskLevel: 0 },
      investmentScore: 0,
      recommendation: "PASS",
      pros: [],
      cons: [],
      reasoning: facts.notFoundReason || `FinScout could not find reliable information about "${company}".`,
      confidenceLevel: "Low",
      confidenceNote: "This does not appear to be a real, identifiable company or organization."
    };
  }

  const model = createGeminiModel();

  try {
    const judgmentModel = model.withStructuredOutput(investmentJudgmentSchema);

    const judgment = await judgmentModel.invoke([
      new SystemMessage(
        [
          "You are an AI investment committee analyst for FinScout. Be concise — speed matters.",
          "You will be given a structured fact sheet. Do not invent new facts.",
          "Score financialHealth, marketPosition, growthPotential, and riskLevel independently (riskLevel is a SAFETY score: higher = safer).",
          "Set investmentScore as a weighted synthesis of the four sub-scores.",
          "Prefer PASS when evidence is weak, risks dominate, or the fact sheet is thin.",
          "Use INVEST only when fundamentals, market position, and financial signals are convincingly positive.",
          "Set confidenceLevel honestly: use Low if the fact sheet has many 'Not available' fields.",
          "Keep lists tight: exactly 3 pros, exactly 3 cons.",
          "Keep 'reasoning' under 70 words."
        ].join(" ")
      ),
      new HumanMessage([`Company: ${company}`, "", "Fact sheet (JSON):", JSON.stringify(facts, null, 2), "", "Produce the investment judgment."].join("\n"))
    ]);

    const parsed = investmentJudgmentSchema.safeParse(judgment);
    if (!parsed.success) {
      throw createHttpError(502, "The AI returned an invalid judgment format.", parsed.error.flatten());
    }

    return normalizeJudgment(parsed.data);
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(502, "FinScout could not score this company. Please try again.", error.message);
  }
}

// Combined pipeline — used by the single-call /analyze endpoint (Compare mode).
export async function runInvestmentAgent(company) {
  const facts = await getCompanyFacts(company);
  const judgment = await getInvestmentJudgment(company, facts);
  return { ...facts, ...judgment };
}

// Follow-up Q&A. Deliberately does NOT re-research or call search grounding —
// it answers strictly from the fact sheet + judgment the frontend already has.
export async function getFollowUpAnswer(company, context, question) {
  const model = createGeminiModel();

  try {
    const followUpModel = model.withStructuredOutput(followUpAnswerSchema);

    const answer = await followUpModel.invoke([
      new SystemMessage(
        [
          "You are FinScout's research assistant — a knowledgeable financial-analyst chatbot, similar to a general AI assistant, discussing the company below.",
          "You are given a fact sheet and investment judgment JSON for this company. Treat it as your primary, most reliable source — never contradict it.",
          "For anything the fact sheet does NOT cover (e.g. market cap, net worth, stock price, historical figures, general company or finance knowledge), answer using your own knowledge as a well-informed analyst instead of refusing.",
          "If a figure could be outdated or approximate (market cap, share price, recent earnings), briefly say so in that bullet rather than stating it as a precise current fact.",
          "Only set isAnswerable to false if the question is entirely unrelated to this company or investing — otherwise always attempt a real, helpful answer.",
          "Respond as 3-6 short, direct bullet points, each under 25 words. No preamble, no restating the question, no filler.",
          "Do not tell the user what they personally should do with their money — you can share facts, figures, comparisons, and analysis, but frame investment decisions as theirs to make."
        ].join(" ")
      ),
      new HumanMessage(
        [
          `Company: ${company}`,
          "",
          "Known research (JSON):",
          JSON.stringify(context, null, 2),
          "",
          `Follow-up question: ${question}`
        ].join("\n")
      )
    ]);

    const parsed = followUpAnswerSchema.safeParse(answer);
    if (!parsed.success) {
      throw createHttpError(502, "The AI returned an invalid answer format.", parsed.error.flatten());
    }

    return parsed.data;
  } catch (error) {
    if (error.statusCode) throw error;
    throw createHttpError(502, "FinScout could not answer that question. Please try again.", error.message);
  }
}