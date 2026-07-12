import { useMemo, useState } from "react";
import { Layers, RotateCcw, X } from "lucide-react";

function clampWeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 5;
  return Math.min(10, Math.max(1, Math.round(num)));
}

export default function PortfolioSimulator({ items = [], onRemove, onClear }) {
  const [weights, setWeights] = useState({});

  const getWeight = (company) => weights[company] ?? 5;

  function handleWeightChange(company, value) {
    setWeights((current) => ({ ...current, [company]: clampWeight(value) }));
  }

  const { blendedScore, investShare } = useMemo(() => {
    if (!items.length) return { blendedScore: 0, investShare: 0 };

    let weightedScoreSum = 0;
    let weightedInvestSum = 0;
    let total = 0;

    items.forEach((item) => {
      const weight = weights[item.company] ?? 5;
      total += weight;
      weightedScoreSum += weight * (Number(item.investmentScore) || 0);
      if (item.recommendation === "INVEST") weightedInvestSum += weight;
    });

    return {
      blendedScore: total > 0 ? Math.round(weightedScoreSum / total) : 0,
      investShare: total > 0 ? Math.round((weightedInvestSum / total) * 100) : 0
    };
  }, [items, weights]);

  if (!items.length) return null;

  const isInvestLeaning = investShare >= 50;

  return (
    <section className="panel no-print p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <Layers size={14} aria-hidden="true" />
          Portfolio Simulator
        </span>
        <button
          type="button"
          onClick={() => setWeights({})}
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-muted transition hover:text-ink"
          title="Reset weights to equal"
        >
          <RotateCcw size={12} aria-hidden="true" />
          Reset weights
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.company}
            className="flex items-center gap-3 rounded-sm border border-hairline bg-paper px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.company}</p>
              <p className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">
                Score {item.investmentScore} · {item.recommendation}
              </p>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={getWeight(item.company)}
              onChange={(event) => handleWeightChange(item.company, event.target.value)}
              className="w-24 accent-invest-600"
              aria-label={`${item.company} conviction weight`}
            />
            <span className="w-5 shrink-0 text-right font-mono text-xs text-muted">{getWeight(item.company)}</span>
            <button
              type="button"
              onClick={() => onRemove(item.company)}
              className="icon-button shrink-0"
              aria-label={`Remove ${item.company} from portfolio`}
              title="Remove"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Blended Score</p>
          <p className="font-display text-4xl font-semibold text-ink">
            {blendedScore}
            <span className="ml-1 font-mono text-base font-normal text-muted">/100</span>
          </p>
          <p
            className={`mt-1 font-mono text-xs font-semibold uppercase tracking-wide ${
              isInvestLeaning ? "text-invest-600" : "text-pass-600"
            }`}
          >
            {isInvestLeaning ? "INVEST-leaning" : "PASS-leaning"} · {investShare}% weighted INVEST
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="self-start rounded-sm border border-hairline bg-paper px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted transition hover:border-pass-600 hover:text-pass-700 sm:self-auto"
        >
          Clear portfolio
        </button>
      </div>

      <p className="mt-4 text-xs leading-5 text-ink/60">
        Weights represent relative conviction (1–10), not real allocation percentages. Educational simulation only —
        not portfolio advice.
      </p>
    </section>
  );
}