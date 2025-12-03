const express = require('express');
const router = express.Router();
const vendorController = require('./vendor.controller');

router.post('/', vendorController.createVendor);
router.get('/', vendorController.getAllVendors);

module.exports = router;