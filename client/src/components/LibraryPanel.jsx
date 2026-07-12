import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  BookmarkCheck,
  Clock,
  Download,
  Filter,
  GitCompare,
  History,
  StickyNote,
  Trash2
} from "lucide-react";

function toCsv(items) {
  const headers = ["company", "industry", "recommendation", "investmentScore", "notes", "savedAt"];
  const rows = items.map((item) =>
    headers.map((key) => `"${String(item[key] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function LibraryRow({ item, onSelect, onAddToCompare, isInPortfolio, onTogglePortfolio, onRemove, onUpdateNote }) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(item.notes || "");
  const isInvest = item.recommendation === "INVEST";

  function handleSaveNote() {
    onUpdateNote(item.company, draftNote.trim());
    setIsEditingNote(false);
  }

  function handleCancelNote() {
    setDraftNote(item.notes || "");
    setIsEditingNote(false);
  }

  return (
    <div className="rounded-sm border border-hairline bg-paper">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isInPortfolio}
          onChange={() => onTogglePortfolio(item)}
          className="h-4 w-4 shrink-0 accent-invest-600"
          aria-label={`Add ${item.company} to portfolio simulator`}
          title="Add to portfolio simulator"
        />

        <button
          type="button"
          onClick={() => onSelect(item.company)}
          className="flex w-full min-w-0 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{item.company}</p>
            <p className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">{item.industry}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-xs font-semibold text-ink">{item.investmentScore}</span>
            <span
              className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                isInvest ? "bg-invest-50 text-invest-700" : "bg-pass-50 text-pass-700"
              }`}
            >
              {item.recommendation}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onAddToCompare(item.company)}
          className="icon-button shrink-0"
          aria-label={`Add ${item.company} to Compare`}
          title="Add to Compare"
        >
          <GitCompare size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setIsEditingNote((current) => !current)}
          className={`icon-button shrink-0 ${item.notes ? "text-brass-600" : ""}`}
          aria-label={item.notes ? `Edit note for ${item.company}` : `Add note for ${item.company}`}
          title={item.notes ? "Edit note" : "Add note"}
        >
          <StickyNote size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onRemove(item.company)}
          className="icon-button shrink-0"
          aria-label={`Remove ${item.company} from this list`}
          title="Remove"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      {!isEditingNote && item.notes && (
        <button
          type="button"
          onClick={() => setIsEditingNote(true)}
          className="block w-full border-t border-hairline px-3 py-2 text-left text-xs italic leading-5 text-ink/70 transition hover:bg-hairline/10"
        >
          "{item.notes}"
        </button>
      )}

      {isEditingNote && (
        <div className="border-t border-hairline p-3">
          <textarea
            value={draftNote}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Why are you watching this one?"
            rows={2}
            maxLength={200}
            autoFocus
            className="w-full resize-none rounded-sm border border-hairline bg-paper px-2.5 py-2 font-sans text-xs text-ink outline-none focus:border-invest-600"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelNote}
              className="rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-muted transition hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              className="rounded-sm bg-ink px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-paper transition hover:bg-invest-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPanel({
  library = [],
  favorites = [],
  onSelect,
  onAddToCompare,
  portfolioSelection = [],
  onTogglePortfolio,
  onRemoveFromLibrary,
  onRemoveFromFavorites,
  onUpdateLibraryNote,
  onUpdateFavoritesNote
}) {
  const [tab, setTab] = useState("recent");
  const [sortBy, setSortBy] = useState("newest");
  const [industryFilter, setIndustryFilter] = useState("all");

  const items = tab === "recent" ? library : favorites;
  const handleRemove = tab === "recent" ? onRemoveFromLibrary : onRemoveFromFavorites;
  const handleUpdateNote = tab === "recent" ? onUpdateLibraryNote : onUpdateFavoritesNote;

  const industries = useMemo(() => {
    const set = new Set(items.map((item) => item.industry).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const visibleItems = useMemo(() => {
    const filtered = industryFilter === "all" ? items : items.filter((item) => item.industry === industryFilter);
    const sorted = [...filtered];

    if (sortBy === "score-desc") sorted.sort((a, b) => (b.investmentScore ?? 0) - (a.investmentScore ?? 0));
    else if (sortBy === "score-asc") sorted.sort((a, b) => (a.investmentScore ?? 0) - (b.investmentScore ?? 0));
    else if (sortBy === "az") sorted.sort((a, b) => a.company.localeCompare(b.company));
    else sorted.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0)); // newest

    return sorted;
  }, [items, industryFilter, sortBy]);

  function handleTabChange(nextTab) {
    setTab(nextTab);
    setIndustryFilter("all");
  }

  function handleDownload() {
    if (!visibleItems.length) return;
    downloadFile(toCsv(visibleItems), `finscout-${tab}.csv`, "text/csv;charset=utf-8;");
  }

  return (
    <section className="panel no-print p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("recent")}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition ${
              tab === "recent" ? "bg-ink text-paper" : "text-muted hover:text-ink"
            }`}
          >
            <History size={13} aria-hidden="true" />
            Recent
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("favorites")}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition ${
              tab === "favorites" ? "bg-ink text-paper" : "text-muted hover:text-ink"
            }`}
          >
            <BookmarkCheck size={13} aria-hidden="true" />
            Watchlist
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!visibleItems.length}
          className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-paper px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-muted transition hover:border-invest-600 hover:text-invest-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Download this list as a CSV file"
        >
          <Download size={13} aria-hidden="true" />
          Download
        </button>
      </div>

     {items.length > 0 && (
  <div className="mt-4 flex flex-wrap items-center gap-2">
    <div
      className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-paper px-2.5 py-1.5"
      style={{ width: "fit-content", maxWidth: "180px" }}
    >
      <ArrowUpDown size={12} className="shrink-0 text-muted" aria-hidden="true" />
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value)}
        className="border-none bg-transparent p-0 font-mono text-[11px] uppercase tracking-wide text-ink outline-none"
        style={{ width: "auto", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        aria-label="Sort list"
      >
        <option value="newest" style={{ color: "#1a1a1a", background: "#ffffff" }}>
          Newest first
        </option>
        <option value="score-desc" style={{ color: "#1a1a1a", background: "#ffffff" }}>
          Score: high to low
        </option>
        <option value="score-asc" style={{ color: "#1a1a1a", background: "#ffffff" }}>
          Score: low to high
        </option>
        <option value="az" style={{ color: "#1a1a1a", background: "#ffffff" }}>
          A–Z
        </option>
      </select>
    </div>

    {industries.length > 1 && (
      <div
        className="inline-flex items-center gap-1.5 rounded-sm border border-hairline bg-paper px-2.5 py-1.5"
        style={{ width: "fit-content", maxWidth: "180px" }}
      >
        <Filter size={12} className="shrink-0 text-muted" aria-hidden="true" />
        <select
          value={industryFilter}
          onChange={(event) => setIndustryFilter(event.target.value)}
          className="border-none bg-transparent p-0 font-mono text-[11px] uppercase tracking-wide text-ink outline-none"
          style={{
            width: "auto",
            maxWidth: "150px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
          aria-label="Filter by industry"
        >
          <option value="all" style={{ color: "#1a1a1a", background: "#ffffff" }}>
            All industries
          </option>
          {industries.map((industry) => (
            <option key={industry} value={industry} style={{ color: "#1a1a1a", background: "#ffffff" }}>
              {industry}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>
)}
      <div className="mt-4 space-y-2">
        {items.length === 0 && (
          <p className="flex items-center gap-2 font-mono text-xs text-muted">
            <Clock size={14} aria-hidden="true" />
            {tab === "recent" ? "Your last analyses will appear here." : "Bookmark a report to add it here."}
          </p>
        )}

        {items.length > 0 && visibleItems.length === 0 && (
          <p className="font-mono text-xs text-muted">No companies match this filter.</p>
        )}

        {visibleItems.map((item) => (
          <LibraryRow
            key={`${tab}-${item.company}`}
            item={item}
            onSelect={onSelect}
            onAddToCompare={onAddToCompare}
            isInPortfolio={portfolioSelection.includes(item.company)}
            onTogglePortfolio={onTogglePortfolio}
            onRemove={handleRemove}
            onUpdateNote={handleUpdateNote}
          />
        ))}
      </div>
    </section>
  );
}