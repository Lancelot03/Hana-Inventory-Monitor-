import { Server, Router, ShieldCheck } from 'lucide-react';

export default function SystemCard({ system }) {
  return (
    <section className="rounded border border-ink/30 bg-panel p-4 shadow-grid">
      <header className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
        <ShieldCheck size={16} />
        System ID Card
      </header>
      <h2 className="mb-3 text-xl font-bold">{system.systemName}</h2>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded border border-ink/20 p-2"><Server size={14} className="mb-1" />App Server: {system.appServer}</div>
        <div className="rounded border border-ink/20 p-2">Instance: {system.instance}</div>
        <div className="rounded border border-ink/20 p-2">System ID: {system.systemId}</div>
        <div className="rounded border border-ink/20 p-2"><Router size={14} className="mb-1" />Router: {system.router}</div>
      </div>
    </section>
  );
}
