const express = require('express');
const router = express.Router();
const promoCodeController = require('../../controllers/warehouseWeb/promoCodeController');

// Route to create a new promo code
router.post('/create/promoCode', promoCodeController.createPromoCode);

router.get('/get/promoCodes/:warehouseId',promoCodeController.getAllPromoCodes);

// Route to validate a promo code
router.post('/validate/promoCode', promoCodeController.validatePromoCode);

// Route to increment promo code usage by ID
router.put('/increment/promoCodeUsage/:promoCodeId', promoCodeController.incrementUsage);

// Route to update an existing promo code by ID
router.put('/update/promoCode/:promoCodeId', promoCodeController.updatePromoCode);

// Route to delete a promo code by ID
router.delete('/delete/promoCode/:promoCodeId', promoCodeController.deletePromoCode);

// Route to assign a promo code to a product
// Assuming promoCodeId and productId are sent in the request body
router.post('/promoCode/assignToProduct/:promoCodeId', promoCodeController.assignPromoCodeToProduct);

// Route to unassign a promo code from a product
// Assuming promoCodeId and productId are sent in the request body
router.post('/promoCode/unassignFromProduct/:promoCodeId', promoCodeController.unassignPromoCodeFromProduct);

module.exports = router;
