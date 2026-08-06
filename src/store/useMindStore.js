import { create } from 'zustand';
import { thoughtsService } from '../lib/thoughtsService';
import { organizeThought, findConnections } from '../lib/groq';

export const useMindStore = create((set, get) => ({
  thoughts: [],
  loading: false,
  error: null,
  searchOpen: false,

  // ── Auth lifecycle ──────────────────────────────────────────────
  // Call this once after sign-in to load thoughts
  fetchThoughts: async () => {
    set({ loading: true, error: null });
    try {
      const thoughts = await thoughtsService.getAll();
      set({ thoughts, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Clear everything on sign-out
  clearThoughts: () => set({ thoughts: [], loading: false, error: null }),

  // ── CRUD ────────────────────────────────────────────────────────
  addThought: async (thought) => {
    try {
      // Save immediately with defaults
      const created = await thoughtsService.create(thought);
      set((s) => ({ thoughts: [created, ...s.thoughts] }));

      // Run AI organization + connection finding in parallel (background)
      const existingThoughts = get().thoughts.filter((t) => t.id !== created.id);

      Promise.all([
        organizeThought(created.title, created.content),
        findConnections(created, existingThoughts),
      ]).then(async ([organized, connectionIds]) => {
        if (!organized && connectionIds.length === 0) return;

        const updates = {
          ...created,
          tags:        organized?.tags     ?? created.tags,
          category:    organized?.category ?? created.category,
          connections: connectionIds,
        };

        const updated = await thoughtsService.update(created.id, updates);

        // Also update the reverse side — add this thought's ID to connected thoughts
        if (connectionIds.length > 0) {
          connectionIds.forEach(async (cid) => {
            const target = get().thoughts.find((t) => t.id === cid);
            if (!target) return;
            if (target.connections.includes(created.id)) return;
            const updatedTarget = await thoughtsService.update(cid, {
              ...target,
              connections: [...target.connections, created.id],
            });
            set((s) => ({
              thoughts: s.thoughts.map((t) => t.id === cid ? updatedTarget : t),
            }));
          });
        }

        // Update the new thought in state
        set((s) => ({
          thoughts: s.thoughts.map((t) => t.id === updated.id ? updated : t),
        }));
      }).catch(() => {
        // Silently fail — thought is already saved
      });

      return created;
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateThought: async (id, updates) => {
    try {
      const updated = await thoughtsService.update(id, updates);
      set((s) => ({
        thoughts: s.thoughts.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  deleteThought: async (id) => {
    try {
      await thoughtsService.delete(id);
      set((s) => ({ thoughts: s.thoughts.filter((t) => t.id !== id) }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Search ──────────────────────────────────────────────────────
  setSearchOpen: (val) => set({ searchOpen: val }),

  getFilteredThoughts: (query) => {
    const q = query.toLowerCase();
    return get().thoughts.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  },
}));
