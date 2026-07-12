export function buildReportText(report) {
  if (!report) {
    return "";
  }

  const list = (items = []) => items.map((item) => `- ${item}`).join("\n");

  return [
    `FinScout Investment Research Report`,
    `Company: ${report.company}`,
    `Recommendation: ${report.recommendation}`,
    `Investment Score: ${report.investmentScore}/100`,
    "",
    "Overview",
    report.overview,
    "",
    `Industry: ${report.industry}`,
    `Business Model: ${report.businessModel}`,
    `Products/Services: ${report.products}`,
    `Headquarters: ${report.headquarters}`,
    `Founded Year: ${report.foundedYear}`,
    `CEO: ${report.ceo}`,
    `Market Position: ${report.marketPosition}`,
    "",
    "Financial Analysis",
    `Revenue Growth: ${report.financialAnalysis?.revenueGrowth}`,
    `Profitability: ${report.financialAnalysis?.profitability}`,
    `Debt Level: ${report.financialAnalysis?.debtLevel}`,
    `Cash Flow: ${report.financialAnalysis?.cashFlow}`,
    "",
    "Recent News Summary",
    report.recentNews,
    "",
    "Growth Opportunities",
    list(report.growthOpportunities),
    "",
    "Potential Risks",
    list(report.risks),
    "",
    "Pros",
    list(report.pros),
    "",
    "Cons",
    list(report.cons),
    "",
    "Detailed Reasoning",
    report.reasoning
  ].join("\n");
}

export async function copyReportToClipboard(report) {
  const text = buildReportText(report);
  await navigator.clipboard.writeText(text);
}
