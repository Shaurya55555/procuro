const emailService = require('./email.service');

const sendRfpEmail = async (req, res) => {
  try {
    const payload = {
      rfpId: req.body?.rfpId,
      vendorIds: req.body?.vendorIds,
    };

    const { sentTo } = await emailService.sendRfpEmails(payload);

    res.json({ success: true, sentTo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  sendRfpEmail
};