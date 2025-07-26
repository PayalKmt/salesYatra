const promoCodeService = require('../../services/warehouseWeb/promoCodeService');

class PromoCodeController {
  async createPromoCode(req, res) {
    try {
      const result = await promoCodeService.createPromoCode(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createPromoCode controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async getAllPromoCodes(req, res) {
    try {
      const promoCodes = await promoCodeService.getAllPromoCodes(req.params.warehouseId);
      res.status(200).json(promoCodes);
    } catch (error) {
      console.error('Error in getAllPromoCodes controller:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async updatePromoCode(req, res) {
    try {
      const result = await promoCodeService.updatePromoCode(req.params.promoCodeId,req.body);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updatePromoCode controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async deletePromoCode(req, res) {
    try {
      const result = await promoCodeService.deletePromoCode(req.params.promoCodeId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deletePromoCode controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async validatePromoCode(req, res) {
    try {
      // The service now returns the promoCodeData directly, not a Firestore DocumentSnapshot
      const promoCodeData = await promoCodeService.validatePromoCode(req.body);

      const now = new Date();
      // startDate and endDate are now Date objects from Zod's coerce.date()
      if (now < promoCodeData.startDate) {
        return res.status(400).json({ error: 'Promo code not yet active' });
      }
      if (now > promoCodeData.endDate) {
        return res.status(400).json({ error: 'Promo code expired' });
      }
      if (promoCodeData.usageLimit && promoCodeData.currentUsage >= promoCodeData.usageLimit) {
        return res.status(400).json({ error: 'Usage limit reached' });
      }

      // The check for productId applicability is now handled within the service's validatePromoCode function.
      // So, the redundant check `if (promoData.productId && promoData.productId !== req.body.productId)` is removed.

      res.json({
        valid: true,
        discountPercentage: promoCodeData.discountPercentage,
        promoCodeId: promoCodeData.promoCodeId, // Use promoCodeId from the data
      });
    } catch (error) {
      console.error('Error in validatePromoCode controller:', error.message);
      res.status(404).json({ error: error.message });
    }
  }

  async incrementUsage(req, res) {
    try {
      await promoCodeService.incrementUsage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error in incrementUsage controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async assignPromoCodeToProduct(req, res) {
    try {
      const result = await promoCodeService.assignPromoCodeToProduct(req.params.promoCodeId, req.body.productId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in assignPromoCodeToProduct controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async unassignPromoCodeFromProduct(req, res) {
    try {
      const result = await promoCodeService.unassignPromoCodeFromProduct(req.params.promoCodeId, req.body.productId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in unassignPromoCodeFromProduct controller:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new PromoCodeController();
