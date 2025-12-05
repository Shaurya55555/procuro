const rfpService = require('../rfp/rfp.service');
const vendorService = require('../vendor/vendor.service');
const transporter = require('../../config/mail');
const config = require('../../config/env');

const normalizeVendorIds = (vendorIds) => {
  if (!Array.isArray(vendorIds) || !vendorIds.length) {
    throw new Error('vendorIds must be a non-empty array');
  }
  return vendorIds.map((value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error('vendorIds must contain only numeric values');
    }
    return parsed;
  });
};

const sendRfpEmails = async ({ rfpId, vendorIds }) => {
  if (!rfpId) {
    throw new Error('rfpId is required');
  }

  const normalizedRfpId = Number(rfpId);
  if (Number.isNaN(normalizedRfpId)) {
    throw new Error('rfpId must be a number');
  }

  const normalizedVendorIds = normalizeVendorIds(vendorIds);

  const rfp = await rfpService.getRfpById(normalizedRfpId);
  if (!rfp) {
    throw new Error('RFP not found');
  }

  const vendors = await vendorService.getAllVendors();
  const selectedVendors = vendors.filter((vendor) => normalizedVendorIds.includes(vendor.id));

  if (!selectedVendors.length) {
    throw new Error('No valid vendors found');
  }

  const emailPromises = selectedVendors.map((vendor) => {
    const mailOptions = {
      from: config.SMTP_USER,
      to: vendor.email,
      subject: `New RFP: ${rfp.title}`,
      text: `Hello ${vendor.name},\n\nA new RFP matches your profile.\n\nDetails:\n${JSON.stringify(rfp.description_structured || {}, null, 2)}\n\nRegards,\nProcuro Team`,
    };

    return transporter.sendMail(mailOptions);
  });

  await Promise.all(emailPromises);

  return { sentTo: selectedVendors.length };
};

module.exports = {
  sendRfpEmails,
};
