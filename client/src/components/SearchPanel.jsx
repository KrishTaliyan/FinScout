import { Search, WandSparkles } from "lucide-react";

export default function SearchPanel({
  company,
  setCompany,
  isLoading,
  onSubmit,
  history,
  onHistoryClick
}) {
  const examples = ["Apple", "Tesla", "Microsoft"];
  const chips = history.length ? history : examples;

  return (
    <section className="panel no-print p-5 sm:p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label
          htmlFor="company"
          className="block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted"
        >
          Company name
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={19}
              aria-hidden="true"
            />
            <input
              id="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. Tesla, Reliance, Infosys"
              className="w-full rounded-sm border border-hairline bg-paper px-12 py-3.5 font-sans text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-invest-600 focus:ring-2 focus:ring-invest-600/20"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-invest-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-invest-600/40 disabled:cursor-not-allowed disabled:bg-muted sm:min-w-40"
          >
            <WandSparkles size={17} aria-hidden="true" />
            {isLoading ? "Analyzing" : "Analyze"}
          </button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {history.length ? "Recent" : "Try"}
        </span>
        {chips.slice(0, 5).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onHistoryClick(item)}
            className="rounded-sm border border-hairline bg-paper px-3 py-1.5 font-mono text-sm text-ink transition hover:border-invest-600 hover:text-invest-700"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}