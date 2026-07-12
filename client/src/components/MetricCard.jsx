export default function MetricCard({ label, value }) {
  return (
    <div className="soft-panel p-4">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-600 dark:text-brass-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-ink">{value || "Not available"}</p>
    </div>
  );
}