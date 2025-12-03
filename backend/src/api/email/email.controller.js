const rfpService = require('../rfp/rfp.service');
const vendorService = require('../vendor/vendor.service');
const transporter = require('../../config/mail');
const config = require('../../config/env');

const sendRfpEmail = async (req, res) => {
  try {
    const { rfpId, vendorIds } = req.body;

    const rfp = await rfpService.getRfpById(rfpId);
    if (!rfp) throw new Error('RFP not found');

    const allVendors = await vendorService.getAllVendors();
    const vendors = allVendors.filter(v => vendorIds.includes(v.id));

    if (!vendors.length) throw new Error('No valid vendors found');

    const emailPromises = vendors.map(vendor => {
      const mailOptions = {
        from: config.SMTP_USER,
        to: vendor.email,
        subject: `New RFP: ${rfp.title}`,
        text: `Hello ${vendor.name},\n\nA new RFP matches your profile.\n\nDetails:\n${JSON.stringify(rfp.description_structured, null, 2)}\n\nRegards,\nProcuro Team`
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.json({ success: true, sentTo: vendors.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  sendRfpEmail
};