const axios = require("axios");
const config = require("../../config/env");

const parseVendorProposal = async (rawEmailText) => {
  const prompt = `
You are an AI that extracts structured data from vendor proposal emails.

Extract and return ONLY a clean JSON object with the following fields:

{
  "item_prices": [{ "item": "string", "price": number }],
  "total_cost": number,
  "delivery_time": "string",
  "terms": "string",
  "conditions": "string"
}

Email text to analyze:
${rawEmailText}

Do NOT include explanation. Do NOT include markdown. Only output valid JSON.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You extract structured pricing data from vendor proposal emails." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1
    },
    {
      headers: {
        Authorization: `Bearer ${config.LLM_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const raw = response.data.choices[0].message.content;

  const cleaned = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
};

module.exports = { parseVendorProposal };
