import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS, t } from '../lib/tokens';

export default function Timeline() {
  const { thoughts } = useMindStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const byDate = thoughts.reduce((acc, th) => {
    if (!acc[th.date]) acc[th.date] = [];
    acc[th.date].push(th);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const fmtShort = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '48px 40px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
            Timeline
          </h1>
          <p style={{ fontSize: 12, color: t.text.tertiary, marginTop: 4 }}>
            {dates.length > 0 ? `${dates.length} days with thoughts` : 'No thoughts yet'}
          </p>
        </motion.div>

        {/* Empty state */}
        {dates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: t.text.tertiary, fontSize: 14 }}
          >
            You haven't forgotten anything yet.
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div
            style={{
              position: 'absolute',
              left: 5,
              top: 8,
              bottom: 8,
              width: 1,
              background: `linear-gradient(to bottom, transparent, ${t.border} 5%, ${t.border} 95%, transparent)`,
            }}
          />

          <div style={{ paddingLeft: 28 }}>
            {dates.map((date, i) => {
              const dayThoughts = byDate[date];
              const isOpen = selected === date;

              return (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ marginBottom: 4 }}
                >
                  {/* Dot + date row */}
                  <button
                    onClick={() => setSelected(isOpen ? null : date)}
                    className="w-full flex items-center gap-3 text-left"
                    style={{
                      padding: '8px 0',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      position: 'relative',
                    }}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: -28,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: isOpen ? 'rgba(255,255,255,0.8)' : t.bg,
                        border: `1px solid ${isOpen ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)'}`,
                        transition: 'all 0.15s',
                      }}
                    />

                    <div className="flex items-center gap-3 flex-1">
                      <span style={{
                        fontSize: 13,
                        fontWeight: isOpen ? 500 : 400,
                        color: isOpen ? t.text.primary : t.text.secondary,
                        transition: 'color 0.15s',
                        minWidth: 80,
                      }}>
                        {fmtShort(date)}
                      </span>
                      <span style={{ fontSize: 12, color: t.text.tertiary }}>
                        {dayThoughts.length} thought{dayThoughts.length !== 1 ? 's' : ''}
                      </span>
                      {/* Preview dots */}
                      <div className="flex gap-1">
                        {dayThoughts.slice(0, 5).map((th) => (
                          <div
                            key={th.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: CATEGORY_COLORS[th.category]?.dot + '80' }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* Expanded thoughts */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ paddingBottom: 16 }}>
                          <p style={{ fontSize: 11, color: t.text.tertiary, marginBottom: 10, paddingTop: 4 }}>
                            {fmt(date)}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {dayThoughts.map((th, j) => {
                              const cat = CATEGORY_COLORS[th.category];
                              return (
                                <motion.button
                                  key={th.id}
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.04 }}
                                  onClick={() => navigate(`/thought/${th.id}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '9px 12px',
                                    background: t.surface,
                                    border: `1px solid ${t.border}`,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.1s',
                                    width: '100%',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.borderColor = t.borderHover}
                                  onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
                                >
                                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: cat?.dot, flexShrink: 0 }} />
                                  <span style={{ fontSize: 13, color: t.text.primary, flex: 1, fontWeight: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {th.title}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
