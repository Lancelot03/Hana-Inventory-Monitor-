export default function CategoryCards({ categories }) {
  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {categories.map((cat) => (
        <article key={cat.category} className="rounded border border-ink/25 bg-panel p-3 shadow-grid">
          <h3 className="text-xs uppercase tracking-wide text-ink/70">{cat.category}</h3>
          <p className="mt-2 text-lg font-bold">{cat.totalUnits.toLocaleString()} units</p>
          <p className="text-xs text-ink/70">{cat.skuCount} SKUs</p>
        </article>
      ))}
    </section>
  );
}
