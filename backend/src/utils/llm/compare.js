const { createJsonCompletion } = require('./groqClient');
const db = require('../../db');

const compareProposalsAi = async (rfpId) => {
  const rfpResult = await db.query('SELECT * FROM rfp WHERE id = $1', [rfpId]);
  const rfp = rfpResult.rows[0];

  if (!rfp) {
    throw new Error('RFP not found');
  }

  const proposalResult = await db.query(
    'SELECT p.*, v.name AS vendor_name, v.email AS vendor_email FROM proposal p JOIN vendor v ON v.id = p.vendor_id WHERE p.rfp_id = $1 ORDER BY p.created_at ASC',
    [rfpId]
  );

  const proposals = proposalResult.rows;

  if (!proposals.length) {
    throw new Error('No proposals found');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a procurement assistant that produces objective vendor comparisons as JSON.',
    },
    {
      role: 'user',
      content: `Compare the vendor proposals against the RFP requirements and return ONLY valid JSON with:
- ranking: array of vendor_id ordered best to worst
- scores: object mapping vendor_id to a 0-100 score
- recommendation: concise string summary referencing vendor names

RFP:
${JSON.stringify(rfp)}

Proposals (include parsed details when available):
${JSON.stringify(proposals)}
`,
    },
  ];

  const comparison = await createJsonCompletion(messages, { maxTokens: 900 });

  if (!Array.isArray(comparison.ranking)) {
    comparison.ranking = proposals.map((proposal) => String(proposal.vendor_id));
  } else {
    comparison.ranking = comparison.ranking.map((value) => String(value));
  }

  if (typeof comparison.scores !== 'object' || comparison.scores === null) {
    comparison.scores = {};
  }

  comparison.scores = Object.entries(comparison.scores).reduce((acc, [key, value]) => {
    acc[String(key)] = typeof value === 'number' ? value : Number(value) || 0;
    return acc;
  }, {});

  proposals.forEach((proposal) => {
    const vendorKey = String(proposal.vendor_id);
    if (typeof comparison.scores[vendorKey] !== 'number') {
      comparison.scores[vendorKey] = 0;
    }
  });

  return comparison;
};

module.exports = { compareProposalsAi };
