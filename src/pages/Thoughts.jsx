import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS, t } from '../lib/tokens';
import ThoughtCard from '../components/ThoughtCard';

export default function Thoughts() {
  const { thoughts } = useMindStore();
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = thoughts.filter((th) => {
    const okCat = cat === 'all' || th.category === cat;
    const okQ = !query || th.title.toLowerCase().includes(query.toLowerCase()) || th.preview.toLowerCase().includes(query.toLowerCase());
    return okCat && okQ;
  });

  const categories = Object.entries(CATEGORY_COLORS);

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '48px 40px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
            Thoughts
          </h1>
          <p style={{ fontSize: 12, color: t.text.tertiary, marginTop: 4 }}>
            {filtered.length} of {thoughts.length}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            padding: '9px 14px',
            marginBottom: 16,
          }}
        >
          <Search size={13} strokeWidth={1.5} style={{ color: t.text.tertiary, flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: t.text.primary }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: t.text.tertiary, cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}
        >
          <button
            onClick={() => setCat('all')}
            style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 20,
              cursor: 'pointer',
              background: cat === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: cat === 'all' ? t.text.primary : t.text.tertiary,
              border: `1px solid ${cat === 'all' ? t.borderHover : 'transparent'}`,
              transition: 'all 0.1s',
            }}
          >
            All
          </button>
          {categories.map(([id, { dot, label }]) => (
            <button
              key={id}
              onClick={() => setCat(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                padding: '5px 12px',
                borderRadius: 20,
                cursor: 'pointer',
                background: cat === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: cat === id ? t.text.primary : t.text.tertiary,
                border: `1px solid ${cat === id ? t.borderHover : 'transparent'}`,
                transition: 'all 0.1s',
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '80px 0', color: t.text.tertiary, fontSize: 14 }}
            >
              Every masterpiece starts with one idea.
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {filtered.map((th, i) => (
                <ThoughtCard key={th.id} thought={th} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
