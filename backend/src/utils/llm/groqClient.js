const Groq = require('groq-sdk');
const config = require('../../config/env');

const groq = new Groq({ apiKey: config.LLM_API_KEY });

/**
 * Clean LLM output into valid JSON.
 */
const sanitizeJson = (rawContent) => {
  if (!rawContent) {
    throw new Error('LLM returned an empty response');
  }

  if (typeof rawContent !== 'string') {
    throw new Error('LLM returned an unexpected response format');
  }

  // Remove markdown wrappers or "json" prefixes
  const stripped = rawContent
    .replace(/```json|```/gi, '')
    .replace(/^json\s*/i, '')
    .trim();

  // Find the first { or [
  const firstCurly = stripped.indexOf('{');
  const firstBracket = stripped.indexOf('[');
  const startIndex = [firstCurly, firstBracket]
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];

  const sanitized =
    typeof startIndex === 'number' ? stripped.slice(startIndex) : stripped;

  // Find last } or ]
  const lastCurly = sanitized.lastIndexOf('}');
  const lastBracket = sanitized.lastIndexOf(']');
  const endIndex = Math.max(lastCurly, lastBracket);

  const finalPayload =
    endIndex >= 0 ? sanitized.slice(0, endIndex + 1) : sanitized;

  try {
    return JSON.parse(finalPayload);
  } catch (err) {
    throw new Error(`LLM returned invalid JSON: ${err.message}`);
  }
};

/**
 * Safe JSON completion wrapper for Groq.
 */
const createJsonCompletion = async (messages, options = {}) => {
  const completion = await groq.chat.completions.create({
    // FIXED — old model was decommissioned
    model: 'llama-3.3-70b-versatile',

    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens ?? 1024,

    messages,

    // IMPORTANT: ensures model returns JSON only
    response_format: { type: "json_object" }
  });

  const content = completion?.choices?.[0]?.message?.content;

  const asText = Array.isArray(content)
    ? content
        .map((segment) =>
          typeof segment === 'string' ? segment : segment?.text ?? ''
        )
        .join('')
    : content;

  return sanitizeJson(asText);
};

module.exports = {
  createJsonCompletion,
  sanitizeJson,
};
