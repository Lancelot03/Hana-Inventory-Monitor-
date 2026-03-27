import { useMemo, useState } from 'react';
import { Activity, Code2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import CategoryCards from './components/CategoryCards';
import InventoryTable from './components/InventoryTable';
import MaterialChart from './components/MaterialChart';
import SystemCard from './components/SystemCard';
import TechnicalView from './components/TechnicalView';
import { useInventoryStream } from './lib/useInventoryStream';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'technical', label: 'Technical View', icon: Code2 },
];

export default function App() {
  const { payload, status } = useInventoryStream();
  const [activeTab, setActiveTab] = useState('dashboard');

  const metrics = useMemo(() => {
    if (!payload) return { totalUnits: 0, sku: 0 };
    return {
      totalUnits: payload.materials.reduce((acc, row) => acc + row.totalQuantity, 0),
      sku: payload.materials.length,
    };
  }, [payload]);

  return (
    <main className="min-h-screen grid-tech px-5 py-4 font-mono text-ink">
      <div className="mx-auto w-full max-w-[1500px] space-y-4">
        <header className="rounded border border-ink/40 bg-panel p-4 shadow-grid">
          <h1 className="text-2xl font-black uppercase tracking-widest">S/4HANA Real-time Inventory Monitor</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink/70">
            Mode: {payload?.mode || 'loading'} | Socket: {status} | Generated: {payload?.generatedAt || '...'}
          </p>
          <p className="text-xs uppercase text-ink/70">
            Global Units: {metrics.totalUnits.toLocaleString()} | Global SKU: {metrics.sku}
          </p>
          <div className="mt-3 flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 border px-3 py-1 text-xs uppercase ${
                    activeTab === tab.id ? 'border-ink bg-ink text-panel' : 'border-ink/30'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {payload && <SystemCard system={payload.system} />}
              {payload && <CategoryCards categories={payload.categories} />}
              {payload && <MaterialChart materials={payload.materials} />}
              {payload && <InventoryTable materials={payload.materials} />}
            </motion.section>
          ) : (
            <motion.section
              key="technical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TechnicalView />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
