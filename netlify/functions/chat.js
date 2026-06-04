// SYSTEM_PROMPT: Paste Carl's portfolio description below.
// This is injected as the first message in every Groq request.
const SYSTEM_PROMPT = `You are a helpful portfolio assistant for Carl Emmanuel Macabales, a 3rd-year Computer Science student at Mapúa University specializing in AI/ML. Answer only questions about Carl — his projects, skills, background, and experience. Be concise, friendly, and accurate. If a visitor asks something unrelated to Carl, politely redirect back to his portfolio.

[Carl: replace this block with your detailed system prompt lines about yourself, your projects, skills, and experience.]`;

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.1-8b-instant',
];

async function callGroq(apiKey, model, messages) {
  const res = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body));
    if (!Array.isArray(messages)) throw new Error('invalid');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (messages.length > 20) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Too many messages' }) };
  }

  const ALLOWED_ROLES = new Set(['user', 'assistant']);
  const validMessages = messages.every(
    (m) => ALLOWED_ROLES.has(m.role) && typeof m.content === 'string' && m.content.length <= 2000
  );
  if (!validMessages) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid messages' }) };
  }

  for (const model of MODELS) {
    try {
      const data = await callGroq(apiKey, model, messages);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('EMPTY_RESPONSE');
      return { statusCode: 200, headers, body: JSON.stringify({ content }) };
    } catch (err) {
      if (err.message === 'RATE_LIMITED' || err.message === 'EMPTY_RESPONSE') continue;
      console.error(`Model ${model} failed:`, err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
    }
  }

  return {
    statusCode: 503,
    headers,
    body: JSON.stringify({ error: 'All models rate limited' }),
  };
};
