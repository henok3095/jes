import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, RotateCcw } from 'lucide-react';
import { t } from '../lib/tokens';
import { askGroq } from '../lib/groq';
import { useMindStore } from '../store/useMindStore';

const SUGGESTED = [
  'What patterns do you see in my thinking?',
  'Which of my ideas should I pursue first?',
  'What connections have I missed?',
  'What am I not thinking about enough?',
];

const WELCOME = "I've read through your vault. Your mind has a clear shape. What do you want to understand about it?";

export default function Chat() {
  const { thoughts } = useMindStore();
  const [messages, setMessages] = useState([
    { id: '0', role: 'ai', text: WELCOME, streaming: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: msg };
    setInput('');
    setLoading(true);

    // Add user message + empty AI placeholder
    const aiId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiId, role: 'ai', text: '', streaming: true },
    ]);

    try {
      await askGroq(msg, thoughts, (partialText) => {
        // Update the streaming message in place
        setMessages((prev) =>
          prev.map((m) => m.id === aiId ? { ...m, text: partialText } : m)
        );
      });

      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) => m.id === aiId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, text: `Something went wrong: ${err.message}`, streaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([{ id: '0', role: 'ai', text: WELCOME, streaming: false }]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: '14px 24px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: t.text.primary }}>Jes AI</span>
          <span style={{ fontSize: 12, color: t.text.tertiary }}>
            {thoughts.length} thoughts in context
          </span>
        </div>
        <button
          onClick={reset}
          style={{ color: t.text.tertiary, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', padding: 4 }}
          title="New conversation"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: t.text.primary,
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : t.surface,
                    border: `1px solid ${t.border}`,
                    borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
                    padding: '10px 14px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text || (msg.streaming && (
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center', paddingTop: 2 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }}
                        />
                      ))}
                    </span>
                  ))}
                  {/* Blinking cursor while streaming */}
                  {msg.streaming && msg.text && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ display: 'inline-block', width: 2, height: '1em', background: t.text.tertiary, marginLeft: 2, verticalAlign: 'text-bottom' }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ flexShrink: 0, padding: '0 24px 8px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  color: t.text.tertiary,
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.1s',
                  whiteSpace: 'nowrap',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.color = t.text.secondary; }}}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text.tertiary; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, padding: '8px 24px 24px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: '10px 10px 10px 14px',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={(e) => e.currentTarget.style.borderColor = t.borderHover}
            onBlurCapture={(e) => e.currentTarget.style.borderColor = t.border}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your mind anything..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                color: t.text.primary,
                lineHeight: 1.5,
                maxHeight: 120,
                overflowY: 'auto',
                fontFamily: 'inherit',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: input.trim() && !loading ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.07)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <ArrowUp size={14} style={{ color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.25)' }} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
