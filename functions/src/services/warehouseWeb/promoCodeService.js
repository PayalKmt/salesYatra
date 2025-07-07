const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const db = admin.firestore();

const { promoCodeSchema, validatePromoCodeSchema } = require('../../schemas/warehouseWeb/promoCodeValidation');

// Create promo code
const createPromoCode = async (data) => {
  try {
    // ✅ Zod directly parses or throws
    const validatedData = promoCodeSchema.parse(data);

    const promoCodeId = uuidv4();
    const promoRef = db.collection('promocodes').doc(promoCodeId);

    await promoRef.set({
      promoCodeId,
      ...validatedData,
      productId: validatedData.productId || null,
      currentUsage: 0,
    });

    return { id: promoCodeId, ...validatedData };
  } catch (err) {
    console.error('Error creating promo code:', err.message);
    throw err; // Re-throw to let the controller handle it
  }
};

// Validate promo code
const validatePromoCode = async (data) => {
  try {
    // ✅ Zod parses or throws
    const validatedData = validatePromoCodeSchema.parse(data);

    const promoQuery = await db.collection('promocodes')
      .where('code', '==', validatedData.code)
      .where('warehouseId', '==', validatedData.warehouseId)
      .get();

    if (promoQuery.empty) {
      throw new Error('Promo code not found');
    }

    return promoQuery.docs[0];
  } catch (err) {
    console.error('Error validating promo code:', err.message);
    throw err;
  }
};

// Increment promo code usage
const incrementUsage = async (promoCodeId) => {
  try {
    if (!promoCodeId) throw new Error('Promo code ID is required');

    const promoRef = db.collection('promocodes').doc(promoCodeId);
    await promoRef.update({
      currentUsage: admin.firestore.FieldValue.increment(1),
    });

    return { success: true };
  } catch (err) {
    console.error('Error incrementing promo code usage:', err.message);
    throw err;
  }
};

module.exports = {
  createPromoCode,
  validatePromoCode,
  incrementUsage,
};