import { jsPDF } from "jspdf";

const MARGIN = 48;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addPageIfNeeded(doc, y, neededHeight) {
  if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function addHeading(doc, text, y) {
  y = addPageIfNeeded(doc, y, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(143, 110, 46);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(216, 220, 209);
  doc.line(MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4);
  return y + 20;
}

function addParagraph(doc, text, y, options = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(options.fontSize || 10);
  doc.setTextColor(...(options.color || [23, 32, 24]));
  const lines = doc.splitTextToSize(text || "Not available", CONTENT_WIDTH);
  for (const line of lines) {
    y = addPageIfNeeded(doc, y, 14);
    doc.text(line, MARGIN, y);
    y += 14;
  }
  return y + 6;
}

function addBulletList(doc, items, y) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(23, 32, 24);
  (items.length ? items : ["Not available"]).forEach((item) => {
    const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH - 10);
    lines.forEach((line) => {
      y = addPageIfNeeded(doc, y, 14);
      doc.text(line, MARGIN, y);
      y += 14;
    });
  });
  return y + 6;
}

export function generatePdfReport(result) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(19, 32, 24);
  doc.text(result.company, MARGIN, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(91, 102, 96);
  doc.text(`FinScout Research File . Generated ${new Date().toLocaleString()}`, MARGIN, y);
  y += 24;

  const isInvest = result.recommendation === "INVEST";
  const bannerColor = isInvest ? [234, 243, 236] : [245, 233, 231];
  const borderColor = isInvest ? [20, 107, 68] : [139, 46, 46];

  doc.setFillColor(...bannerColor);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 60, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...borderColor);
  doc.text(result.recommendation, MARGIN + 16, y + 36);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(19, 32, 24);
  doc.text(`${result.investmentScore}/100`, MARGIN + 160, y + 38);

  const breakdown = result.scoreBreakdown || {};
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(91, 102, 96);
  doc.text(
    `Financial ${breakdown.financialHealth ?? 0}   Market ${breakdown.marketPosition ?? 0}   Growth ${breakdown.growthPotential ?? 0}   Safety ${breakdown.riskLevel ?? 0}   .   ${result.confidenceLevel} confidence`,
    MARGIN + 16,
    y + 52
  );

  y += 80;

  y = addHeading(doc, "Reasoning", y);
  y = addParagraph(doc, result.reasoning, y);

  y = addHeading(doc, "Overview", y);
  y = addParagraph(doc, result.overview, y);

  y = addHeading(doc, "Company Profile", y);
  y = addParagraph(doc, `Industry: ${result.industry}`, y);
  y = addParagraph(doc, `Business Model: ${result.businessModel}`, y);
  y = addParagraph(doc, `Products/Services: ${result.products}`, y);
  y = addParagraph(
    doc,
    `Headquarters: ${result.headquarters}   .   Founded: ${result.foundedYear}   .   CEO: ${result.ceo}`,
    y
  );
  y = addParagraph(doc, `Market Position: ${result.marketPosition}`, y);
  y = addParagraph(doc, `Competitors: ${(result.competitors || []).join(", ") || "Not available"}`, y);

  y = addHeading(doc, "Financial Analysis", y);
  y = addParagraph(doc, `Revenue Growth: ${result.financialAnalysis?.revenueGrowth}`, y);
  y = addParagraph(doc, `Profitability: ${result.financialAnalysis?.profitability}`, y);
  y = addParagraph(doc, `Debt Level: ${result.financialAnalysis?.debtLevel}`, y);
  y = addParagraph(doc, `Cash Flow: ${result.financialAnalysis?.cashFlow}`, y);

  y = addHeading(doc, "Recent News", y);
  y = addParagraph(doc, result.recentNews, y);

  y = addHeading(doc, "Growth Opportunities", y);
  y = addBulletList(doc, result.growthOpportunities, y);

  y = addHeading(doc, "Potential Risks", y);
  y = addBulletList(doc, result.risks, y);

  y = addHeading(doc, "Pros", y);
  y = addBulletList(doc, result.pros, y);

  y = addHeading(doc, "Cons", y);
  y = addBulletList(doc, result.cons, y);

  y = addHeading(doc, "Disclaimer", y);
  y = addParagraph(
    doc,
    "Educational research only. Investment decisions should account for personal risk tolerance and independent due diligence.",
    y,
    { fontSize: 9, color: [91, 102, 96] }
  );

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`FinScout . Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN - 80, PAGE_HEIGHT - 24);
  }

  const filename = `${result.company.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-finscout-report.pdf`;
  doc.save(filename);
}