const { createJsonCompletion } = require('./groqClient');

const parseVendorProposal = async (emailText) => {
  if (!emailText || typeof emailText !== 'string') {
    throw new Error('Email body text is required to parse a proposal');
  }

  const messages = [
    {
      role: 'system',
      content: 'You extract structured procurement proposal data from raw email text and respond with JSON only.',
    },
    {
      role: 'user',
      content: `From the following email, extract and return ONLY JSON with:
- item_prices: array of { item: string, price: number }
- total_cost: number
- delivery_time: string
- terms: string
- conditions: string

Email body:
${emailText}`,
    },
  ];

  const parsed = await createJsonCompletion(messages, { maxTokens: 800 });

  if (!Array.isArray(parsed.item_prices)) {
    parsed.item_prices = [];
  }

  return parsed;
};

module.exports = { parseVendorProposal };
