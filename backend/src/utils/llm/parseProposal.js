const { createJsonCompletion } = require('./groqClient');

const parseProposal = async (rawEmailText) => {
  if (!rawEmailText || typeof rawEmailText !== 'string') {
    throw new Error('rawEmailText is required');
  }

  const messages = [
    {
      role: 'system',
      content:
        'You are an AI that extracts structured commercial data from vendor proposal emails. Return ONLY strict JSON with no explanation.'
    },
    {
      role: 'user',
      content: `
Extract the following fields and return ONLY valid JSON:

{
  "item_prices": [{ "item": "string", "price": number }],
  "total_cost": number,
  "delivery_time": "string",
  "terms": "string",
  "conditions": "string"
}

Email body:
${rawEmailText}
`
    }
  ];

  // --- AI CALL ---
  const parsed = await createJsonCompletion(messages, {
    maxTokens: 900
  });

  // --- NORMALIZATION SAFETY ---
  if (!Array.isArray(parsed.item_prices)) {
    parsed.item_prices = [];
  }

  // Total Cost → enforce number
  if (typeof parsed.total_cost !== 'number') {
    const numericCost = Number(parsed.total_cost);
    parsed.total_cost = Number.isFinite(numericCost) ? numericCost : 0;
  }

  parsed.delivery_time = parsed.delivery_time ? String(parsed.delivery_time) : '';
  parsed.terms = parsed.terms ? String(parsed.terms) : '';
  parsed.conditions = parsed.conditions ? String(parsed.conditions) : '';

  return parsed;
};

module.exports = { parseProposal };
