import { z } from "zod";

export const analyzeRequestSchema = z.object({
  company: z
    .string({ required_error: "Company name is required." })
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(80, "Company name must be 80 characters or fewer.")
});

export const companyFactsSchema = z.object({
  company: z.string().describe("Official or commonly used company name."),
  companyExists: z
    .boolean()
    .describe(
      "True if this is a real, identifiable company or organization that can be meaningfully researched. False if the input is gibberish, a random word, a person's name unrelated to any company, a made-up/fictional company, or otherwise not a real company or organization."
    ),
  notFoundReason: z
    .string()
    .optional()
    .describe(
      "Only set this when companyExists is false: one short, plain-language sentence explaining why this isn't a recognizable company. Omit entirely when companyExists is true."
    ),
  overview: z.string().describe("Concise company overview (2-3 sentences)."),
  industry: z.string().describe("Primary industry or sector."),
  businessModel: z.string().describe("How the company makes money."),
  products: z.string().describe("Main products and services, comma separated."),
  headquarters: z.string().describe("Company headquarters city and country."),
  foundedYear: z.string().describe("Founded year, or 'Not available'."),
  ceo: z.string().describe("Current CEO, or 'Not available'."),
  marketPosition: z.string().describe("Competitive and market position summary."),
  competitors: z.array(z.string()).describe("2-5 key direct competitors, names only.").default([]),
  financialAnalysis: z.object({
    revenueGrowth: z.string().describe("Revenue growth trend, with a figure if known."),
    profitability: z.string().describe("Profitability / margin assessment."),
    debtLevel: z.string().describe("Debt and leverage assessment."),
    cashFlow: z.string().describe("Cash-flow assessment.")
  }),
  recentNews: z.string().describe("Recent, publicly known news summary."),
  growthOpportunities: z.array(z.string()).describe("3-5 concrete growth opportunities."),
  risks: z.array(z.string()).describe("3-5 concrete investment risks.")
});

export const investmentJudgmentSchema = z.object({
  scoreBreakdown: z.object({
    financialHealth: z.number().min(0).max(100),
    marketPosition: z.number().min(0).max(100),
    growthPotential: z.number().min(0).max(100),
    riskLevel: z.number().min(0).max(100).describe("SAFETY score: higher = safer.")
  }),
  investmentScore: z.number().min(0).max(100),
  recommendation: z.enum(["INVEST", "PASS"]),
  pros: z.array(z.string()).describe("3-5 investment positives."),
  cons: z.array(z.string()).describe("3-5 investment negatives."),
  reasoning: z.string().describe("Detailed, interview-friendly reasoning."),
  confidenceLevel: z.enum(["High", "Medium", "Low"]),
  confidenceNote: z.string()
});

export const investmentAnalysisSchema = companyFactsSchema.merge(investmentJudgmentSchema);

// Validates the payload the frontend sends back when requesting the
// judgment stage: the company name plus the facts it already received.
export const judgmentRequestSchema = z.object({
  company: z.string().trim().min(2).max(80),
  facts: companyFactsSchema
});
export const followUpRequestSchema = z.object({
  company: z.string().trim().min(2, "Company name must be at least 2 characters.").max(80),
  context: investmentAnalysisSchema.partial().passthrough(),
  question: z
    .string({ required_error: "Question is required." })
    .trim()
    .min(3, "Ask a slightly longer question.")
    .max(300, "Keep the question under 300 characters.")
});

export const followUpAnswerSchema = z.object({
  answerPoints: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe("3-6 short bullet points answering the question, grounded strictly in the provided context."),
  isAnswerable: z
    .boolean()
    .describe("False if the provided context does not contain enough information to answer confidently.")
});