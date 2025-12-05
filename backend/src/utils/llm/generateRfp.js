const { createJsonCompletion } = require('./groqClient');

const generateStructuredRfp = async (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Input text is required to generate an RFP');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an assistant that converts freeform procurement requests into structured JSON RFP objects.',
    },
    {
      role: 'user',
      content: `Extract the following fields and return ONLY valid JSON with matching keys and sensible defaults when the information is missing.

Fields:
- title (string)
- budget (string)
- items (array of descriptive strings)
- delivery_timeline (string)
- payment_terms (string)
- warranty (string)

Raw request:
${rawText}`,
    },
  ];

  const response = await createJsonCompletion(messages, { maxTokens: 800 });

  if (!Array.isArray(response.items)) {
    response.items = []; // guarantee array output
  }

  return response;
};

module.exports = { generateStructuredRfp };
