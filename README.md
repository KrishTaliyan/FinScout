# FinScout - AI-Powered Investment Research Agent

FinScout is a full-stack AI research app that accepts a company name, runs a LangChain.js + Gemini research workflow, and returns a structured investment dashboard with an `INVEST` or `PASS` recommendation.

The UI is intentionally light, clean, and professional: soft panels, calm spacing, a readable score meter, and responsive cards built for interview demos.

## Features

- Company search with frontend validation
- Express REST API with Zod request validation
- LangChain.js investment agent using Gemini via `@langchain/google`
- Google Search grounding when Gemini supports it, with a model-only fallback
- Structured JSON output validated by Zod
- Result dashboard with overview, industry, business model, products, HQ, founded year, CEO, market position, financial analysis, news, opportunities, risks, pros, cons, score, recommendation, and reasoning
- Loading state, API error handling, recent searches, copy report, and browser PDF export
- Modular client and server folders

## Tech Stack

Frontend: React.js, Vite, Tailwind CSS, React Router, Axios, Lucide React

Backend: Node.js, Express.js, Zod, dotenv, cors, nodemon

AI: LangChain.js, Google Gemini API through `@langchain/google`

## Folder Structure

```text
FinScout/
  client/
    src/
      components/
      hooks/
      pages/
      services/
      utils/
  server/
    src/
      config/
      controllers/
      langchain/
      middleware/
      routes/
      services/
      utils/
    tests/
```

## Installation

```bash
npm run install:all
```

Create environment files:

```bash
cp .env.example server/.env
cp .env.example client/.env
```

Update `server/.env`:

```env
GOOGLE_API_KEY=your-google-ai-studio-api-key
GEMINI_MODEL=gemini-2.5-flash
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Update `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running The Project

```bash
npm run dev
```

Client: `http://localhost:5173`

Server: `http://localhost:5000`

## API Endpoints

`GET /health`

Returns API status and configured model.

`POST /analyze`

Also available at `POST /api/analyze`.

Request:

```json
{
  "company": "Tesla"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "company": "Tesla",
    "overview": "...",
    "industry": "...",
    "businessModel": "...",
    "products": "...",
    "headquarters": "...",
    "foundedYear": "...",
    "ceo": "...",
    "marketPosition": "...",
    "financialAnalysis": {
      "revenueGrowth": "...",
      "profitability": "...",
      "debtLevel": "...",
      "cashFlow": "..."
    },
    "recentNews": "...",
    "growthOpportunities": ["..."],
    "risks": ["..."],
    "pros": ["..."],
    "cons": ["..."],
    "investmentScore": 85,
    "recommendation": "INVEST",
    "reasoning": "..."
  }
}
```

## Architecture

The frontend owns the user experience: form state, loading state, local search history, report actions, and dashboard rendering. API communication is isolated in `client/src/services/api.js`.

The backend owns validation, AI orchestration, response normalization, and error handling. The route calls a controller, the controller calls a service, and the service calls the LangChain agent.

## LangChain Workflow

`server/src/langchain/investmentAgent.js` uses `ChatGoogle` from `@langchain/google/node`.

The workflow has two stages:

1. Research notes: Gemini is invoked with Google Search grounding where supported. If grounding is unavailable, the app falls back to a normal Gemini call.
2. Structured analysis: Gemini is invoked with `withStructuredOutput(investmentAnalysisSchema)`, then the response is validated and normalized before returning to the client.

The prompt asks the model to reason internally and return only the structured report fields, so the app gets clean JSON without exposing private chain-of-thought.

## Important Files

- `client/src/pages/Home.jsx`: Main app page; coordinates search, history, loading, errors, and results.
- `client/src/components/SearchPanel.jsx`: Company input, analyze button, and recent searches.
- `client/src/components/ResultDashboard.jsx`: Full investment report UI.
- `client/src/components/ScoreMeter.jsx`: Score progress bar and recommendation badge.
- `client/src/hooks/useAnalyzeCompany.js`: Encapsulates API request state.
- `client/src/services/api.js`: Axios client and API error formatting.
- `server/src/app.js`: Express app, CORS, JSON parsing, health checks, routes, and error middleware.
- `server/src/routes/analyzeRoutes.js`: `POST /analyze` route.
- `server/src/controllers/analyzeController.js`: HTTP controller for analysis requests.
- `server/src/services/analysisService.js`: Business service that normalizes input and calls the AI layer.
- `server/src/langchain/investmentAgent.js`: LangChain + Gemini research and structured-output workflow.
- `server/src/langchain/schemas.js`: Zod schemas for request and AI response validation.
- `server/src/utils/normalizeAnalysis.js`: Cleans strings, arrays, scores, and recommendation values.
- `server/src/middleware/errorHandler.js`: Consistent JSON error responses.

## Interview Notes

Useful questions to prepare:

- Why split routes, controllers, services, and LangChain logic?
- Why validate both user input and AI output with Zod?
- Why use structured output instead of parsing plain text?
- How does the app behave when Gemini Search grounding is unavailable?
- Why keep the Gemini API key only on the backend?
- How would you add authentication, caching, or a database?
- What are the risks of AI-generated investment analysis?

## Design Decisions

- Light background with subtle texture for a polished but readable interface.
- Cards use restrained borders and shadows so the dashboard feels professional, not decorative.
- `INVEST` and `PASS` use familiar green and red badges.
- Recent searches stay in localStorage to avoid needing a database for the internship version.
- Browser print is used for PDF export to avoid extra dependencies.

## Trade-Offs

- The app does not store reports on the backend. This keeps the architecture simple, but reports disappear when the page is refreshed unless re-run.
- AI output is validated and normalized, but investment analysis still depends on model quality and available data.
- Search grounding availability depends on the selected Gemini model and account capability.

## Testing

Run server schema and normalizer tests:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

## Deployment

Frontend on Vercel:

1. Set root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add `VITE_API_BASE_URL` pointing to the deployed backend API.

Backend on Render, Railway, Fly.io, or similar:

1. Set root directory to `server`.
2. Start command: `npm start`.
3. Add `GOOGLE_API_KEY`, `GEMINI_MODEL`, `PORT`, and `CLIENT_ORIGIN`.

## Future Improvements

- Add database-backed report history
- Add user accounts
- Add source citations in the dashboard
- Cache repeated company analyses
- Add ticker lookup and financial API integration
- Add streaming progress updates
