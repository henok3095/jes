export const CATEGORIES = [
  { id: 'random',   label: 'Random Thoughts', color: '#A78BFA' },
  { id: 'music',    label: 'Music',            color: '#F472B6' },
  { id: 'movies',   label: 'Movies & TV',      color: '#FB923C' },
  { id: 'politics', label: 'Politics',          color: '#60A5FA' },
  { id: 'books',    label: 'Books',             color: '#FBBF24' },
  { id: 'tech',     label: 'Technology',        color: '#4F8CFF' },
  { id: 'health',   label: 'Health',            color: '#34D399' },
  { id: 'travel',   label: 'Travel',            color: '#6EE7B7' },
  { id: 'people',   label: 'People',            color: '#FF8C69' },
  { id: 'ideas',    label: 'Ideas',             color: '#E879F9' },
  { id: 'feelings', label: 'Feelings',          color: '#FDA4AF' },
  { id: 'goals',    label: 'Goals',             color: '#67E8F9' },
];

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id);
