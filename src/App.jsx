import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { useMindStore } from './store/useMindStore';
import { t } from './lib/tokens';
import StarField from './components/StarField';
import Sidebar from './components/Sidebar';
import SearchModal from './components/SearchModal';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Thoughts from './pages/Thoughts';
import ThoughtDetail from './pages/ThoughtDetail';
import BrainMap from './pages/BrainMap';
import Timeline from './pages/Timeline';
import Chat from './pages/Chat';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Synthesis from './pages/Synthesis';

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

// Loading screen
function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ fontSize: 13, color: t.text.tertiary }}
      >
        Loading...
      </motion.div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { fetchThoughts, clearThoughts } = useMindStore();

  // Load thoughts when user signs in, clear when they sign out
  useEffect(() => {
    if (user) {
      fetchThoughts();
    } else if (user === null) {
      clearThoughts();
    }
  }, [user]);

  // Still resolving session
  if (user === undefined) return <Loading />;

  // Not signed in → show auth screen
  if (user === null) return <Auth />;

  // Signed in → show app
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: t.bg }}>
      <StarField />

      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden"
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 30,
          padding: 8,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${t.border}`,
          color: t.text.secondary,
          cursor: 'pointer',
        }}
      >
        <Menu size={16} />
      </button>

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"            element={<Page><Dashboard /></Page>} />
            <Route path="/thoughts"    element={<Page><Thoughts /></Page>} />
            <Route path="/synthesis"   element={<Page><Synthesis /></Page>} />
            <Route path="/thought/:id" element={<Page><ThoughtDetail /></Page>} />
            <Route path="/brain"       element={<Page><BrainMap /></Page>} />
            <Route path="/timeline"    element={<Page><Timeline /></Page>} />
            <Route path="/chat"        element={<Page><Chat /></Page>} />
            <Route path="/insights"    element={<Page><Insights /></Page>} />
            <Route path="/settings"    element={<Page><Settings /></Page>} />
          </Routes>
        </AnimatePresence>
      </main>

      <SearchModal />
    </div>
  );
}
