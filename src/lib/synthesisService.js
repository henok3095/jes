import { supabase } from './supabase';

export const synthesisService = {
  async getAll() {
    const { data, error } = await supabase
      .from('syntheses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async save(scope, clusters) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('syntheses')
      .insert({ user_id: session.user.id, scope, clusters })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('syntheses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
