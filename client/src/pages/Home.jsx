import { useEffect, useState } from "react";
import ErrorBanner from "../components/ErrorBanner.jsx";
import LoadingState from "../components/LoadingState.jsx";
import Navbar from "../components/Navbar.jsx";
import ResultDashboard from "../components/ResultDashboard.jsx";
import FactsPreview from "../components/FactsPreview.jsx";
import NotFoundState from "../components/NotFoundState.jsx";
import SearchPanel from "../components/SearchPanel.jsx";
import CompareView from "../components/CompareView.jsx";
import CompareBoard from "../components/CompareBoard.jsx";
import FollowUpPanel from "../components/FollowUpPanel.jsx";
import TrendingChips from "../components/TrendingChips.jsx";
import LibraryPanel from "../components/LibraryPanel.jsx";
import PortfolioSimulator from "../components/PortfolioSimulator.jsx";
import StatsOverview from "../components/StatsOverview.jsx";
import useStagedAnalyzeCompany from "../hooks/useStagedAnalyzeCompany.js";
import useLocalStorage from "../hooks/useLocalStorage.js";

const MAX_LIBRARY_ITEMS = 8;
const MAX_PORTFOLIO_ITEMS = 8;
const MAX_SCORE_HISTORY = 10;

// Normalizes a company name so near-duplicate AI outputs ("Microsoft" vs
// "Microsoft Corp (MSFT)") are treated as the same company for dedup/lookup.
function normalizeCompanyKey(name = "") {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(inc|incorporated|corp|corporation|co|company|ltd|limited|plc|llc)\b\.?/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function isSameCompany(a, b) {
  return normalizeCompanyKey(a) === normalizeCompanyKey(b) && normalizeCompanyKey(a) !== "";
}

// Builds a library/favorites entry for `result`, carrying over notes and
// score history from `existingEntry` (the same company's previous entry,
// if any) so re-searching a company doesn't wipe out what was saved before.
function toLibraryEntry(result, existingEntry) {
  const previousHistory = existingEntry?.scoreHistory || [];
  return {
    company: result.company,
    recommendation: result.recommendation,
    investmentScore: result.investmentScore,
    industry: result.industry,
    savedAt: Date.now(),
    notes: existingEntry?.notes || "",
    scoreHistory: [...previousHistory, { score: result.investmentScore, date: Date.now() }].slice(
      -MAX_SCORE_HISTORY
    )
  };
}

export default function Home() {
  const [company, setCompany] = useState("");
  const [mode, setMode] = useState("single");
  const [history, setHistory] = useLocalStorage("finscout.recentSearches", []);
  const [library, setLibrary] = useLocalStorage("finscout.library", []);
  const [favorites, setFavorites] = useLocalStorage("finscout.favorites", []);
  const [scoreTrend, setScoreTrend] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [compareSeed, setCompareSeed] = useState("");
  const [portfolioItems, setPortfolioItems] = useState([]);
  const { facts, result, stage, error, runAnalysis, clearError } = useStagedAnalyzeCompany();

  useEffect(() => {
    if (stage !== "done" || !result?.company) return;

    // Compute trend + history BEFORE updating the library below, using the
    // library snapshot from this render (i.e. still the pre-update state).
    const previousEntry = library.find((item) => isSameCompany(item.company, result.company));

    if (previousEntry && typeof previousEntry.investmentScore === "number") {
      setScoreTrend({
        previousScore: previousEntry.investmentScore,
        delta: result.investmentScore - previousEntry.investmentScore
      });
    } else {
      setScoreTrend(null);
    }

    const previousHistory = previousEntry?.scoreHistory || [];
    setScoreHistory(
      [...previousHistory, { score: result.investmentScore, date: Date.now() }].slice(-MAX_SCORE_HISTORY)
    );

    setHistory((currentHistory) => {
      const nextHistory = [result.company, ...currentHistory.filter((item) => item !== result.company)];
      return nextHistory.slice(0, 5);
    });

    setLibrary((current) => {
      const existing = current.find((item) => isSameCompany(item.company, result.company));
      const withoutDuplicate = current.filter((item) => !isSameCompany(item.company, result.company));
      return [toLibraryEntry(result, existing), ...withoutDuplicate].slice(0, MAX_LIBRARY_ITEMS);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `library` is read intentionally
    // from this render's closure (the pre-update snapshot); adding it as a dep would cause
    // this effect to re-fire right after setLibrary and overwrite the trend with "no change".
  }, [stage, result, setHistory, setLibrary]);

  async function handleSubmit(event) {
    event.preventDefault();
    await runAnalysis(company);
  }

  function handleHistoryClick(nextCompany) {
    setCompany(nextCompany);
    clearError();
  }

  async function handleTrendingSelect(nextCompany) {
    setCompany(nextCompany);
    clearError();
    await runAnalysis(nextCompany);
  }

  function handleToggleFavorite() {
    if (!result?.company) return;
    setFavorites((current) => {
      const existingFavorite = current.find((item) => isSameCompany(item.company, result.company));
      if (existingFavorite) return current.filter((item) => !isSameCompany(item.company, result.company));
      const existingLibraryEntry = library.find((item) => isSameCompany(item.company, result.company));
      return [toLibraryEntry(result, existingLibraryEntry), ...current].slice(0, 20);
    });
  }

  function handleAddToCompare(nextCompany) {
    setCompareSeed(nextCompany);
    setMode("compare");
  }

  function handleTogglePortfolio(item) {
    setPortfolioItems((current) => {
      const exists = current.some((entry) => isSameCompany(entry.company, item.company));
      if (exists) return current.filter((entry) => !isSameCompany(entry.company, item.company));
      return [...current, item].slice(0, MAX_PORTFOLIO_ITEMS);
    });
  }

  function handleRemoveFromPortfolio(companyName) {
    setPortfolioItems((current) => current.filter((entry) => entry.company !== companyName));
  }

  function handleClearPortfolio() {
    setPortfolioItems([]);
  }

  function handleRemoveFromLibrary(companyName) {
    setLibrary((current) => current.filter((item) => item.company !== companyName));
  }

  function handleRemoveFromFavorites(companyName) {
    setFavorites((current) => current.filter((item) => item.company !== companyName));
  }

  function handleUpdateLibraryNote(companyName, note) {
    setLibrary((current) => current.map((item) => (item.company === companyName ? { ...item, notes: note } : item)));
  }

  function handleUpdateFavoritesNote(companyName, note) {
    setFavorites((current) =>
      current.map((item) => (item.company === companyName ? { ...item, notes: note } : item))
    );
  }

  const isFavorite =
    Boolean(result?.company) && favorites.some((item) => isSameCompany(item.company, result.company));
  const isBusy = stage === "facts" || stage === "judgment";

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)] lg:items-start">
          {/* LEFT COLUMN: hero + search controls */}
          <section className="animate-soft-rise space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-invest-700">
                AI-powered investment research
              </p>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold text-ink sm:text-5xl lg:text-6xl">
                Analyze a company with a clear invest-or-pass verdict.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-ink/70 sm:text-lg">
                FinScout turns company context, financial signals, competitive position, news, opportunities, and
                risks into an interview-ready research dashboard.
              </p>

              <div className="no-print mt-6 inline-flex rounded-sm border border-hairline bg-paper p-1">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={`rounded-sm px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide transition ${
                    mode === "single" ? "bg-ink text-paper" : "text-muted hover:text-ink"
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setMode("compare")}
                  className={`rounded-sm px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide transition ${
                    mode === "compare" ? "bg-ink text-paper" : "text-muted hover:text-ink"
                  }`}
                >
                  Compare
                </button>
              </div>
            </div>

            {mode === "single" && (
              <>
                <SearchPanel
                  company={company}
                  setCompany={setCompany}
                  isLoading={isBusy}
                  onSubmit={handleSubmit}
                  history={history}
                  onHistoryClick={handleHistoryClick}
                />
                <TrendingChips onSelect={handleTrendingSelect} disabled={isBusy} />
              </>
            )}
          </section>

          {/* RIGHT COLUMN: stats, library/watchlist, portfolio simulator */}
          {mode === "single" && (
            <div className="space-y-6">
              <StatsOverview library={library} favorites={favorites} />
              <LibraryPanel
                library={library}
                favorites={favorites}
                onSelect={handleHistoryClick}
                onAddToCompare={handleAddToCompare}
                portfolioSelection={portfolioItems.map((item) => item.company)}
                onTogglePortfolio={handleTogglePortfolio}
                onRemoveFromLibrary={handleRemoveFromLibrary}
                onRemoveFromFavorites={handleRemoveFromFavorites}
                onUpdateLibraryNote={handleUpdateLibraryNote}
                onUpdateFavoritesNote={handleUpdateFavoritesNote}
              />
              <PortfolioSimulator
                items={portfolioItems}
                onRemove={handleRemoveFromPortfolio}
                onClear={handleClearPortfolio}
              />
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6">
          {mode === "single" ? (
            <>
              <ErrorBanner message={error} onDismiss={clearError} />
              {stage === "facts" && <LoadingState />}
              {stage === "judgment" && <FactsPreview facts={facts} />}
              {stage === "notfound" && <NotFoundState company={facts?.company || company} reason={facts?.notFoundReason} />}
              {stage === "done" && (
                <>
                  <ResultDashboard
                    result={result}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                    scoreTrend={scoreTrend}
                    scoreHistory={scoreHistory}
                  />
                  <CompareBoard key={result.company} primaryResult={result} />
                  <FollowUpPanel key={`followup-${result.company}`} company={result.company} context={result} />
                </>
              )}
            </>
          ) : (
            <CompareView key={compareSeed || "blank"} initialCompanyA={compareSeed} />
          )}
        </div>
      </main>
    </div>
  );
}