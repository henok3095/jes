import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { useMindStore } from '../store/useMindStore';
import { useTheme } from '../lib/ThemeContext';
import { synthesizeThoughts } from '../lib/groq';

function ClusterCard({ cluster, index, t }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: expanded ? `1px solid ${t.border}` : 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: `hsl(${(index * 60) + 200}, 70%, 65%)`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary }}>
            {cluster.title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={15} style={{ color: t.text.tertiary }} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '20px' }}>
              {/* Synthesis text */}
              <p style={{
                fontSize: 14,
                lineHeight: 1.85,
                color: t.text.secondary,
                marginBottom: 20,
                fontStyle: 'italic',
              }}>
                "{cluster.synthesis}"
              </p>

              {/* Source thoughts */}
              {cluster.thoughts?.length > 0 && (
                <div>
                  <p style={{
                    fontSize: 11,
                    color: t.text.tertiary,
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    From these thoughts
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cluster.thoughts.map((title) => (
                      <span
                        key={title}
                        style={{
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${t.border}`,
                          color: t.text.tertiary,
                        }}
                      >
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
    </motion.div>
  );
}

export default function Synthesis() {
  const { t } = useTheme();
  const { thoughts } = useMindStore();
  const [clusters, setClusters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    if (thoughts.length < 2) return;
    setLoading(true);
    setError('');
    setClusters(null);

    try {
      const result = await synthesizeThoughts(thoughts);
      if (!result) throw new Error('Could not generate synthesis.');
      setClusters(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: 'clamp(24px, 5vw, 48px) clamp(16px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 8 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 600, color: t.text.primary,
            letterSpacing: '-0.025em',
          }}>
            Synthesis
          </h1>
          <p style={{ fontSize: 13, color: t.text.tertiary, marginTop: 6, lineHeight: 1.6 }}>
            Your scattered thoughts, woven into something you've never seen before.
            The AI reads everything and finds the story your thoughts are telling.
          </p>
        </motion.div>

        {/* Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ margin: '28px 0' }}
        >
          {thoughts.length < 2 ? (
            <p style={{ fontSize: 13, color: t.text.tertiary }}>
              Capture at least 2 thoughts to generate a synthesis.
            </p>
          ) : (
            <button
              onClick={run}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                color: loading ? t.text.tertiary : t.text.primary,
                background: loading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${loading ? t.border : t.borderHover}`,
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw size={14} />
                </motion.div>
              ) : (
                <Sparkles size={14} />
              )}
              {loading
                ? 'Reading your thoughts...'
                : clusters
                ? 'Synthesize again'
                : `Synthesize ${thoughts.length} thoughts`}
            </button>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 13, color: 'rgba(255,100,100,0.7)', marginBottom: 24 }}
          >
            {error}
          </motion.p>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  height: 90,
                  borderRadius: 12,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && clusters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <p style={{
              fontSize: 11, color: t.text.tertiary,
              fontWeight: 500, letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              {clusters.length} theme{clusters.length !== 1 ? 's' : ''} found
            </p>
            {clusters.map((cluster, i) => (
              <ClusterCard key={i} cluster={cluster} index={i} t={t} />
            ))}
          </motion.div>
        )}

        {/* Empty — no synthesis yet */}
        {!loading && !clusters && thoughts.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: t.text.tertiary,
              fontSize: 13,
            }}
          >
            Hit synthesize and see your thoughts in a new light.
          </motion.div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
