import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { useMindStore } from '../store/useMindStore';
import { CATEGORY_COLORS } from '../lib/tokens';
import { useTheme } from '../lib/ThemeContext';

const TOOLTIP_STYLE = {
  background: '#111',
  border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 8,
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  boxShadow: 'none',
};

function Section({ title, children, delay = 0, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{ marginBottom: 36 }}
    >
      <p style={{
        fontSize: 11, fontWeight: 500, color: t.text.tertiary,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16,
      }}>
        {title}
      </p>
      {children}
    </motion.div>
  );
}

function computeStreak(thoughts) {
  if (!thoughts.length) return 0;
  const days = [...new Set(thoughts.map((t) => t.date))].sort((a, b) => new Date(b) - new Date(a));
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]) - new Date(days[i])) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function computeMonthlyGrowth(thoughts) {
  const counts = {};
  thoughts.forEach((t) => {
    if (!t.date) return;
    const key = t.date.slice(0, 7); // "2026-08"
    counts[key] = (counts[key] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  // Show last 6 months at most
  return sorted.slice(-6).map(([key, v]) => {
    const [, month] = key.split('-');
    const label = new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' });
    return { m: label, v };
  });
}

function computeTopTags(thoughts) {
  const counts = {};
  thoughts.forEach((t) => {
    (t.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));
}

function computeObservations(thoughts, catData, totalLinks) {
  const obs = [];
  if (!thoughts.length) return [{ text: 'Start capturing thoughts to see your patterns emerge.', em: false }];

  // Top category
  if (catData.length > 0) {
    const top = catData[0];
    const pct = Math.round((top.count / thoughts.length) * 100);
    obs.push({ text: `${top.label} is your most active category — ${pct}% of your thoughts.`, em: false });
  }

  // Most connected thought
  const mostConnected = [...thoughts].sort((a, b) => b.connections.length - a.connections.length)[0];
  if (mostConnected?.connections.length > 0) {
    obs.push({ text: `"${mostConnected.title}" has the most connections (${mostConnected.connections.length}).`, em: false });
  }

  // Underrepresented category
  const allCats = Object.keys(CATEGORY_COLORS);
  const missing = allCats.filter((c) => !thoughts.find((t) => t.category === c));
  if (missing.length > 0) {
    const label = CATEGORY_COLORS[missing[0]]?.label;
    obs.push({ text: `You haven't thought about ${label} yet — worth reflecting on.`, em: true });
  }

  // Connections density
  if (thoughts.length > 1) {
    const density = (totalLinks / thoughts.length).toFixed(1);
    obs.push({ text: `On average, each thought connects to ${density} others.`, em: false });
  }

  // Streak observation
  const streak = computeStreak(thoughts);
  if (streak >= 3) {
    obs.push({ text: `You're on a ${streak}-day thinking streak. Keep going.`, em: false });
  }

  return obs;
}

export default function Insights() {
  const { thoughts } = useMindStore();
  const { t } = useTheme();

  const catData = useMemo(() =>
    Object.entries(CATEGORY_COLORS)
      .map(([id, { dot, label }]) => ({
        id, dot, label,
        count: thoughts.filter((th) => th.category === id).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count),
    [thoughts]
  );

  const totalLinks = useMemo(() =>
    thoughts.reduce((s, th) => s + (th.connections?.length || 0), 0),
    [thoughts]
  );

  const monthlyData = useMemo(() => computeMonthlyGrowth(thoughts), [thoughts]);
  const topTags = useMemo(() => computeTopTags(thoughts), [thoughts]);
  const observations = useMemo(() => computeObservations(thoughts, catData, totalLinks), [thoughts, catData, totalLinks]);
  const streak = useMemo(() => computeStreak(thoughts), [thoughts]);

  const uniqueDays = useMemo(() =>
    new Set(thoughts.map((t) => t.date)).size,
    [thoughts]
  );

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '48px 40px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.025em' }}>
            Insights
          </h1>
          <p style={{ fontSize: 12, color: t.text.tertiary, marginTop: 4 }}>
            Patterns in your thinking
          </p>
        </motion.div>

        {/* Overview numbers */}
        <Section title="Overview" delay={0.05} t={t}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total thoughts', value: thoughts.length },
              { label: 'Mind connections', value: totalLinks },
              { label: 'Active categories', value: catData.length },
              { label: 'Day streak', value: streak ? `${streak}d` : '—' },
              { label: 'Active days', value: uniqueDays },
              { label: 'Avg per day', value: uniqueDays ? (thoughts.length / uniqueDays).toFixed(1) : '—' },
            ].map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: t.text.primary, letterSpacing: '-0.03em' }}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: t.text.tertiary, marginTop: 3 }}>{label}</div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Growth over time */}
        {monthlyData.length > 0 && (
          <Section title="Growth" delay={0.15} t={t}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '20px' }}>
              {monthlyData.length < 2 ? (
                <p style={{ fontSize: 13, color: t.text.tertiary, textAlign: 'center', padding: '24px 0' }}>
                  Capture thoughts over multiple days to see growth trends.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tick={{ fill: t.text.tertiary, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: t.text.tertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                    <Area type="monotone" dataKey="v" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} fill="url(#ag)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Section>
        )}

        {/* Category breakdown */}
        {catData.length > 0 && (
          <Section title="Categories" delay={0.2} t={t}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {catData.map(({ id, dot, label, count }, i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: t.text.secondary, width: 110, flexShrink: 0 }}>{label}</span>
                  <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / thoughts.length) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.04, duration: 0.6, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: 99, background: dot }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: t.text.tertiary, width: 20, textAlign: 'right', flexShrink: 0 }}>
                    {count}
                  </span>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Top tags */}
        {topTags.length > 0 && (
          <Section title="Top tags" delay={0.25} t={t}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topTags.map(({ tag, count }, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    color: t.text.secondary,
                  }}
                >
                  <span>{tag}</span>
                  <span style={{ fontSize: 11, color: t.text.tertiary }}>{count}</span>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Category bar chart */}
        {catData.length > 1 && (
          <Section title="By category" delay={0.3} t={t}>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '20px' }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={catData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={14}>
                  <XAxis dataKey="label" tick={{ fill: t.text.tertiary, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.text.tertiary, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {catData.map((entry) => (
                      <rect key={entry.id} fill={entry.dot} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* Observations */}
        <Section title="Observations" delay={0.35} t={t}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {observations.map(({ text, em }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                style={{
                  fontSize: 13,
                  color: em ? t.text.secondary : t.text.tertiary,
                  padding: '11px 0',
                  borderBottom: i < observations.length - 1 ? `1px solid ${t.border}` : 'none',
                  lineHeight: 1.6,
                }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </Section>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
