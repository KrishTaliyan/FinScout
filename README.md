# FinScout — AI Investment Research Agent

An AI agent that takes a company name, researches it, and returns a clear **INVEST / PASS**
verdict with a full, reasoned breakdown — built for the InsideIIM × Altuni AI Labs
take-home assignment.
Live Link - https://fin-scout-phi.vercel.app/
---

## 1. Overview

FinScout is a two-stage AI investment research tool:

1. You type in a company name (or pick one of the suggested / recently-searched / watchlisted
   companies).
2. The agent researches the company (optionally grounded with live Google Search results),
   extracts a structured fact sheet (overview, financials, competitors, risks, opportunities,
   recent news), and — **before scoring anything** — checks whether this is actually a real,
   identifiable company.
3. If it's real, a second AI call produces the investment judgment: a 0–100 investment score
   (broken into financial health / market position / growth potential / safety sub-scores),
   an INVEST or PASS recommendation, pros/cons, and a written reasoning paragraph with a
   confidence level.
4. If it's **not** a real/recognizable company (gibberish, a random name, a made-up company),
   the agent skips scoring entirely and shows a "No information found" state instead of
   forcing a fake verdict.

On top of the core agent, the app includes:

- **Compare mode** — research two companies side-by-side in one view.
- **Follow-up Q&A** — ask questions about a company after the report loads; answered strictly
  from the researched context, falling back to general knowledge only for things like
  market cap / share price that the fact sheet doesn't cover.
- **Recent searches, Watchlist (favorites), and notes** — save companies, leave yourself a
  short note on why you're watching one, sort/filter the list by score or industry.
- **Score trend & history** — re-search a company you've already researched and see how its
  score has moved since last time, plus a small sparkline across your last several searches.
- **Portfolio simulator** — select multiple researched companies, assign each a conviction
  weight (1–10), and see a blended score / INVEST-vs-PASS lean across the group.
- **Stats overview, CSV export, PDF export, copy-to-clipboard report.**
- **"Companies worth researching"** suggestion chips to get started quickly.

> ⚠️ Educational research tool only — not financial advice. Every report and page in the app
> carries this disclaimer.

---

## 2. Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, `lucide-react` icons
- **Backend:** Node.js + Express
- **AI orchestration:** LangChain.js (`@langchain/google` — Gemini), structured output via
  **Zod** schemas
- **Validation:** Zod (request bodies + LLM structured outputs)
- **Grounding:** Google Search tool binding (via LangChain), with a timeout + fallback to
  ungrounded generation if search grounding is slow/unavailable
- **Persistence:** Browser `localStorage` (no database — see trade-offs below)

---

## 3. Project Structure

> The tree below reflects how the project is organized. If your actual root folder names
> differ (e.g. you named them something other than `client` / `server`), adjust the run
> commands in Section 4 accordingly.

```
finscout/
├── client/                          # React (Vite) frontend — package name "finscout-client"
│   └── src/
│       ├── components/              # ResultDashboard, ScoreMeter, LibraryPanel, SearchPanel,
│       │                            # CompareView, PortfolioSimulator, StatsOverview, etc.
│       ├── pages/
│       │   └── Home.jsx
│       ├── hooks/
│       │   ├── useStagedAnalyzeCompany.js
│       │   ├── useCompareCompanies.js
│       │   └── useLocalStorage.js
│       ├── services/
│       │   └── api.js
│       └── utils/
│           ├── report.js
│           └── generatePdfReport.js
│
└── server/                          # Node.js/Express backend
    └── src/
        ├── config/
        │   └── env.js
        ├── controllers/
        │   └── analyzeController.js
        ├── services/
        │   └── analysisService.js
        ├── langchain/
        │   ├── investmentAgent.js   # core agent: facts → judgment → follow-up Q&A
        │   └── schemas.js           # Zod schemas for facts / judgment / follow-up
        └── utils/
            ├── normalizeAnalysis.js
            └── httpError.js
```

---

## 4. How to Run It

### Prerequisites
- Node.js 18+
- A Google Gemini API key (for `@langchain/google`) — get one from
  [Google AI Studio](https://aistudio.google.com/).

### Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash        # or whichever Gemini model you're using — fill in the exact one you configured
GROUNDING_ENABLED=true               # set to "false" to disable live Google Search grounding
PORT=5000                            # fill in the actual port your server listens on
```

Start the server:

```bash
npm run dev        # or: node src/index.js — check your package.json "scripts" for the exact command
```

### Frontend

```bash
cd client
npm install
```

Create a `.env` file inside `client/` pointing at your backend:

```
VITE_API_BASE_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Open the printed local URL (Vite defaults to `http://localhost:5173`).

> **Note:** fill in the exact port numbers / script names above to match your actual
> `package.json` files before submitting — the values here are the conventional Vite/Express
> defaults used during development.

---

## 5. How It Works

### 5.1 Two-stage pipeline (facts → judgment)

Rather than one big prompt that researches *and* scores a company in a single call, the
agent is split into two LLM calls:

1. **`getCompanyFacts(company)`** — optionally grounds itself with a live Google Search tool
   call (with a ~7s timeout, falling back to ungrounded generation if search is slow), then
   extracts a structured fact sheet using a Zod schema (`companyFactsSchema`). This stage
   also decides `companyExists: boolean` — the single most important gate in the whole
   pipeline (see 5.2).
2. **`getInvestmentJudgment(company, facts)`** — takes the already-extracted facts (no
   re-research) and produces the scored verdict: sub-scores, overall investment score,
   INVEST/PASS recommendation, pros/cons, reasoning, and confidence level.

Splitting these two stages means:
- The UI can show a fast "facts preview" while the (slightly slower) judgment call is still
  running, instead of one long blocking wait.
- The judgment stage can be **skipped entirely** for garbage/fake input, saving an LLM call.

### 5.2 The "not a real company" gate

The most important design decision in the whole project: `companyExists` is decided
**during the facts stage, before any scoring happens.** If the model determines the input
isn't a real, identifiable company, `getInvestmentJudgment` short-circuits and returns a
zeroed-out, "PASS" result with `notFoundReason` as the explanation — no wasted LLM call, and
critically, **no fabricated fact sheet or score for something that doesn't exist.** The
frontend detects this via `factsData.companyExists === false` and renders a dedicated
"No information found" panel instead of the normal dashboard.

### 5.3 Structured output via Zod

Every LLM call uses `.withStructuredOutput(zodSchema)` so responses come back as validated,
typed JSON rather than free text to be parsed by hand. Each schema field carries a
`.describe()` instruction that doubles as an inline prompt for the model (e.g. *"riskLevel is
a SAFETY score: higher = safer"*), keeping the scoring rubric explicit and machine-checkable
rather than buried in prose.

### 5.4 Follow-up Q&A

After a report loads, the user can ask follow-up questions. This is a **separate, cheaper**
LLM call that does *not* re-research or re-call search grounding — it answers strictly from
the fact sheet + judgment JSON already on the frontend, falling back to the model's own
general knowledge only for things the fact sheet doesn't (and can't reasonably) cover, like
current share price. It never contradicts the researched fact sheet.

### 5.5 Frontend state & persistence

There's no backend database — Recent searches, Watchlist, notes, portfolio selections, and
score history all live in `localStorage` via a small `useLocalStorage` hook. A normalization
helper (`normalizeCompanyKey`) strips suffixes like "Inc"/"Corp"/"Ltd" and parenthetical
tickers so that "Microsoft" and "Microsoft Corp (MSFT)" are recognized as the same company
across searches — this prevents duplicate watchlist entries and makes score-trend
comparisons work correctly even when the model doesn't return an identical company name on
every run.

---

## 6. Key Decisions & Trade-offs

| Decision | Why | What it costs |
|---|---|---|
| Two-stage facts → judgment pipeline | Faster perceived load, and lets fake-company input skip the (more expensive) judgment call entirely | Slightly more orchestration code than a single combined prompt |
| `companyExists` gate decided in the *facts* prompt, not a separate call | Cheapest place to catch it — no wasted judgment call, no fabricated scores for garbage input | Relies on the facts-stage model being reliable at telling real vs fake companies apart; edge cases (obscure but real small companies) could occasionally be misjudged |
| Zod-validated structured output everywhere | Type-safe, self-documenting schemas double as the scoring rubric; invalid LLM output fails loudly instead of silently corrupting the UI | Slightly more upfront schema-writing vs. free-text prompting |
| Google Search grounding with a timeout + fallback | Keeps research current without letting a slow search call block the whole analysis | Grounded answers cost more latency when they succeed; ungrounded fallback may be less current |
| `localStorage` instead of a database | Zero backend infra for user data, works instantly, no auth needed for a take-home | No cross-device sync, no persistence if the user clears browser storage, no multi-user accounts |
| Portfolio simulator = weighted blend of *existing research scores* | Reuses data already generated, no new data source needed, still useful as a conviction-weighted view | It is **not** a real financial return/allocation simulator — no historical prices, no projected returns, no risk correlation between holdings. Explicitly labelled as a simulation of research conviction, not investment outcomes |
| CSV-only export (dropped JSON) | One-click "Download" is simpler for a non-technical reviewer than choosing a format; CSV opens directly in Excel/Sheets | Power users who wanted machine-readable JSON lose that option (easy to re-add if needed) |
| Follow-up Q&A never re-researches | Keeps it fast and cheap, and guarantees it never contradicts the shown report | Can't answer questions about facts genuinely outside both the fact sheet and the model's own general knowledge |

---

## 7. Example Runs

> **Fill this section in with real output before submitting** — paste in a screenshot or the
> actual JSON/report for each. Suggested companies to demonstrate the range of behavior:

**1. A well-known, data-rich company** (e.g. *Tesla* or *Microsoft*)
— demonstrates a full report: score breakdown, INVEST/PASS, pros/cons, reasoning, confidence.

**2. A real but less "obviously investable" company** (e.g. a smaller/regional company)
— demonstrates the model choosing PASS or a lower confidence level when the evidence is
thinner.

**3. Nonsense / a made-up name** (e.g. random characters or a fictional company)
— demonstrates the `companyExists: false` gate: no score, "No information found" panel with
a short reason instead of a fabricated verdict.

*(Paste screenshots or copy the returned JSON for each of the three above.)*

---

## 8. What I Would Improve With More Time

- **Real portfolio simulation** — pull actual historical price data (e.g. via a market-data
  API) to project real returns/allocations, instead of blending qualitative research scores.
- **Backend persistence & accounts** — move Recent/Watchlist/notes from `localStorage` into a
  real database behind user accounts, enabling cross-device sync.
- **Caching layer** — cache fact sheets for a short TTL so re-searching the same company
  within a session doesn't re-trigger a full research + grounding call.
- **Automated tests** — unit tests around the Zod schemas and the `companyExists` gate
  (including adversarial fake-company inputs), plus integration tests for the staged
  facts → judgment flow.
- **Streaming responses** — stream the facts/judgment text as it's generated instead of
  waiting for the full structured object, for a faster perceived response.
- **More LLM provider flexibility** — an adapter layer so the agent can swap between Gemini,
  Claude, or GPT models without touching the LangChain call sites.
- **Deployment** — deploy the frontend (Vercel) and backend, and share a live link.

---

## 9. AI Usage & Chat Logs

AI (Claude, via LangChain.js + Gemini) was used throughout — both *inside* the product (the
research agent itself) and *while building* the product (drafting components, debugging
validation errors, planning features). The full chat transcript covering the build process
— from the initial "no information found" fix through the portfolio simulator, watchlist
sorting/filtering, notes, and UI polish — is included alongside this README as required by
the assignment's bonus criteria.

---

## 10. Ambiguities & Assumptions Made

- The assignment leaves *what* the agent researches and *how* it presents results entirely
  open — I chose a fact-sheet + weighted sub-score model (financial health, market position,
  growth potential, safety) synthesized into one overall INVEST/PASS score, since it mirrors
  how a real analyst breaks down a judgment call rather than returning a single opaque number.
- Treated "decide whether to invest or pass" as requiring the agent to also handle the case
  where the input isn't a real company at all — the assignment doesn't say this explicitly,
  but scoring garbage input as if it were a real company seemed like the wrong behavior for
  a tool meant to be trustworthy.
- Chose `localStorage` over a database for all user-specific data (recent searches,
  watchlist, notes, portfolio simulator) to keep the assignment's scope to "one user, one
  browser" — noted above as a trade-off and listed under future improvements.
