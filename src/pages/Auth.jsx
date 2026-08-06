import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { t } from '../lib/tokens';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Check your email to confirm your account.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: t.text.primary,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.12s',
    width: '100%',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: '#080808', fontWeight: 700 }}>J</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.01em' }}>
            Jes <span style={{ color: t.text.tertiary, fontWeight: 400 }}>ጀስ</span>
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 22, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em', marginBottom: 6 }}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 13, color: t.text.tertiary, marginBottom: 28 }}>
          {mode === 'signin' ? 'Sign in to your digital mind.' : 'Start capturing your thoughts.'}
        </p>

        {/* Form */}
        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            spellCheck={false}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = t.borderHover}
            onBlur={(e) => e.target.style.borderColor = t.border}
          />

          {/* Password with show/hide toggle */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              style={{ ...inputStyle, paddingRight: 42 }}
              onFocus={(e) => e.target.style.borderColor = t.borderHover}
              onBlur={(e) => e.target.style.borderColor = t.border}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.text.tertiary,
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                zIndex: 2,
                transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = t.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = t.text.tertiary}
            >
              {showPassword
                ? <EyeOff size={15} strokeWidth={1.5} />
                : <Eye size={15} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 12, color: 'rgba(255,100,100,0.8)', margin: 0 }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 12, color: 'rgba(100,220,130,0.8)', margin: 0 }}
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '11px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#000',
              background: loading ? 'rgba(255,255,255,0.5)' : '#fff',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
          >
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ fontSize: 13, color: t.text.tertiary, marginTop: 20, textAlign: 'center' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: t.text.secondary, fontFamily: 'inherit',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
