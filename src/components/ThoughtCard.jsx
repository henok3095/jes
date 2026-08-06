import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../lib/tokens';
import { useTheme } from '../lib/ThemeContext';

export default function ThoughtCard({ thought, index = 0 }) {
  const { t } = useTheme();
  const navigate = useNavigate();
  const cat = CATEGORY_COLORS[thought.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.28, ease: 'easeOut' }}
      onClick={() => navigate(`/thought/${thought.id}`)}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.borderHover;
        e.currentTarget.style.background = t.surfaceHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.background = t.surface;
      }}
    >
      {/* Category indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cat?.dot,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: t.text.tertiary, letterSpacing: '0.02em' }}>
          {cat?.label}
        </span>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: t.text.primary,
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        {thought.title}
      </p>

      {/* Preview */}
      <p
        style={{
          fontSize: 12,
          color: t.text.tertiary,
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {thought.preview}
      </p>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <span style={{ fontSize: 11, color: t.text.tertiary }}>
          {new Date(thought.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {thought.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: t.text.tertiary,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${t.border}`,
                borderRadius: 4,
                padding: '1px 6px',
              }}
            >
              {tag}
            </span>
          ))}
          {thought.connections?.length > 0 && (
            <span style={{ fontSize: 11, color: t.text.tertiary }}>
              {thought.connections.length} linked
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
