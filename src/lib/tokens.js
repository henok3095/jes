// Static fallback tokens (dark) — used in files outside ThemeContext
// For live theming use useTheme() from ThemeContext
export const t = {
  bg: '#080808',
  surface: '#0f0f0f',
  surfaceHover: '#141414',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.45)',
    tertiary: 'rgba(255,255,255,0.22)',
  },
  accent: '#fff',
};

export const CATEGORY_COLORS = {
  random:        { dot: '#A78BFA', label: 'Random Thoughts' },
  music:         { dot: '#F472B6', label: 'Music' },
  movies:        { dot: '#FB923C', label: 'Movies & TV' },
  politics:      { dot: '#60A5FA', label: 'Politics' },
  books:         { dot: '#FBBF24', label: 'Books' },
  tech:          { dot: '#4F8CFF', label: 'Technology' },
  health:        { dot: '#34D399', label: 'Health' },
  travel:        { dot: '#6EE7B7', label: 'Travel' },
  people:        { dot: '#FF8C69', label: 'People' },
  ideas:         { dot: '#E879F9', label: 'Ideas' },
  feelings:      { dot: '#FDA4AF', label: 'Feelings' },
  goals:         { dot: '#67E8F9', label: 'Goals' },
};
