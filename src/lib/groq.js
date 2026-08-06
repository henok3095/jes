const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';

const VALID_CATEGORIES = [
  'random', 'music', 'movies', 'politics', 'books',
  'tech', 'health', 'travel', 'people', 'ideas', 'feelings', 'goals',
];

function buildSystemPrompt(thoughts) {
  const thoughtsText = thoughts
    .map((t, i) => `${i + 1}. [${t.category}] "${t.title}" — ${t.content || t.preview} (${t.date})`)
    .join('\n');

  return `You are Jes AI, a personal mind analyst. You have deep access to the user's private thought vault and your job is to help them understand their own thinking — surface patterns, find connections between ideas, highlight blind spots, and reflect their inner world back to them with clarity and insight.

You are NOT a generic assistant. Every response must reference the user's actual thoughts.

Here are all of ${thoughts.length} thoughts in the user's vault:

${thoughtsText}

Guidelines:
- Be specific — reference actual thought titles and content
- Be insightful — say things the user hasn't noticed about themselves
- Be concise — no fluff, no filler
- Be direct — speak like a trusted advisor, not a chatbot
- When you see patterns across thoughts, name them explicitly
- If the vault is empty, gently encourage the user to start capturing thoughts`;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function askGroq(userMessage, thoughts, onChunk) {
  const systemPrompt = buildSystemPrompt(thoughts);

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 600,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq request failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;
        if (token) {
          full += token;
          onChunk(full);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return full;
}

// ── Auto-organize (tags + category) ─────────────────────────────────────────

export async function organizeThought(title, content) {
  const prompt = `You are a thought organizer. Given the following thought, respond with ONLY a valid JSON object — no explanation, no markdown, no code block.

Thought: "${title}"
${content && content !== title ? `Details: "${content}"` : ''}

Rules:
- "tags": array of 2-4 lowercase single-word or hyphenated tags that describe this thought
- "category": exactly one of: random, music, movies, politics, books, tech, health, travel, people, ideas, feelings, goals

Example response:
{"tags":["album","lyrics","inspiration"],"category":"music"}

Respond with JSON only:`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!response.ok) return null;

  try {
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);

    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'random';

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.slice(0, 4).map((t) => String(t).toLowerCase().replace(/\s+/g, '-'))
      : [];

    return { tags, category };
  } catch {
    return null;
  }
}

// ── Find connections ─────────────────────────────────────────────────────────

export async function findConnections(newThought, existingThoughts) {
  if (!existingThoughts || existingThoughts.length === 0) return [];

  const list = existingThoughts
    .map((t) => `ID:${t.id} — "${t.title}" [${t.category}] tags:${(t.tags || []).join(',')}`)
    .join('\n');

  const prompt = `You are a semantic connection finder. Given a new thought and a list of existing thoughts, return the IDs of thoughts that are meaningfully related to the new thought.

New thought: "${newThought.title}"
${newThought.content && newThought.content !== newThought.title ? `Content: "${newThought.content}"` : ''}
Category: ${newThought.category}
Tags: ${(newThought.tags || []).join(', ')}

Existing thoughts:
${list}

Rules:
- Return ONLY a JSON array of ID strings, e.g. ["abc-123", "def-456"]
- Include IDs where there is a clear thematic, conceptual, or practical connection
- Return empty array [] if nothing is clearly related
- Maximum 5 connections
- No explanation, no markdown, just the JSON array

Response:`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.1,
      stream: false,
    }),
  });

  if (!response.ok) return [];

  try {
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const ids = JSON.parse(match[0]);
    if (!Array.isArray(ids)) return [];
    const validIds = existingThoughts.map((t) => t.id);
    return ids.filter((id) => validIds.includes(id)).slice(0, 5);
  } catch {
    return [];
  }
}

// ── Synthesis ─────────────────────────────────────────────────────────────────

export async function synthesizeThoughts(thoughts) {
  if (!thoughts || thoughts.length < 2) return null;

  const thoughtsText = thoughts
    .map((t, i) => `${i + 1}. [${t.category}] "${t.title}" — ${t.content || t.preview}`)
    .join('\n');

  const prompt = `You are a brilliant personal analyst and writer. Below are a person's raw, scattered thoughts captured over time. Your job is to read all of them deeply and synthesize them into coherent insight clusters.

Here are the thoughts:
${thoughtsText}

Instructions:
- Group the thoughts into 2-5 meaningful thematic clusters
- Each cluster should reveal a pattern the person may not have consciously noticed
- For each cluster, write a short, flowing paragraph (3-5 sentences) in second person ("You...") that synthesizes the thoughts into something insightful and surprising
- The writing should feel like a mirror — the person should read it and think "I never saw it that way but that's exactly right"
- Give each cluster a short, evocative title (not generic like "Technology" — something like "Building the machine" or "The hunger to connect")

Respond ONLY with a valid JSON array. No markdown, no explanation. Format:
[
  {
    "title": "cluster title",
    "thoughts": ["thought title 1", "thought title 2"],
    "synthesis": "The synthesized paragraph written in second person..."
  }
]`;

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.75,
      stream: false,
    }),
  });

  if (!response.ok) return null;

  try {
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
