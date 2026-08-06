import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

export default function Settings() {
  const { t } = useTheme();
  const { user, signOut } = useAuth();

  const name = user?.email?.split('@')[0] ?? '—';
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '—';

  function Row({ label, children }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 0', borderBottom: `1px solid ${t.border}`,
      }}>
        <span style={{ fontSize: 13, color: t.text.secondary }}>{label}</span>
        <div style={{ fontSize: 13, color: t.text.tertiary }}>{children}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: 'clamp(24px, 5vw, 48px) clamp(16px, 5vw, 40px)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
            Settings
          </h1>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: t.text.tertiary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            Account
          </p>
          <Row label="Name">{name}</Row>
          <Row label="Email">{user?.email ?? '—'}</Row>
          <Row label="Member since">{joined}</Row>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={signOut}
            style={{
              width: '100%', padding: '11px', borderRadius: 8,
              fontSize: 13, fontWeight: 500, color: t.text.primary,
              background: t.surface, border: `1px solid ${t.border}`,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.12s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = t.borderHover}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
          >
            Sign out
          </button>
        </motion.div>

        <p style={{ fontSize: 11, color: t.text.tertiary, textAlign: 'center', marginTop: 48 }}>
          Jes ጀስ · v1.0.0
        </p>

        {/* Creator */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: t.text.tertiary, marginBottom: 10 }}>
            Built by <span style={{ color: t.text.secondary, fontWeight: 500 }}>Henok Eyayalem</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <a
              href="https://www.linkedin.com/in/henok3095"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, color: t.text.tertiary, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
            >
              {/* LinkedIn icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              LinkedIn
            </a>
            <span style={{ color: t.text.tertiary, fontSize: 10 }}>·</span>
            <a
              href="https://t.me/Nofngway"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, color: t.text.tertiary, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
            >
              {/* Telegram icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
              </svg>
              Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
