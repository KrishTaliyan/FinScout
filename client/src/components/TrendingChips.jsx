import { Landmark } from "lucide-react";

const TRENDING_COMPANIES = ["Nvidia", "Apple", "Tesla", "Microsoft", "Reliance Industries", "Infosys", "Amazon", "Zomato"];

export default function TrendingChips({ onSelect, disabled }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <Landmark size={13} aria-hidden="true" />
        Companies worth researching
      </span>
      {TRENDING_COMPANIES.map((company) => (
        <button
          key={company}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(company)}
          className="rounded-sm border border-hairline bg-paper px-3 py-1.5 font-mono text-sm text-ink transition hover:border-invest-600 hover:text-invest-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {company}
        </button>
      ))}
    </div>
  );
}