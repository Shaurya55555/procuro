const axios = require("axios");
const config = require("../../config/env");

const generateStructuredRfp = async (rawText) => {
  const prompt = `
You are an AI that structures RFP (Request For Proposal) descriptions.

Extract the following fields and return ONLY a clean JSON object:

{
  "title": "string",
  "budget": "string or number",
  "items": ["item1", "item2"],
  "delivery_timeline": "string",
  "payment_terms": "string",
  "warranty": "string"
}

Source text:
${rawText}

Do NOT include markdown, explanation, or commentary. Only output valid JSON.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You convert raw text into precise, structured RFP JSON." },
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

module.exports = { generateStructuredRfp };
