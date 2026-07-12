import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STAGES = [
  { until: 30, label: "Researching the company", detail: "Pulling business context, market position, and recent news." },
  { until: 70, label: "Extracting financial signals", detail: "Reading revenue trends, margins, debt, and cash flow." },
  { until: 95, label: "Scoring the investment case", detail: "Weighing pros, cons, and risk to reach a verdict." }
];

const TIPS = [
  "Revenue growth alone doesn't make a good investment — margins and cash flow matter just as much.",
  "A high debt level isn't automatically bad if it's funding profitable growth.",
  "Confidence level in this report reflects how much reliable public data was available.",
  "The Score Breakdown separates financial health, market position, growth, and risk — check which one is dragging the score.",
  "\"INVEST\" vs \"PASS\" is a starting point for research, not financial advice.",
  "Competitors matter: a great product in a brutal market can still be a weak investment."
];

function getStage(progress) {
  return STAGES.find((stage) => progress <= stage.until) || STAGES[STAGES.length - 1];
}

// Time-based curve (not tick-accumulated) so it scales with real duration
// instead of racing to 95% in the first few seconds regardless of how
// long the request actually takes.
function progressFromElapsed(elapsedSeconds) {
  const tau = 18; // seconds — controls how quickly it approaches the ceiling
  return Math.min(95, 95 * (1 - Math.exp(-elapsedSeconds / tau)));
}

export default function LoadingState() {
  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((current) => (current + 1) % TIPS.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const progress = progressFromElapsed(elapsed);
  const displayProgress = Math.round(progress);
  const stage = getStage(displayProgress);
  const roundedElapsed = Math.round(elapsed);
  const isTakingLong = roundedElapsed >= 25;

  return (
    <section className="panel p-5 sm:p-6" aria-live="polite">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-hairline bg-ink text-paper">
          <Loader2 className="spinner" size={24} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-ink">{stage.label}</h2>
            <span className="font-mono text-2xl font-semibold text-invest-600">{displayProgress}%</span>
          </div>
          <p className="mt-1 font-mono text-sm leading-6 text-muted">
            {isTakingLong ? `Still working — ${roundedElapsed}s elapsed.` : stage.detail}
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-sm bg-hairline/60">
        <div
          className="h-full rounded-sm bg-invest-600 transition-all duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      <div className="mt-5 rounded-sm border border-hairline bg-paper p-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-500">
          While you wait
        </p>
        <p className="mt-2 text-sm leading-6 text-ink/85">{TIPS[tipIndex]}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="skeleton h-28 rounded-sm" />
        <div className="skeleton h-28 rounded-sm" />
        <div className="skeleton h-28 rounded-sm" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-44 rounded-sm" />
        <div className="skeleton h-44 rounded-sm" />
      </div>
    </section>
  );
}



