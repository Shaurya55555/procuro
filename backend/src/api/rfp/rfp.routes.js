const express = require('express');
const router = express.Router();
const rfpController = require('./rfp.controller');

router.post('/', rfpController.createRfp);
router.get('/', rfpController.getAllRfps);
router.get('/:id', rfpController.getRfpById);

// FIXED HERE
router.post('/from-text', rfpController.generateRfpFromText);

router.get('/:id/compare', rfpController.compareProposals);

module.exports = router;
