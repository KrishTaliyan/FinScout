export default function SectionCard({ title, children, className = "" }) {
  return (
    <section className={`soft-panel p-5 ${className}`}>
      <h3 className="border-b border-hairline pb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brass-600 dark:text-brass-500">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-6 text-ink/90">{children}</div>
    </section>
  );
}