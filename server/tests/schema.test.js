import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRequestSchema, investmentAnalysisSchema } from "../src/langchain/schemas.js";
import normalizeAnalysis from "../src/utils/normalizeAnalysis.js";

test("analyzeRequestSchema trims and validates company names", () => {
  const parsed = analyzeRequestSchema.parse({ company: "  Tesla  " });
  assert.equal(parsed.company, "Tesla");
  assert.equal(analyzeRequestSchema.safeParse({ company: "" }).success, false);
});

test("investmentAnalysisSchema accepts the expected structured response", () => {
  const parsed = investmentAnalysisSchema.parse({
    company: "Example Inc.",
    overview: "A sample company.",
    industry: "Technology",
    businessModel: "Subscription software.",
    products: "Analytics platform.",
    headquarters: "San Francisco, California",
    foundedYear: "2018",
    ceo: "Jane Doe",
    marketPosition: "Niche leader.",
    financialAnalysis: {
      revenueGrowth: "Growing.",
      profitability: "Profitable.",
      debtLevel: "Low.",
      cashFlow: "Positive."
    },
    recentNews: "No major recent news.",
    growthOpportunities: ["Enterprise expansion"],
    risks: ["Competitive pressure"],
    pros: ["Strong retention"],
    cons: ["Premium valuation"],
    investmentScore: 76,
    recommendation: "INVEST",
    reasoning: "The business shows durable fundamentals."
  });

  assert.equal(parsed.recommendation, "INVEST");
});

test("normalizeAnalysis clamps scores and removes empty list items", () => {
  const normalized = normalizeAnalysis(
    {
      company: "",
      overview: "Overview",
      industry: "Software",
      businessModel: "SaaS",
      products: "Platform",
      headquarters: "New York",
      foundedYear: "2020",
      ceo: "Not available",
      marketPosition: "Challenger",
      financialAnalysis: {
        revenueGrowth: "Fast",
        profitability: "Improving",
        debtLevel: "Moderate",
        cashFlow: "Positive"
      },
      recentNews: "Recent notes",
      growthOpportunities: ["Expansion", ""],
      risks: ["Execution"],
      pros: ["Growth"],
      cons: ["Risk"],
      investmentScore: 120,
      recommendation: "INVEST",
      reasoning: "Good setup."
    },
    "Fallback Co"
  );

  assert.equal(normalized.company, "Fallback Co");
  assert.equal(normalized.investmentScore, 100);
  assert.deepEqual(normalized.growthOpportunities, ["Expansion"]);
});
