const axios = require('axios');
const config = require('../../config/env');

const db = require('../../db');


const compareProposalsAi = async (rfpId) => {
  const rfp = (await db.query(`SELECT * FROM rfp WHERE id=$1`, [rfpId])).rows[0];
  const proposals = (await db.query(`SELECT * FROM proposals WHERE rfp_id=$1`, [rfpId])).rows;

  if (!rfp) throw new Error("RFP not found");
  if (proposals.length === 0) throw new Error("No proposals found");

  const prompt = `
    Compare the following vendor proposals against the RFP requirements.
    Return a valid JSON object with:
    - ranking (array of vendor ids sorted by best fit)
    - scores (object mapping vendor_id to a score out of 100)
    - recommendation (string summary)

    RFP: ${JSON.stringify(rfp, null, 2)}

    Vendor Proposals: ${JSON.stringify(proposals, null, 2)}
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

module.exports = { compareProposalsAi };
