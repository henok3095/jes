import { supabase } from './supabase';

// Map DB row → app shape
const fromDb = (row) => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  content: row.content || '',
  preview: row.preview || row.title,
  category: row.category || 'random',
  tags: row.tags || [],
  connections: (row.connections || []).map(String),
  date: row.date,
  created_at: row.created_at,
  // UI-only defaults for existing dummy fields
  emoji: '·',
  mood: '',
});

// Map app shape → DB row
const toDb = (thought) => ({
  title: thought.title,
  content: thought.content || thought.title,
  preview: thought.preview || thought.title,
  category: thought.category || 'random',
  tags: thought.tags || [],
  connections: thought.connections || [],
  date: thought.date || new Date().toISOString().split('T')[0],
});

export const thoughtsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(fromDb);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return fromDb(data);
  },

  async create(thought) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('thoughts')
      .insert({ ...toDb(thought), user_id: session.user.id })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    return fromDb(data);
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('thoughts')
      .update(toDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return fromDb(data);
  },

  async delete(id) {
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
