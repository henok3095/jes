import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS, t } from '../lib/tokens';
import ThoughtCard from '../components/ThoughtCard';

export default function ThoughtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { thoughts, deleteThought } = useMindStore();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const thought = thoughts.find((th) => th.id === id);
  if (!thought) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text.tertiary, fontSize: 14 }}>
        Thought not found.
      </div>
    );
  }

  const cat = CATEGORY_COLORS[thought.category];
  const linked = (thought.connections || []).map((cid) => thoughts.find((th) => th.id === cid)).filter(Boolean);

  const handleDelete = async () => {
    setDeleting(true);
    await deleteThought(thought.id);
    navigate('/thoughts', { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '48px 40px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Back + delete row */}
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: t.text.tertiary, cursor: 'pointer',
              background: 'none', border: 'none', fontFamily: 'inherit',
              transition: 'color 0.12s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
            onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Delete control */}
          <AnimatePresence mode="wait">
            {!confirming ? (
              <motion.button
                key="delete-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirming(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: t.text.tertiary, cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'inherit',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,100,100,0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
              >
                <Trash2 size={13} />
                Delete
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 12, color: t.text.tertiary }}>Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    fontSize: 12, fontWeight: 500,
                    color: 'rgba(255,100,100,0.85)',
                    cursor: 'pointer', background: 'none',
                    border: `1px solid rgba(255,100,100,0.3)`,
                    borderRadius: 6, padding: '4px 10px',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                >
                  {deleting ? '...' : 'Delete'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  style={{
                    fontSize: 12, color: t.text.tertiary,
                    cursor: 'pointer', background: 'none',
                    border: `1px solid ${t.border}`,
                    borderRadius: 6, padding: '4px 10px',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Thought content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Category + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat?.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: t.text.tertiary }}>{cat?.label}</span>
            <span style={{ fontSize: 12, color: t.text.tertiary }}>·</span>
            <span style={{ fontSize: 12, color: t.text.tertiary }}>
              {new Date(thought.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 20 }}>
            {thought.title}
          </h1>

          <div style={{ height: 1, background: t.border, marginBottom: 20 }} />

          {/* Content */}
          <p style={{ fontSize: 14, lineHeight: 1.8, color: t.text.secondary, marginBottom: 24 }}>
            {thought.content}
          </p>

          {/* Tags */}
          {thought.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
              {thought.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.06)',
                    color: t.text.tertiary, border: `1px solid ${t.border}`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Linked thoughts */}
        {linked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div style={{ height: 1, background: t.border, marginBottom: 24 }} />
            <p style={{ fontSize: 11, color: t.text.tertiary, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Linked thoughts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linked.map((th, i) => (
                <ThoughtCard key={th.id} thought={th} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
