export default function CompareResultCard({ result, error, isLoading }) {
  if (isLoading) {
    return (
      <div className="panel space-y-4 p-5">
        <div className="skeleton h-6 w-2/3 rounded-sm" />
        <div className="skeleton h-20 rounded-sm" />
        <div className="skeleton h-16 rounded-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel border-pass-600/40 bg-pass-50 p-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-wide text-pass-700">Could not analyze</p>
        <p className="mt-2 text-sm text-pass-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="panel p-5 text-sm text-muted">
        Enter a company and press Compare to see this side.
      </div>
    );
  }

  const isInvest = result.recommendation === "INVEST";
  const breakdown = result.scoreBreakdown || {};

  return (
    <div className="panel space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">{result.company}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted">{result.industry}</p>
        </div>
        <span
          className={`stamp text-sm ${
            isInvest ? "text-invest-600 dark:text-[#3FAE7C]" : "text-pass-600 dark:text-[#D97A7A]"
          }`}
        >
          {result.recommendation}
        </span>
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
    </div>
  );
}