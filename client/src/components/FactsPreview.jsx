import { Factory, MapPin, UserRound, Building2, Users, Landmark, LineChart, Loader2 } from "lucide-react";
import MetricCard from "./MetricCard.jsx";
import SectionCard from "./SectionCard.jsx";

function Chips({ items = [] }) {
  if (!items.length) return <p className="text-sm text-muted">Not available</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="rounded-sm border border-hairline bg-paper px-3 py-1 font-mono text-xs uppercase tracking-wide text-ink">
          {item}
        </span>
      ))}
    </div>
  );
}

function ListItems({ items = [] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FactsPreview({ facts }) {
  if (!facts) return null;

  return (
    <div className="animate-soft-rise space-y-5">
      <div className="panel overflow-hidden border-2 border-brass-500/40 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-hairline bg-ink text-paper">
            <Loader2 className="spinner" size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-600 dark:text-brass-500">
              Facts confirmed — calculating verdict
            </p>
            <p className="mt-1 text-sm text-muted">
              Scoring financial health, market position, growth, and risk for {facts.company}.
            </p>
          </div>
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <h2 className="font-display text-3xl font-semibold text-ink">{facts.company}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-ink/85">{facts.overview}</p>
      </div>

      <SectionCard title="Snapshot">
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <Factory className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>{facts.industry}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>{facts.headquarters}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserRound className="shrink-0 text-muted" size={16} aria-hidden="true" />
            <span>{facts.ceo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="shrink-0 text-brass-500" size={16} aria-hidden="true" />
            <span>Founded {facts.foundedYear}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-3 border-t border-hairline pt-4">
          <Users className="mt-1 shrink-0 text-muted" size={18} aria-hidden="true" />
          <Chips items={facts.competitors} />
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Financial Analysis">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Revenue Growth" value={facts.financialAnalysis?.revenueGrowth} />
            <MetricCard label="Profitability" value={facts.financialAnalysis?.profitability} />
            <MetricCard label="Debt Level" value={facts.financialAnalysis?.debtLevel} />
            <MetricCard label="Cash Flow" value={facts.financialAnalysis?.cashFlow} />
          </div>
        </SectionCard>
        <SectionCard title="Recent News Summary">
          <div className="flex gap-3">
            <LineChart className="mt-1 shrink-0 text-brass-500" size={19} aria-hidden="true" />
            <p>{facts.recentNews}</p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Growth Opportunities">
          <ListItems items={facts.growthOpportunities} />
        </SectionCard>
        <SectionCard title="Potential Risks">
          <ListItems items={facts.risks} />
        </SectionCard>
      </div>

      <SectionCard title="Market Position">
        <div className="flex gap-3">
          <Landmark className="mt-1 shrink-0 text-brass-500" size={19} aria-hidden="true" />
          <p>{facts.marketPosition}</p>
        </div>
      </SectionCard>
    </div>
  );
}