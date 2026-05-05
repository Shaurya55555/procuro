const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { startImapListener } = require('./api/email/email.imap');
const { parseVendorProposal } = require('./utils/llm/parseVendorProposal');
const db = require('./db');

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);

  startImapListener(async (email) => {
    logger.info(`[IMAP] New email received: "${email.subject}"`);

    const body = email.body;
    if (!body || body.trim().length === 0) {
      logger.error('[IMAP] Skipping email — body is empty');
      return;
    }

    // Attempt to parse the proposal with AI
    let parsed;
    try {
      parsed = await parseVendorProposal(body);
      logger.info('[IMAP] Proposal parsed successfully');
    } catch (err) {
      logger.error(`[IMAP] Failed to parse proposal: ${err.message}`);
      // Store the raw email without parsed data so it is not lost
      parsed = null;
    }

    // Try to match the email to an RFP via the subject line (format: "Re: [RFP_ID]: <title>")
    // This is a best-effort lookup — a proposal without a matched RFP is still stored
    // with rfp_id = NULL so procurement staff can manually assign it later.
    // The vendor is also stored without a vendor_id since incoming emails may be
    // from unregistered senders — this can be extended with vendor lookup by email.
    try {
      // Look up vendor by email sender (body header parsing not available here, use null)
      // TODO: parse From header from email.body using mailparser for full sender info
      const rfpIdMatch = email.subject && email.subject.match(/\[RFP[:\s#]*(\d+)\]/i);
      const rfpId = rfpIdMatch ? Number(rfpIdMatch[1]) : null;

      await db.query(
        `INSERT INTO proposal (rfp_id, vendor_id, raw_email, parsed)
         VALUES ($1, $2, $3, $4)`,
        [rfpId, null, body, parsed ? JSON.stringify(parsed) : null]
      );

      logger.info(`[IMAP] Proposal stored (rfp_id=${rfpId ?? 'unmatched'})`);
    } catch (err) {
      logger.error(`[IMAP] Failed to store proposal: ${err.message}`);
    }
  });
});
