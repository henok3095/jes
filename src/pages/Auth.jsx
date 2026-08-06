import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const { t } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

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

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: t.border }} />
          <span style={{ fontSize: 11, color: t.text.tertiary }}>or</span>
          <div style={{ flex: 1, height: 1, background: t.border }} />
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: t.text.primary,
            background: t.surface,
            border: `1px solid ${t.border}`,
            cursor: googleLoading ? 'default' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'border-color 0.12s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = t.borderHover}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = t.border}
        >
          {/* Google icon */}
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

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
