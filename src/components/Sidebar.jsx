import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Network, Clock,
  MessageSquare, BarChart2, Settings, Search, X, Zap, Layers,
} from 'lucide-react';
import { useMindStore } from '../store/useMindStore';
import { useAuth } from '../lib/AuthContext';
import { t } from '../lib/tokens';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Home' },
  { to: '/thoughts',  icon: FileText,        label: 'Thoughts' },
  { to: '/synthesis', icon: Layers,          label: 'Synthesis' },
  { to: '/brain',     icon: Network,         label: 'Brain Map' },
  { to: '/timeline',  icon: Clock,           label: 'Timeline' },
  { to: '/chat',      icon: MessageSquare,   label: 'Jes AI' },
  { to: '/insights',  icon: BarChart2,       label: 'Insights' },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        color: isActive ? t.text.primary : t.text.secondary,
        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.getAttribute('aria-current')) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.getAttribute('aria-current')) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {({ isActive }) => (
        <>
          <Icon size={15} strokeWidth={isActive ? 2 : 1.5} style={{ flexShrink: 0 }} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const { setSearchOpen, thoughts } = useMindStore();
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] ?? '';
  const initial = name ? name[0].toUpperCase() : '?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 10px', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.12)',
          }}>
            <span style={{ fontSize: 12, color: '#080808', fontWeight: 700 }}>J</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.01em' }}>
            Jes <span style={{ color: t.text.tertiary, fontWeight: 400 }}>ጀስ</span>
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.text.tertiary, padding: 4, display: 'flex', alignItems: 'center' }}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* Search */}
      <button
        onClick={() => { setSearchOpen(true); onClose?.(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 8, marginBottom: 20, background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${t.border}`, color: t.text.tertiary, fontSize: 13,
          cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'border-color 0.12s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = t.borderHover}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
      >
        <Search size={13} strokeWidth={1.5} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Search</span>
        <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', border: `1px solid ${t.border}`, borderRadius: 4, padding: '1px 5px', color: t.text.tertiary, fontFamily: 'inherit' }}>
          ⌘K
        </kbd>
      </button>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem to="/settings" icon={Settings} label="Settings" onClick={onClose} />
        <div style={{ height: 1, background: t.border, margin: '10px 10px 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 12, fontWeight: 600, color: t.text.primary,
          }}>
            {initial}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.text.primary, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: t.text.tertiary, marginTop: 1 }}>
              <Zap size={9} strokeWidth={2} />
              {thoughts.length} thoughts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      <aside
        style={{ width: 220, height: '100%', flexShrink: 0, borderRight: `1px solid ${t.border}`, background: t.bg, display: 'flex', flexDirection: 'column' }}
        className="hidden lg:flex"
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }} onClick={onMobileClose}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.65)' }}
              className="lg:hidden"
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, width: 240, background: t.surface, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column' }}
              className="lg:hidden"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
