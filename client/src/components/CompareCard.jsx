import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";

export default function CompareCard({ company, status, result, error, onRemove, removable = true }) {
  const [expanded, setExpanded] = useState(false);

  if (status === "loading") {
    return (
      <div className="panel space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">{company}</p>
          <Loader2 className="spinner text-muted" size={16} aria-hidden="true" />
        </div>
        <div className="skeleton h-6 w-2/3 rounded-sm" />
        <div className="skeleton h-20 rounded-sm" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="panel border-pass-600/40 bg-pass-50 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-wide text-pass-700">
            Could not analyze {company}
          </p>
          {removable && onRemove && (
            <button type="button" onClick={onRemove} className="text-pass-700 hover:opacity-70" aria-label="Remove">
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-pass-700">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const isInvest = result.recommendation === "INVEST";
  const breakdown = result.scoreBreakdown || {};

  return (
    <div className="panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">{result.company}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted">{result.industry}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`stamp text-sm ${
              isInvest ? "text-invest-600 dark:text-[#3FAE7C]" : "text-pass-600 dark:text-[#D97A7A]"
            }`}
          >
            {result.recommendation}
          </span>
          {removable && onRemove && (
            <button type="button" onClick={onRemove} className="icon-button h-8 w-8" aria-label="Remove company">
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="font-display text-4xl font-semibold text-ink">
          {result.investmentScore}
          <span className="ml-1 font-mono text-sm font-normal text-muted">/100</span>
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-hairline/60">
          <div
            className={`h-full rounded-sm ${isInvest ? "bg-invest-600" : "bg-pass-600"}`}
            style={{ width: `${result.investmentScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted">Financial</span>
          <span className="font-semibold text-ink">{breakdown.financialHealth ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Market</span>
          <span className="font-semibold text-ink">{breakdown.marketPosition ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Growth</span>
          <span className="font-semibold text-ink">{breakdown.growthPotential ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Safety</span>
          <span className="font-semibold text-ink">{breakdown.riskLevel ?? 0}</span>
        </div>
      </div>

      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Top pro</p>
        <p className="mt-1 text-sm text-ink/85">{result.pros?.[0] || "Not available"}</p>
      </div>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Top risk</p>
        <p className="mt-1 text-sm text-ink/85">{result.risks?.[0] || "Not available"}</p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-hairline py-2 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition hover:border-invest-600 hover:text-invest-700"
      >
        {expanded ? "Show less" : "Read more"}
        {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-hairline pt-4 text-sm">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Overview</p>
            <p className="mt-1 leading-6 text-ink/85">{result.overview}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Reasoning</p>
            <p className="mt-1 leading-6 text-ink/85">{result.reasoning}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-invest-700">Pros</p>
              <ul className="mt-1 space-y-1">
                {(result.pros || []).map((item) => (
                  <li key={item} className="flex gap-2 text-ink/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-invest-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-pass-700">Cons</p>
              <ul className="mt-1 space-y-1">
                {(result.cons || []).map((item) => (
                  <li key={item} className="flex gap-2 text-ink/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-pass-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Growth opportunities</p>
              <ul className="mt-1 space-y-1">
                {(result.growthOpportunities || []).map((item) => (
                  <li key={item} className="flex gap-2 text-ink/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Risks</p>
              <ul className="mt-1 space-y-1">
                {(result.risks || []).map((item) => (
                  <li key={item} className="flex gap-2 text-ink/85">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-pass-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Business model</p>
              <p className="mt-1 text-ink/85">{result.businessModel}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Products</p>
              <p className="mt-1 text-ink/85">{result.products}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">Headquarters</p>
              <p className="mt-1 text-ink/85">{result.headquarters}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted">CEO</p>
              <p className="mt-1 text-ink/85">{result.ceo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}