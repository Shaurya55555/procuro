const axios = require('axios');
const config = require('../../config/env');


const generateStructuredRfp = async (rawText) => {
  const prompt = `
    Extract the following fields from the text below and return ONLY a valid JSON object:
    - title (string)
    - budget (number or string)
    - items (array of strings)
    - delivery_timeline (string)
    - payment_terms (string)
    - warranty (string)

    Text: "${rawText}"
  `;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.LLM_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );

  const textResponse = response.data.candidates[0].content.parts[0].text;
  const jsonString = textResponse.replace(/```json|```/g, '').trim();

  return JSON.parse(jsonString);
};

module.exports = { generateStructuredRfp };
