const axios = require('axios');
const config = require('../../config/env');


const parseVendorProposal = async (emailText) => {
  const prompt = `
    Analyze the following email proposal and extract these fields:
    - item_prices (array of { item, price })
    - total_cost
    - delivery_time
    - terms
    - conditions

    Email: "${emailText}"

    Return ONLY valid JSON.
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

module.exports = { parseVendorProposal };
