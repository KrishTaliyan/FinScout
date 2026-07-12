import { useState } from "react";
import { GitCompareArrows, Plus } from "lucide-react";
import CompareCard from "./CompareCard.jsx";
import { analyzeCompany, getApiErrorMessage } from "../services/api.js";

export default function CompareBoard({ primaryResult }) {
  const [extras, setExtras] = useState([]);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  async function addCompany(companyName) {
    const trimmed = companyName.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === primaryResult?.company?.toLowerCase()) return;
    if (extras.some((item) => item.company.toLowerCase() === trimmed.toLowerCase())) return;

    const id = `${trimmed}-${Date.now()}`;
    setExtras((current) => [...current, { id, company: trimmed, status: "loading", result: null, error: "" }]);
    setInput("");
    setShowInput(false);

    try {
      const result = await analyzeCompany(trimmed);
      setExtras((current) => current.map((item) => (item.id === id ? { ...item, status: "done", result } : item)));
    } catch (err) {
      setExtras((current) =>
        current.map((item) => (item.id === id ? { ...item, status: "error", error: getApiErrorMessage(err) } : item))
      );
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    addCompany(input);
  }

  function removeCompany(id) {
    setExtras((current) => current.filter((item) => item.id !== id));
  }

  if (!primaryResult) return null;

  return (
    <section className="no-print space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <GitCompareArrows size={15} aria-hidden="true" />
          Side-by-side comparison
        </h3>

        {!showInput && (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-paper px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition hover:border-invest-600 hover:text-invest-700"
          >
            <Plus size={14} aria-hidden="true" />
            Compare another company
          </button>
        )}
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Company to compare against, e.g. Rivian"
            className="w-full rounded-sm border border-hairline bg-paper px-4 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-invest-600 focus:ring-2 focus:ring-invest-600/20"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-sm bg-ink px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-paper transition hover:bg-invest-700 disabled:cursor-not-allowed disabled:bg-muted"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setInput("");
            }}
            className="shrink-0 rounded-sm border border-hairline px-3 py-2.5 font-mono text-xs text-muted transition hover:text-ink"
          >
            Cancel
          </button>
        </form>
      )}

      {extras.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <CompareCard company={primaryResult.company} status="done" result={primaryResult} removable={false} />
          {extras.map((item) => (
            <CompareCard
              key={item.id}
              company={item.company}
              status={item.status}
              result={item.result}
              error={item.error}
              onRemove={() => removeCompany(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}