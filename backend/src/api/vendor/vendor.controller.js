const vendorService = require('./vendor.service');

const createVendor = async (req, res) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json(vendors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createVendor,
  getAllVendors
};