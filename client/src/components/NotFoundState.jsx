import { SearchX } from "lucide-react";

export default function NotFoundState({ company, reason }) {
  return (
    <div className="panel animate-soft-rise border-2 border-hairline p-8 text-center sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hairline/30">
        <SearchX className="text-muted" size={26} aria-hidden="true" />
      </div>
      <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        No information found
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
        {company ? `We couldn't find "${company}"` : "We couldn't find that company"}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/70">
        {reason ||
          "This doesn't appear to be a real, identifiable company. Double-check the spelling, or try a different name."}
      </p>
    </div>
  );
}