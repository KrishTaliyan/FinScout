function cleanText(value, fallback = "Not available") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function cleanArray(value, maxItems = 5) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, maxItems);
}

function clampScore(value) {
  const score = Math.round(Number(value));
  return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
}

export function normalizeFacts(facts, requestedCompany) {
  const companyExists = facts.companyExists !== false;

  return {
    company: cleanText(facts.company, requestedCompany),
    companyExists,
    ...(companyExists
      ? {}
      : { notFoundReason: cleanText(facts.notFoundReason, "This doesn't appear to be a real, identifiable company.") }),
    overview: cleanText(facts.overview),
    industry: cleanText(facts.industry),
    businessModel: cleanText(facts.businessModel),
    products: cleanText(facts.products),
    headquarters: cleanText(facts.headquarters),
    foundedYear: cleanText(facts.foundedYear),
    ceo: cleanText(facts.ceo),
    marketPosition: cleanText(facts.marketPosition),
    competitors: cleanArray(facts.competitors, 4),
    financialAnalysis: {
      revenueGrowth: cleanText(facts.financialAnalysis?.revenueGrowth),
      profitability: cleanText(facts.financialAnalysis?.profitability),
      debtLevel: cleanText(facts.financialAnalysis?.debtLevel),
      cashFlow: cleanText(facts.financialAnalysis?.cashFlow)
    },
    recentNews: cleanText(facts.recentNews),
    growthOpportunities: cleanArray(facts.growthOpportunities, 3),
    risks: cleanArray(facts.risks, 3)
  };
}

export function normalizeJudgment(judgment) {
  return {
    scoreBreakdown: {
      financialHealth: clampScore(judgment.scoreBreakdown?.financialHealth),
      marketPosition: clampScore(judgment.scoreBreakdown?.marketPosition),
      growthPotential: clampScore(judgment.scoreBreakdown?.growthPotential),
      riskLevel: clampScore(judgment.scoreBreakdown?.riskLevel)
    },
    investmentScore: clampScore(judgment.investmentScore),
    recommendation: judgment.recommendation === "INVEST" ? "INVEST" : "PASS",
    pros: cleanArray(judgment.pros, 3),
    cons: cleanArray(judgment.cons, 3),
    reasoning: cleanText(judgment.reasoning),
    confidenceLevel: ["High", "Medium", "Low"].includes(judgment.confidenceLevel) ? judgment.confidenceLevel : "Medium",
    confidenceNote: cleanText(judgment.confidenceNote, "Based on available public information.")
  };
}

export default function normalizeAnalysis(analysis, requestedCompany) {
  return { ...normalizeFacts(analysis, requestedCompany), ...normalizeJudgment(analysis) };
}