const Groq = require('groq-sdk');
const config = require('../../config/env');

const groq = new Groq({ apiKey: config.LLM_API_KEY });

const sanitizeJson = (rawContent) => {
  if (!rawContent) {
    throw new Error('LLM returned an empty response');
  }

  const stripped = rawContent
    .replace(/```json|```/gi, '')
    .replace(/^json\s*/i, '')
    .trim();

  const firstCurly = stripped.indexOf('{');
  const firstBracket = stripped.indexOf('[');
  const startIndex = [firstCurly, firstBracket]
    .filter(index => index >= 0)
    .sort((a, b) => a - b)[0];

  const sanitized = typeof startIndex === 'number' ? stripped.slice(startIndex) : stripped;

  const lastCurly = sanitized.lastIndexOf('}');
  const lastBracket = sanitized.lastIndexOf(']');
  const endIndex = Math.max(lastCurly, lastBracket);
  const finalPayload = endIndex >= 0 ? sanitized.slice(0, endIndex + 1) : sanitized;

  try {
    return JSON.parse(finalPayload);
  } catch (error) {
    throw new Error(`LLM returned invalid JSON: ${error.message}`);
  }
};

const createJsonCompletion = async (messages, options = {}) => {
  const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens ?? 1024,
    messages,
  });

  const content = completion?.choices?.[0]?.message?.content;
  return sanitizeJson(content);
};

module.exports = {
  createJsonCompletion,
  sanitizeJson,
};
