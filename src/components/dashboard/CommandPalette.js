'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Maximize2, LogOut, MapPin, PanelLeft } from 'lucide-react';

const normalize = (s = '') => s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Global command palette (Ctrl/Cmd + K or "/").
 * items: [{ id, label, hint, group, icon, keywords, run }]
 */
export default function CommandPalette({ open, onClose, items }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    return items
      .map(it => {
        const label = normalize(it.label);
        const hay = `${label} ${normalize(it.group)} ${normalize(it.keywords)} ${normalize(it.hint)}`;
        let score = -1;
        if (label.startsWith(q)) score = 3;
        else if (label.includes(q)) score = 2;
        else if (q.split(/\s+/).every(w => hay.includes(w))) score = 1;
        return { it, score };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.it);
  }, [items, query]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const run = (it) => { if (!it) return; onClose(); it.run(); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(results[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  // Group results while preserving order
  const groups = [];
  results.forEach((it, idx) => {
    let g = groups.find(x => x.name === it.group);
    if (!g) { g = { name: it.group, rows: [] }; groups.push(g); }
    g.rows.push({ it, idx });
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[600px] bg-white rounded-2xl border border-neutral-200 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25)] overflow-hidden wsc-pop">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-neutral-100">
          <Search size={17} className="text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar módulos, acciones o sedes..."
            className="flex-1 h-full bg-transparent !outline-none !ring-0 border-none shadow-none text-[14px] text-neutral-900 placeholder:text-neutral-400"
            aria-label="Buscar"
          />
          <kbd className="wsc-kbd">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[13px] font-medium text-neutral-700">Sin resultados para “{query}”</p>
              <p className="text-[12px] text-neutral-400 mt-1">Prueba con otro término</p>
            </div>
          )}
          {groups.map(g => (
            <div key={g.name} className="mb-1">
              <div className="px-2.5 pt-2 pb-1 text-[11px] font-semibold text-neutral-400">{g.name}</div>
              {g.rows.map(({ it, idx }) => {
                const Icon = it.icon;
                const isActive = idx === active;
                return (
                  <button
                    key={it.id}
                    data-idx={idx}
                    type="button"
                    onMouseMove={() => setActive(idx)}
                    onClick={() => run(it)}
                    className={`w-full flex items-center gap-3 px-2.5 h-11 rounded-xl text-left transition-colors ${isActive ? 'bg-neutral-100' : ''}`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${isActive ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600'}`}>
                      {Icon && <Icon size={14} />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium text-neutral-900 truncate">{it.label}</span>
                      {it.hint && <span className="block text-[11.5px] text-neutral-400 truncate">{it.hint}</span>}
                    </span>
                    {isActive && <CornerDownLeft size={14} className="text-neutral-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 h-10 border-t border-neutral-100 bg-neutral-50/70 text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="wsc-kbd"><ArrowUp size={10} /></kbd><kbd className="wsc-kbd"><ArrowDown size={10} /></kbd> navegar</span>
            <span className="flex items-center gap-1"><kbd className="wsc-kbd"><CornerDownLeft size={10} /></kbd> abrir</span>
          </div>
          <span className="hidden sm:inline">Wave Surf Club ERP</span>
        </div>
      </div>
    </div>
  );
}

export const paletteIcons = { Maximize2, LogOut, MapPin, PanelLeft };
