const express = require('express');
const router = express.Router();
const promoCodeController = require('../../controllers/warehouseWeb/promoCodeController');

router.post('/create/promoCode', promoCodeController.createPromoCode);
router.post('/validate', promoCodeController.validatePromoCode);
router.put('/:id/increment', promoCodeController.incrementUsage);

module.exports = router;