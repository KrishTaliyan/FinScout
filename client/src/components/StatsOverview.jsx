import { useMemo } from "react";
import { Sparkles } from "lucide-react";

function normalizeCompanyKey(name = "") {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(inc|incorporated|corp|corporation|co|company|ltd|limited|plc|llc)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export default function StatsOverview({ library = [], favorites = [] }) {
  const stats = useMemo(() => {
    const merged = new Map();
    [...library, ...favorites].forEach((item) => {
      const key = normalizeCompanyKey(item.company);
      if (key && !merged.has(key)) merged.set(key, item);
    });
    const unique = Array.from(merged.values());

    const total = unique.length;
    const investCount = unique.filter((item) => item.recommendation === "INVEST").length;
    const passCount = total - investCount;
    const averageScore = total
      ? Math.round(unique.reduce((sum, item) => sum + (Number(item.investmentScore) || 0), 0) / total)
      : 0;

    const industryCounts = {};
    unique.forEach((item) => {
      if (!item.industry) return;
      industryCounts[item.industry] = (industryCounts[item.industry] || 0) + 1;
    });
    const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { total, investCount, passCount, averageScore, topIndustry };
  }, [library, favorites]);

  if (stats.total === 0) return null;

  return (
    <section className="panel no-print p-5 sm:p-6">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        <Sparkles size={14} aria-hidden="true" />
        Your Research at a Glance
      </span>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-sm border border-hairline bg-paper p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Companies tracked</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{stats.total}</p>
        </div>
        <div className="rounded-sm border border-hairline bg-paper p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Average score</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">{stats.averageScore}</p>
        </div>
        <div className="rounded-sm border border-hairline bg-paper p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Invest / Pass</p>
          <p className="mt-1 font-mono text-sm font-semibold text-ink">
            <span className="text-invest-600">{stats.investCount} INVEST</span>
            {" · "}
            <span className="text-pass-600">{stats.passCount} PASS</span>
          </p>
        </div>
        <div className="rounded-sm border border-hairline bg-paper p-3">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Top industry</p>
          <p className="mt-1 truncate font-mono text-sm font-semibold text-ink" title={stats.topIndustry}>
            {stats.topIndustry}
          </p>
        </div>
      </div>
    </section>
  );
}