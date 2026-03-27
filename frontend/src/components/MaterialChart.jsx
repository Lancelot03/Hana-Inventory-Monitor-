import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function MaterialChart({ materials }) {
  const top = materials.slice(0, 10).map((m) => ({
    name: m.material,
    quantity: m.totalQuantity,
  }));

  return (
    <section className="rounded border border-ink/30 bg-panel p-4 shadow-grid">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Top 10 Material Stock (Global)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top}>
            <XAxis dataKey="name" stroke="#141414" tick={{ fontSize: 11 }} interval={0} angle={-22} height={56} />
            <YAxis stroke="#141414" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#3A7467" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
