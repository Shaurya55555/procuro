const express = require('express');
const rfpController = require('./rfp.controller');

const router = express.Router();

router.post('/', rfpController.createRfp);
router.get('/', rfpController.getAllRfps);
router.post('/from-text', rfpController.generateRfpFromText);
router.get('/:id/compare', rfpController.compareProposals);
router.get('/:id', rfpController.getRfpById);

module.exports = router;
