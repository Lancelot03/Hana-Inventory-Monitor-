import { AlertTriangle } from 'lucide-react';

export default function InventoryTable({ materials }) {
  return (
    <section className="rounded border border-ink/30 bg-panel p-4 shadow-grid">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Live Inventory Table</h3>
      <div className="max-h-[28rem] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-panel">
            <tr className="border-b border-ink/25 text-left">
              <th className="p-2">Rank</th>
              <th className="p-2">Material</th>
              <th className="p-2">Category</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Total Qty</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((row) => (
              <tr key={`${row.material}-${row.category}`} className="border-b border-ink/15 hover:bg-ink/5">
                <td className="p-2">#{row.stockRank}</td>
                <td className="p-2 font-semibold">{row.material}</td>
                <td className="p-2">{row.category}</td>
                <td className="p-2">{row.description}</td>
                <td className="p-2 text-right">{row.totalQuantity.toLocaleString()}</td>
                <td className="p-2">
                  {row.lowStock ? (
                    <span className="inline-flex items-center gap-1 rounded border border-alarm/50 px-2 py-1 text-alarm">
                      <AlertTriangle size={12} />Low Stock
                    </span>
                  ) : (
                    <span className="rounded border border-accent/40 px-2 py-1 text-accent">Healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
