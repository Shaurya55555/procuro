const { createJsonCompletion } = require('./groqClient');

const generateStructuredRfp = async (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Input text is required to generate an RFP');
  }

  const messages = [
    {
      role: 'system',
      content: 'You transform procurement intents into a normalized JSON schema with the required RFP fields.',
    },
    {
      role: 'user',
      content: `From the following request, extract ONLY JSON with these keys:
- title (string)
- budget (string)
- items (array of item description strings)
- delivery_timeline (string)
- payment_terms (string)
- warranty (string)
- description_raw (string capturing the original request)
- description_structured (object summarizing key requirements)

Raw request:
${rawText}`,
    },
  ];

  const response = await createJsonCompletion(messages, { maxTokens: 900 });

  if (!Array.isArray(response.items)) {
    response.items = [];
  } else {
    response.items = response.items.filter((value) => typeof value === 'string');
  }

  response.description_raw = typeof response.description_raw === 'string' ? response.description_raw : rawText;

  if (typeof response.description_structured !== 'object' || response.description_structured === null) {
    response.description_structured = {};
  }

  const normalised = {
    title: response.title ?? 'Untitled RFP',
    budget: response.budget === null || response.budget === undefined ? '' : String(response.budget),
    items: response.items,
    delivery_timeline: response.delivery_timeline ? String(response.delivery_timeline) : '',
    payment_terms: response.payment_terms ? String(response.payment_terms) : '',
    warranty: response.warranty ? String(response.warranty) : '',
    description_raw: response.description_raw,
    description_structured: response.description_structured,
  };

  return normalised;
};

module.exports = { generateStructuredRfp };
