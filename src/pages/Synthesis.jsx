import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronDown, Trash2, Clock, Plus } from 'lucide-react';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS } from '../lib/tokens';
import { useTheme } from '../lib/ThemeContext';
import { synthesizeThoughts } from '../lib/groq';
import { synthesisService } from '../lib/synthesisService';

// ── Cluster card ──────────────────────────────────────────────────────────────

function ClusterCard({ cluster, index, t }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: expanded ? `1px solid ${t.border}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: `hsl(${(index * 60) + 200}, 70%, 65%)` }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>{cluster.title}</span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown size={14} style={{ color: t.text.tertiary }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 14, lineHeight: 1.85, color: t.text.secondary, marginBottom: 14, fontStyle: 'italic' }}>
                "{cluster.synthesis}"
              </p>
              {cluster.thoughts?.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    From these thoughts
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {cluster.thoughts.map((title) => (
                      <span key={title} style={{
                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.border}`, color: t.text.tertiary,
                      }}>
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── History sidebar item ───────────────────────────────────────────────────────

function HistoryEntry({ item, active, t, onClick, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: `1px solid ${active ? t.borderHover : 'transparent'}`,
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%', padding: '9px 10px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
        }}
      >
        <span style={{
          fontSize: 12, fontWeight: active ? 500 : 400,
          color: active ? t.text.primary : t.text.secondary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          display: 'block', maxWidth: '100%',
        }}>
          {item.scope}
        </span>
        <span style={{ fontSize: 10, color: t.text.tertiary }}>
          {date} · {time}
        </span>
      </button>

      {/* Delete */}
      <div style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'flex-end' }}>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text.tertiary, display: 'flex', padding: 2, transition: 'color 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,100,100,0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
          >
            <Trash2 size={11} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { onDelete(item.id); setConfirming(false); }}
              style={{ fontSize: 10, color: 'rgba(255,100,100,0.8)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Delete
            </button>
            <button onClick={() => setConfirming(false)}
              style={{ fontSize: 10, color: t.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scope selectors ───────────────────────────────────────────────────────────

const TIME_SCOPES = [
  { id: 'today', label: "Today" },
  { id: 'week',  label: 'This week' },
  { id: 'all',   label: 'All time' },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Synthesis() {
  const { t } = useTheme();
  const { thoughts } = useMindStore();

  const [timeScope, setTimeScope] = useState('today');
  const [catScope, setCatScope]   = useState('all');
  const [clusters, setClusters]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [history, setHistory]     = useState([]);
  const [activeId, setActiveId]   = useState(null); // which history item is shown
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    synthesisService.getAll()
      .then((data) => { setHistory(data); })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const getScopedThoughts = () => {
    let filtered = [...thoughts];
    const today = new Date().toISOString().split('T')[0];
    if (timeScope === 'today') filtered = filtered.filter((th) => th.date === today);
    else if (timeScope === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((th) => new Date(th.date) >= weekAgo);
    }
    if (catScope !== 'all') filtered = filtered.filter((th) => th.category === catScope);
    filtered = filtered.filter((th) => th.title.trim().length >= 8);
    return filtered;
  };

  const scopedThoughts = getScopedThoughts();

  const getScopeLabel = () => {
    const timeLabel = TIME_SCOPES.find((s) => s.id === timeScope)?.label ?? '';
    const catLabel  = catScope !== 'all' ? ` · ${CATEGORY_COLORS[catScope]?.label}` : '';
    return `${timeLabel}${catLabel}`;
  };

  const run = async () => {
    if (scopedThoughts.length < 2) return;
    setLoading(true); setError(''); setClusters(null); setActiveId(null);
    try {
      const result = await synthesizeThoughts(scopedThoughts);
      if (!result) throw new Error('Could not generate synthesis. Try again.');
      setClusters(result);
      const saved = await synthesisService.save(getScopeLabel(), result);
      setHistory((prev) => [saved, ...prev]);
      setActiveId(null); // show "just now" result, not a history item
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistory = async (id) => {
    await synthesisService.delete(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeId === id) { setActiveId(null); setClusters(null); }
  };

  const loadHistoryItem = (item) => {
    setActiveId(item.id);
    setClusters(item.clusters);
    setError('');
  };

  const newSynthesis = () => {
    setActiveId(null);
    setClusters(null);
    setError('');
  };

  const categories = Object.entries(CATEGORY_COLORS);
  const activeClusters = activeId ? history.find((h) => h.id === activeId)?.clusters : clusters;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

      {/* ── History sidebar ── */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: `1px solid ${t.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        {/* Header */}
        <div style={{
          padding: '16px 12px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${t.border}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} style={{ color: t.text.tertiary }} />
            <span style={{ fontSize: 11, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              History
            </span>
          </div>
          <button
            onClick={newSynthesis}
            title="New synthesis"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text.tertiary, display: 'flex', padding: 2, transition: 'color 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
            onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* History list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {historyLoading ? (
            <div style={{ padding: '12px 4px' }}>
              {[1, 2, 3].map((i) => (
                <motion.div key={i}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                  style={{ height: 44, borderRadius: 8, background: t.surface, marginBottom: 4 }}
                />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p style={{ fontSize: 11, color: t.text.tertiary, padding: '12px 4px', lineHeight: 1.6 }}>
              Your syntheses will appear here.
            </p>
          ) : (
            history.map((item) => (
              <HistoryEntry
                key={item.id}
                item={item}
                active={activeId === item.id}
                t={t}
                onClick={() => loadHistoryItem(item)}
                onDelete={deleteHistory}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 36px)' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
              {activeId ? history.find((h) => h.id === activeId)?.scope ?? 'Synthesis' : 'New synthesis'}
            </h1>
            {activeId && (
              <p style={{ fontSize: 12, color: t.text.tertiary, marginTop: 4 }}>
                {new Date(history.find((h) => h.id === activeId)?.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </motion.div>

          {/* Scope selectors — only show when not viewing history */}
          {!activeId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}>
              <p style={{ fontSize: 11, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                Time range
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {TIME_SCOPES.map(({ id, label }) => (
                  <button key={id} onClick={() => setTimeScope(id)}
                    style={{
                      fontSize: 12, padding: '5px 12px', borderRadius: 20,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: timeScope === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: timeScope === id ? t.text.primary : t.text.tertiary,
                      border: `1px solid ${timeScope === id ? t.borderHover : 'transparent'}`,
                      transition: 'all 0.1s',
                    }}>
                    {label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 11, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                Category
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                <button onClick={() => setCatScope('all')}
                  style={{
                    fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                    background: catScope === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: catScope === 'all' ? t.text.primary : t.text.tertiary,
                    border: `1px solid ${catScope === 'all' ? t.borderHover : 'transparent'}`,
                    transition: 'all 0.1s',
                  }}>
                  All
                </button>
                {categories.map(([id, { dot, label }]) => {
                  const count = thoughts.filter((th) => th.category === id).length;
                  if (count === 0) return null;
                  return (
                    <button key={id} onClick={() => setCatScope(id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                        background: catScope === id ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: catScope === id ? t.text.primary : t.text.tertiary,
                        border: `1px solid ${catScope === id ? t.borderHover : 'transparent'}`,
                        transition: 'all 0.1s',
                      }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Action button */}
              {scopedThoughts.length < 2 ? (
                <p style={{ fontSize: 13, color: t.text.tertiary, marginBottom: 24 }}>
                  {scopedThoughts.length === 0 ? 'No thoughts match this scope.' : 'Need at least 2 thoughts to synthesize.'}
                </p>
              ) : (
                <div style={{ marginBottom: 28 }}>
                  <button onClick={run} disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 20px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                      color: loading ? t.text.tertiary : t.text.primary,
                      background: loading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${loading ? t.border : t.borderHover}`,
                      cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <RefreshCw size={14} />
                      </motion.div>
                    ) : <Sparkles size={14} />}
                    {loading ? 'Synthesizing...' : `Synthesize ${scopedThoughts.length} thoughts`}
                  </button>
                  {!loading && (
                    <p style={{ fontSize: 11, color: t.text.tertiary, marginTop: 6 }}>{getScopeLabel()}</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Back button when viewing history */}
          {activeId && (
            <button onClick={newSynthesis}
              style={{
                fontSize: 12, color: t.text.tertiary, background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4,
                transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
            >
              ← New synthesis
            </button>
          )}

          {/* Error */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 13, color: 'rgba(255,100,100,0.7)', marginBottom: 20 }}>
              {error}
            </motion.p>
          )}

          {/* Loading shimmer */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <motion.div key={i}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                  style={{ height: 80, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}
                />
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && activeClusters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 11, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                {activeClusters.length} theme{activeClusters.length !== 1 ? 's' : ''}
              </p>
              {activeClusters.map((cluster, i) => (
                <ClusterCard key={i} cluster={cluster} index={i} t={t} />
              ))}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && !activeClusters && !activeId && scopedThoughts.length >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 0', color: t.text.tertiary, fontSize: 13 }}>
              Hit synthesize and see your thoughts in a new light.
            </motion.div>
          )}

          <div style={{ height: 48 }} />
        </div>
      </div>
    </div>
  );
}
