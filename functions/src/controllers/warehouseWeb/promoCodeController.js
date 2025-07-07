const promoCodeService = require('../../services/warehouseWeb/promoCodeService');

class PromoCodeController {
  async createPromoCode(req, res) {
    try {
      const result = await promoCodeService.createPromoCode(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async validatePromoCode(req, res) {
    try {
      const promoDoc = await promoCodeService.validatePromoCode(req.body);
      const promoData = promoDoc.data();

      const now = new Date();
      if (now < promoData.startDate.toDate()) {
        return res.status(400).json({ error: 'Promo code not yet active' });
      }
      if (now > promoData.endDate.toDate()) {
        return res.status(400).json({ error: 'Promo code expired' });
      }
      if (promoData.usageLimit && promoData.currentUsage >= promoData.usageLimit) {
        return res.status(400).json({ error: 'Usage limit reached' });
      }
      if (promoData.productId && promoData.productId !== req.body.productId) {
        return res.status(400).json({ error: 'Invalid for this product' });
      }

      res.json({
        valid: true,
        discountPercentage: promoData.discountPercentage,
        promoCodeId: promoDoc.id,
      });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async incrementUsage(req, res) {
    try {
      await promoCodeService.incrementUsage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PromoCodeController();