import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { t } from '../lib/tokens';

function Row({ label, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '13px 0',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <span style={{ fontSize: 13, color: t.text.secondary }}>{label}</span>
      <div style={{ fontSize: 13, color: t.text.tertiary }}>{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user, signOut } = useAuth();

  const name = user?.email?.split('@')[0] ?? '—';
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '48px 40px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
            Settings
          </h1>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ marginBottom: 40 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 500, color: t.text.tertiary,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Account
          </p>
          <Row label="Name">{name}</Row>
          <Row label="Email">{user?.email ?? '—'}</Row>
          <Row label="Member since">{joined}</Row>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: t.text.primary,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${t.border}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            Sign out
          </button>
        </motion.div>

        <p style={{ fontSize: 11, color: t.text.tertiary, textAlign: 'center', marginTop: 48 }}>
          Jes ጀስ · v1.0.0
        </p>
      </div>
    </div>
  );
}
