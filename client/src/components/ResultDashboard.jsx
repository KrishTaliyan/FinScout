import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clipboard,
  Download,
  Factory,
  Gauge,
  Landmark,
  LineChart,
  MapPin,
  Minus,
  ShieldAlert,
  Users,
  UserRound,
  Zap
} from "lucide-react";
import MetricCard from "./MetricCard.jsx";
import SectionCard from "./SectionCard.jsx";
import ScoreSparkline from "./ScoreSparkline.jsx";
import { copyReportToClipboard } from "../utils/report.js";
import { generatePdfReport } from "../utils/generatePdfReport.js";

function ListItems({ items = [], tone = "invest" }) {
  const dotColor = {
    invest: "bg-invest-600",
    pass: "bg-pass-600",
    brass: "bg-brass-500"
  }[tone];

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Chips({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-muted">Not available</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-sm border border-hairline bg-paper px-3 py-1 font-mono text-xs uppercase tracking-wide text-ink"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ConfidenceBadge({ level, note }) {
  const styles = {
    High: "bg-invest-50 text-invest-700 border-invest-600/30",
    Medium: "bg-brass-50 text-brass-600 border-brass-500/30",
    Low: "bg-pass-50 text-pass-700 border-pass-600/30"
  }[level] || "bg-hairline/30 text-muted border-hairline";

  return (
    <span
      title={note}
      className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${styles}`}
    >
      <Gauge size={12} aria-hidden="true" />
      {level} confidence
    </span>
  );
}

function BreakdownBar({ label, value }) {
  const color = value >= 70 ? "bg-invest-600" : value >= 40 ? "bg-brass-500" : "bg-pass-600";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
        <span className="text-muted uppercase tracking-wide">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-hairline/60">
        <div className={`h-full rounded-sm ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ScoreTrendBadge({ scoreTrend }) {
  if (!scoreTrend) return null;

  const { delta, previousScore } = scoreTrend;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const tone = isUp ? "text-invest-600" : isDown ? "text-pass-600" : "text-muted";
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <p className={`mt-1.5 inline-flex items-center gap-1 font-mono text-xs font-semibold ${tone}`}>
      <Icon size={12} aria-hidden="true" />
      {delta === 0 ? `No change since last check (${previousScore})` : `${isUp ? "+" : ""}${delta} since last check (was ${previousScore})`}
    </p>
  );
}

export default function ResultDashboard({
  result,
  isFavorite = false,
  onToggleFavorite,
  scoreTrend = null,
  scoreHistory = []
}) {
  if (!result) {
    return null;
  }

  const breakdown = result.scoreBreakdown || {};
  const isInvest = result.recommendation === "INVEST";
  const numericScore = Math.max(0, Math.min(100, Number(result.investmentScore) || 0));

  return (
    <article className="print-area animate-soft-rise space-y-5">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-invest-700">
                Research file
              </p>
              <ConfidenceBadge level={result.confidenceLevel} note={result.confidenceNote} />
              {result.fromCache && (
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-paper px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <Zap size={12} aria-hidden="true" />
                  Cached
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{result.company}</h2>
          </div>

          <div className="no-print flex gap-2">
            <button
              type="button"
              className={`icon-button ${isFavorite ? "border-brass-500 text-brass-600" : ""}`}
              onClick={onToggleFavorite}
              aria-label={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
              title={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isFavorite ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => copyReportToClipboard(result)}
              aria-label="Copy report"
              title="Copy report"
            >
              <Clipboard size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => generatePdfReport(result)}
              aria-label="Download PDF"
              title="Download PDF"
            >
              <Download size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className={`panel overflow-hidden border-2 ${isInvest ? "border-invest-600/40" : "border-pass-600/40"}`}>
        <div
          className={`p-5 sm:p-6 ${
            isInvest ? "bg-invest-50/60 dark:bg-invest-600/10" : "bg-pass-50/60 dark:bg-pass-600/10"
          }`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <span
                className={`stamp text-xl sm:text-2xl ${
                  isInvest ? "text-invest-600 dark:text-[#3FAE7C]" : "text-pass-600 dark:text-[#D97A7A]"
                }`}
              >
                {result.recommendation}
              </span>
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Investment Score
                </p>
                <p className="font-display text-5xl font-semibold text-ink">
                  {numericScore}
                  <span className="ml-1 font-mono text-lg font-normal text-muted">/100</span>
                </p>
                <ScoreTrendBadge scoreTrend={scoreTrend} />
                <ScoreSparkline history={scoreHistory} />
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 lg:max-w-md">
              <BreakdownBar label="Financial" value={breakdown.financialHealth ?? 0} />
              <BreakdownBar label="Market" value={breakdown.marketPosition ?? 0} />
              <BreakdownBar label="Growth" value={breakdown.growthPotential ?? 0} />
              <BreakdownBar label="Safety" value={breakdown.riskLevel ?? 0} />
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-7 text-ink/90">{result.reasoning}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Pros">
          <ListItems items={result.pros} tone="invest" />
        </SectionCard>
        <SectionCard title="Cons">
          <ListItems items={result.cons} tone="brass" />
        </SectionCard>
      </div>

      <SectionCard title="Snapshot">
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Factory className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>{result.industry}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>{result.headquarters}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="shrink-0 text-muted" size={16} aria-hidden="true" />
            <span>{result.ceo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>Founded {result.foundedYear}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-3 border-t border-hairline pt-4">
          <Users className="mt-1 shrink-0 text-muted" size={18} aria-hidden="true" />
          <Chips items={result.competitors} />
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Financial Analysis">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Revenue Growth" value={result.financialAnalysis?.revenueGrowth} />
            <MetricCard label="Profitability" value={result.financialAnalysis?.profitability} />
            <MetricCard label="Debt Level" value={result.financialAnalysis?.debtLevel} />
            <MetricCard label="Cash Flow" value={result.financialAnalysis?.cashFlow} />
          </div>
        </SectionCard>

        <SectionCard title="Recent News Summary">
          <div className="flex gap-3">
            <LineChart className="mt-1 shrink-0 text-brass-500" size={19} aria-hidden="true" />
            <p>{result.recentNews}</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Growth Opportunities">
          <ListItems items={result.growthOpportunities} tone="invest" />
        </SectionCard>
        <SectionCard title="Potential Risks">
          <ListItems items={result.risks} tone="pass" />
        </SectionCard>
      </div>

      <SectionCard title="Company Profile">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Business Model" value={result.businessModel} />
          <MetricCard label="Products / Services" value={result.products} />
        </div>
        <div className="mt-4 flex gap-3 border-t border-hairline pt-4">
          <Landmark className="mt-1 shrink-0 text-brass-500" size={19} aria-hidden="true" />
          <p>{result.marketPosition}</p>
        </div>
        <p className="mt-4 leading-6 text-ink/90">{result.overview}</p>
      </SectionCard>

      <SectionCard title="Disclaimer">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-muted" size={19} aria-hidden="true" />
          <p className="text-sm leading-6 text-ink/80">
            Educational research only. Investment decisions should account for personal risk tolerance and
            independent due diligence.
          </p>
        </div>
      </SectionCard>
    </article>
  );
}