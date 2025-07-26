const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const db = admin.firestore();

// Destructure the correct schema names from promoCodeValidation
const {
  promoCodeSchema,
  validatePromoCodeSchema,
  updatePromoCodeSchema,
  assignPromoCodeSchema,
} = require("../../schemas/warehouseWeb/promoCodeValidation");

// Create promo code
const createPromoCode = async (data) => {
  try {
    // ✅ Zod directly parses or throws
    const validatedData = promoCodeSchema.parse(data);

    const promoCodeId = uuidv4();
    const promoRef = db.collection("promocodes").doc(promoCodeId);

    await promoRef.set({
      promoCodeId,
      ...validatedData,
      // Initialize productIds as an empty array if not provided by the schema default
      productIds: validatedData.productIds || [],
      createdAt: new Date().toISOString(), // Corrected to .toISOString()
      updatedAt: new Date().toISOString(),
      currentUsage: 0,
    });

    return { promoCodeId: promoCodeId, ...validatedData };
  } catch (err) {
    console.error("Error creating promo code:", err.message);
    throw err; // Re-throw to let the controller handle it
  }
};

const getAllPromoCodes = async (warehouseId) => {
  try {
    const snapshot = await db
      .collection("promocodes")
      .where("warehouseId", "==", warehouseId)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching all promo codes:", error.message);
    throw new Error(error.message || "Failed to fetch all promo codes");
  }
};

// Update promo code
const updatePromoCode = async (promoCodeId, updates) => {
  try {
    if (!updates.promoCodeId) {
      throw new Error("Promo code ID is required for update");
    }

    // Validate the updates against the partial schema
    const validatedUpdates = updatePromoCodeSchema.parse(updates);

    const promoRef = db.collection("promocodes").doc(promoCodeId);
    const promoDoc = await promoRef.get();

    if (!promoDoc.exists) {
      throw new Error("Promo code not found for update");
    }

    // Add or update the updatedAt timestamp
    validatedUpdates.updatedAt = new Date().toISOString();

    await promoRef.update(validatedUpdates);

    return { success: true, promoCodeId: promoCodeId, ...validatedUpdates };
  } catch (err) {
    console.error("Error updating promo code:", err.message);
    throw err;
  }
};

// Delete promo code
const deletePromoCode = async (promoCodeId) => {
  try {
    if (!promoCodeId) {
      throw new Error("Promo code ID is required for deletion");
    }

    const promoRef = db.collection("promocodes").doc(promoCodeId);
    const promoDoc = await promoRef.get();

    if (!promoDoc.exists) {
      throw new Error("Promo code not found for deletion");
    }

    const batch = db.batch();

    // 1. Delete the promo code document
    batch.delete(promoRef);

    // 2. Find and update all products associated with this promo code
    // This ensures data consistency: if a promo code is deleted, products no longer reference it.
    const productsQuery = await db
      .collection("products")
      .where("promoCodeId", "==", promoCodeId)
      .get();

    productsQuery.docs.forEach((productDoc) => {
      const productRef = db.collection("products").doc(productDoc.id);
      batch.update(productRef, {
        promoCodeId: null, // Set the promoCodeId to null
        updatedAt: new Date().toISOString(),
      });
    });

    // Commit the batch operations
    await batch.commit();

    return {
      success: true,
      message: `Promo code ${promoCodeId} and associated product links deleted successfully.`,
    };
  } catch (err) {
    console.error("Error deleting promo code:", err.message);
    throw err;
  }
};

// Validate promo code
const validatePromoCode = async (data) => {
  try {
    // ✅ Zod parses or throws
    const validatedData = validatePromoCodeSchema.parse(data);

    const promoQuery = await db
      .collection("promocodes")
      .where("code", "==", validatedData.code)
      .where("warehouseId", "==", validatedData.warehouseId)
      .get();

    if (promoQuery.empty) {
      throw new Error(
        "Promo code not found or not applicable to this warehouse."
      );
    }

    const promoCodeData = promoQuery.docs[0].data();

    // If a productId is passed in the validation data, check if the promo code is applicable to it
    // This assumes `data` might optionally contain `productId` for specific product validation
    if (data.productId && !promoCodeData.productIds.includes(data.productId)) {
      throw new Error("Promo code is not applicable to the specified product.");
    }

    return promoCodeData;
  } catch (err) {
    console.error("Error validating promo code:", err.message);
    throw err;
  }
};

// Increment promo code usage
const incrementUsage = async (promoCodeId) => {
  try {
    if (!promoCodeId) throw new Error("Promo code ID is required");

    const promoRef = db.collection("promocodes").doc(promoCodeId);
    const promoDoc = await promoRef.get();

    if (!promoDoc.exists) {
      throw new Error("Promo code not found for usage increment.");
    }

    const currentUsage = promoDoc.data().currentUsage || 0;
    const usageLimit = promoDoc.data().usageLimit;

    if (
      usageLimit !== null &&
      usageLimit !== undefined &&
      currentUsage >= usageLimit
    ) {
      throw new Error("Promo code usage limit reached.");
    }

    await promoRef.update({
      currentUsage: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (err) {
    console.error("Error incrementing promo code usage:", err.message);
    throw err;
  }
};

const assignPromoCodeToProduct = async (promoCodeId, productId) => {
  try {
    // Validate inputs using the new assignPromoCodeSchema
    assignPromoCodeSchema.parse({ promoCodeId, productId });

    const promoCodeRef = db.collection("promocodes").doc(promoCodeId);
    const promoDoc = await promoCodeRef.get();
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!promoDoc.exists) throw new Error("Promo Code not Found");
    if (!productDoc.exists) throw new Error("Product Not Found");

    // Check if the product is already assigned to a different promo code
    const currentProductPromoCodeId = productDoc.data().promoCodeId;
    if (
      currentProductPromoCodeId &&
      currentProductPromoCodeId !== promoCodeId
    ) {
      throw new Error(
        `Product ${productId} is already assigned to promo code ${currentProductPromoCodeId}. Unassign it first.`
      );
    }

    const batch = db.batch();

    // 1. Update the product to link to the promo code
    batch.update(productRef, {
      promoCodeId: promoCodeId,
      updatedAt: new Date().toISOString(),
    });

    // 2. Update the promo code to include this product in its productIds array
    batch.update(promoCodeRef, {
      productIds: [productId],
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    return {
      success: true,
      message: `Promo code ${promoCodeId} assigned to product ${productId}.`,
    };
  } catch (err) {
    console.error("Error assigning promoCode to product:", err.message);
    throw new Error(err.message || "Failed to assign promoCode");
  }
};

// Function to unassign a promo code from a product
const unassignPromoCodeFromProduct = async (promoCodeId, productId) => {
  try {
    assignPromoCodeSchema.parse({ promoCodeId, productId }); // Reuse schema for input validation

    const promoCodeRef = db.collection("promocodes").doc(promoCodeId);
    const promoDoc = await promoCodeRef.get();
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!promoDoc.exists) throw new Error("Promo Code not Found");
    if (!productDoc.exists) throw new Error("Product Not Found");

    // Check if the product is actually assigned to this promo code
    if (productDoc.data().promoCodeId !== promoCodeId) {
      throw new Error(
        `Product ${productId} is not assigned to promo code ${promoCodeId}.`
      );
    }

    const batch = db.batch();

    // 1. Remove the promoCodeId from the product
    batch.update(productRef, {
      promoCodeId: null,
      updatedAt: new Date().toISOString(),
    });

    // 2. Remove the productId from the promo code's productIds array
    batch.update(promoCodeRef, {
      productIds: admin.firestore.FieldValue.arrayRemove(productId),
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    return {
      success: true,
      message: `Promo code ${promoCodeId} unassigned from product ${productId}.`,
    };
  } catch (err) {
    console.error("Error unassigning promoCode from product:", err.message);
    throw new Error(err.message || "Failed to unassign promoCode");
  }
};

module.exports = {
  createPromoCode,
  getAllPromoCodes,
  updatePromoCode, // Exported
  deletePromoCode, // Exported
  validatePromoCode,
  incrementUsage,
  assignPromoCodeToProduct,
  unassignPromoCodeFromProduct, // Exported
};
