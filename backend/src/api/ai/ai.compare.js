const axios = require("axios");
const config = require("../../config/env");

const compareProposals = async (rfp, proposals) => {
  const prompt = `
You are an AI procurement assistant. 
Compare the following RFP requirements against the vendor proposals.

Return ONLY a valid JSON object with this structure:

{
  "ranking": ["vendor_id1", "vendor_id2", ...],
  "scores": { "vendor_id1": number, "vendor_id2": number },
  "recommendation": "string summary"
}

RFP Requirements:
${JSON.stringify(rfp, null, 2)}

Vendor Proposals:
${JSON.stringify(proposals, null, 2)}

Do NOT include any explanation outside of the JSON. Only return JSON.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a procurement AI specializing in vendor evaluation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1
    },
    {
      headers: {
        "Authorization": `Bearer ${config.LLM_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const raw = response.data.choices[0].message.content;

  const cleaned = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
};

module.exports = { compareProposals };
