import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS } from '../lib/tokens';
import { useTheme } from '../lib/ThemeContext';

export default function SearchModal() {
  const { t } = useTheme();
  const { searchOpen, setSearchOpen, getFilteredThoughts } = useMindStore();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = query.trim().length > 0 ? getFilteredThoughts(query).slice(0, 8) : [];

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    if (searchOpen) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [searchOpen]);

  useEffect(() => { setCursor(0); }, [query]);

  const go = (id) => { navigate(`/thought/${id}`); setSearchOpen(false); };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') setCursor((c) => Math.min(c + 1, results.length - 1));
    if (e.key === 'ArrowUp') setCursor((c) => Math.max(c - 1, 0));
    if (e.key === 'Enter' && results[cursor]) go(results[cursor].id);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSearchOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-lg pointer-events-auto overflow-hidden rounded-2xl"
              style={{
                background: '#111',
                border: `1px solid ${t.border}`,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}
            >
              {/* Input */}
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: results.length ? `1px solid ${t.border}` : 'none' }}
              >
                <Search size={15} strokeWidth={1.5} style={{ color: t.text.tertiary, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Search thoughts..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: t.text.primary }}
                />
                {query && (
                  <span style={{ fontSize: 11, color: t.text.tertiary }}>
                    {results.length} found
                  </span>
                )}
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="py-1">
                  {results.map((r, i) => {
                    const cat = CATEGORY_COLORS[r.category];
                    return (
                      <button
                        key={r.id}
                        onClick={() => go(r.id)}
                        onMouseEnter={() => setCursor(i)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100"
                        style={{
                          background: i === cursor ? 'rgba(255,255,255,0.05)' : 'transparent',
                        }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ color: t.text.primary, fontWeight: 450 }}>
                            {r.title}
                          </div>
                          <div className="text-xs truncate mt-0.5" style={{ color: t.text.tertiary }}>
                            {r.preview}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat?.dot }} />
                          {i === cursor && <ArrowRight size={12} style={{ color: t.text.tertiary }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {query.trim() && results.length === 0 && (
                <div className="px-4 py-8 text-center" style={{ fontSize: 13, color: t.text.tertiary }}>
                  No thoughts match "{query}"
                </div>
              )}

              {/* Footer */}
              <div
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderTop: `1px solid ${t.border}`, fontSize: 11, color: t.text.tertiary }}
              >
                <span><kbd style={{ fontFamily: 'inherit' }}>↑↓</kbd> navigate</span>
                <span><kbd style={{ fontFamily: 'inherit' }}>↵</kbd> open</span>
                <span><kbd style={{ fontFamily: 'inherit' }}>esc</kbd> close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
