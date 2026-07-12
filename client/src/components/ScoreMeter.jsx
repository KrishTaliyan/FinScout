export default function ScoreMeter({ score = 0, recommendation = "PASS" }) {
  const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
  const isInvest = recommendation === "INVEST";

  const tone = isInvest
    ? { text: "text-invest-600 dark:text-[#3FAE7C]", bar: "bg-invest-600 dark:bg-[#3FAE7C]" }
    : { text: "text-pass-600 dark:text-[#D97A7A]", bar: "bg-pass-600 dark:bg-[#D97A7A]" };

  return (
    <div className="soft-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Investment Score
          </p>
          <p className="mt-2 font-display text-5xl font-semibold text-ink">
            {numericScore}
            <span className="ml-1 font-mono text-base font-normal text-muted">/100</span>
          </p>
        </div>

        <span className={`stamp ${tone.text}`}>{recommendation}</span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-sm bg-hairline/60">
        <div
          className={`h-full rounded-sm ${tone.bar} transition-all duration-700`}
          style={{ width: `${numericScore}%` }}
        />
      </div>
    </div>
  );
}