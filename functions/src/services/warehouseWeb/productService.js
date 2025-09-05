const admin = require("firebase-admin");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

// Import the product schemas
const {
  CreateProductSchema,
  UpdateProductSchema,
} = require("../../schemas/warehouseWeb/productsValidation"); // Assuming this path is correct

// Helper to extract document ID from full path like "warehouses/warehouse123"
const getIdFromPath = (path) => {
  return path.includes("/") ? path.split("/").pop() : path;
};

const createProduct = async (productData) => {
  try {
    // Validate incoming product data using Zod schema
    const validatedData = CreateProductSchema.parse(productData);

    const productId = uuidv4();
    console.log(productId);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const product = {
      productId,
      ...validatedData, // Use validated data
      createdAt,
      updatedAt,
    };

    const productRef = db.collection("products").doc(productId);
    await productRef.set(product);

    // Initialize warehouse inventory
    // Assuming warehouseId in productData is already a simple ID, not a full path.
    // If it's a full path, uncomment and use getIdFromPath.
    const warehouseId = validatedData.warehouseId; // Use validatedData.warehouseId
    const inventoryRef = db
      .collection("warehouse_inventory")
      .doc(`${warehouseId}_${productId}`);

    await inventoryRef.set({
      warehouseId: warehouseId,
      productId: productId,
      stock: validatedData.stock,
      reserved: 0, // ✅ Add default reserved
      minimumStockLevel: validatedData.minimumOrderQuantity || 0, // optional if you want to include
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      productId,
      ...product,
    };
  } catch (error) {
    console.error("Error creating product:", error.message); // Log error message
    throw new Error(error.message || "Failed to create product");
  }
};

const getProductsByWarehouse = async (warehouseId) => {
  try {
    const snapshot = await db
      .collection("products")
      .where("warehouseId", "==", warehouseId)
      .get();

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching products:", error.message); // Log error message
    throw new Error(error.message || "Failed to fetch products");
  }
};

const updateProduct = async (updateData) => {
  try {
    // Validate incoming update data using Zod partial schema
    const validatedUpdates = UpdateProductSchema.parse(updateData);

    const productRef = db.collection("products").doc(updateData.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new Error("Product not found for update.");
    }

    // Add or update the updatedAt timestamp
    validatedUpdates.updatedAt = new Date().toISOString();

    await productRef.update(validatedUpdates);

    // Update inventory if stock changed
    if (validatedUpdates.stock !== undefined) {
      const inventoryRef = db
        .collection("warehouse_inventory")
        .doc(`${warehouseId}_${updateData.productId}`);

      const inventoryDoc = await inventoryRef.get();

      if (!inventoryDoc.exists) {
        throw new Error("Inventory document not found.");
      }

      const inventoryData = inventoryDoc.data();
      const inventoryUpdates = {
        stock: validatedUpdates.stock,
        updatedAt: new Date().toDateString(),
      };

      // Check if stock increased → update lastRestocked
      if (validatedUpdates.stock > inventoryData.stock) {
        inventoryUpdates.lastRestocked = new Date().toDateString();
      }

      await inventoryRef.update(inventoryUpdates);
    }

    const updatedProduct = await productRef.get();
    return updatedProduct.data();
  } catch (error) {
    console.error("Error updating product:", error.message); // Log error message
    throw new Error(error.message || "Failed to update product");
  }
};

const deleteProduct = async (productId) => {
  try {
    const productRef = db.collection("products").doc(productId);
    const product = await productRef.get();

    if (!product.exists) {
      throw new Error("Product not found for deletion.");
    }

    const productData = product.data();

    const batch = db.batch();

    // Delete from warehouse_inventory
    const warehouseId = getIdFromPath(productData.warehouseId);
    const inventoryRef = db
      .collection("warehouse_inventory")
      .doc(`${warehouseId}_${productId}`);
    batch.delete(inventoryRef);

    // Delete the product document itself
    batch.delete(productRef);

    // No need to explicitly remove from promoCode's productIds array here,
    // as the product itself is being deleted. If a promoCode is later
    // queried, its productIds array might contain a stale ID, but
    // that's usually handled by checking if the product actually exists.
    // The `deletePromoCode` function handles unlinking products when a promo code is deleted.

    await batch.commit();

    return { id: productId, deleted: true };
  } catch (error) {
    console.error("Error deleting product:", error.message); // Log error message
    throw new Error(error.message || "Failed to delete product");
  }
};

module.exports = {
  createProduct,
  getProductsByWarehouse,
  updateProduct,
  deleteProduct,
};
