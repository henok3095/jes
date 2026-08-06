import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindStore } from '../store/useMindStore';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

export default function Dashboard() {
  const { addThought } = useMindStore();
  const { user } = useAuth();
  const { t } = useTheme();
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);

  // Derive first name from email (before the @)
  const name = user?.email?.split('@')[0] ?? '';

  const capture = async () => {
    if (!draft.trim()) return;
    await addThought({ title: draft, preview: draft, content: draft, category: 'random', tags: [] });
    setDraft('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(20px, 5vw, 40px) clamp(16px, 5vw, 24px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        {/* Greeting */}
        <p style={{ fontSize: 13, color: t.text.tertiary, marginBottom: 28, textAlign: 'center' }}>
          {greeting}{name ? `, ${name}` : ''}
        </p>

        {/* Input area */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: '20px',
            transition: 'border-color 0.15s',
          }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = t.borderHover}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = t.border}
        >
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                capture();
              }
            }}
            placeholder="Capture a thought before it disappears..."
            rows={4}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 14,
              lineHeight: 1.7,
              color: t.text.primary,
              fontFamily: 'inherit',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              paddingTop: 14,
              borderTop: `1px solid ${t.border}`,
            }}
          >
            <span style={{ fontSize: 11, color: t.text.tertiary }}>
              {draft.length > 0 ? `${draft.length} chars` : 'Enter to save · Shift+Enter for new line'}
            </span>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={capture}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: '6px 16px',
                borderRadius: 7,
                border: `1px solid ${draft.trim() ? t.borderHover : t.border}`,
                background: draft.trim() ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: draft.trim() ? t.text.primary : t.text.tertiary,
                cursor: draft.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              Save
            </motion.button>
          </div>
        </div>

        {/* Toast confirmation */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              style={{
                marginTop: 16,
                padding: '10px 16px',
                borderRadius: 8,
                background: t.surface,
                border: `1px solid rgba(255,255,255,0.1)`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#34D399',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: t.text.secondary }}>
                Thought saved
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
