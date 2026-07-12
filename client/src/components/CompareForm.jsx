import { GitCompareArrows } from "lucide-react";

export default function CompareForm({ companyA, companyB, setCompanyA, setCompanyB, isLoading, onSubmit }) {
  return (
    <section className="panel no-print p-5 sm:p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Compare two companies
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={companyA}
            onChange={(event) => setCompanyA(event.target.value)}
            placeholder="First company, e.g. Tesla"
            className="w-full rounded-sm border border-hairline bg-paper px-4 py-3.5 font-sans text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-invest-600 focus:ring-2 focus:ring-invest-600/20"
            disabled={isLoading}
            autoComplete="off"
          />
          <input
            value={companyB}
            onChange={(event) => setCompanyB(event.target.value)}
            placeholder="Second company, e.g. Rivian"
            className="w-full rounded-sm border border-hairline bg-paper px-4 py-3.5 font-sans text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-invest-600 focus:ring-2 focus:ring-invest-600/20"
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-invest-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-invest-600/40 disabled:cursor-not-allowed disabled:bg-muted sm:w-auto"
        >
          <GitCompareArrows size={17} aria-hidden="true" />
          {isLoading ? "Comparing" : "Compare"}
        </button>
      </form>
    </section>
  );
}