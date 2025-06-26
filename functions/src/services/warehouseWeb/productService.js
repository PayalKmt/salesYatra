const admin = require('firebase-admin');
const db = admin.firestore();
const { v4: uuidv4 } = require('uuid');

// Helper to extract document ID from full path like "warehouses/warehouse123"
const getIdFromPath = (path) => {
  return path.includes('/') ? path.split('/').pop() : path;
};

const createProduct = async (productData) => {
  try {
    const productId = uuidv4();
    console.log(productId);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const product = {
      productId,
      ...productData,
      createdAt,
      updatedAt
    };

    const productRef = db.collection('products').doc(productId);
    await productRef.set(product);

    // // Initialize warehouse inventory
    // const warehouseId = getIdFromPath(productData.warehouseId);
    // const inventoryRef = db.collection('warehouse_inventory').doc(`${warehouseId}_${productId}`);
    // await inventoryRef.set({
    //   warehouseId: productData.warehouseId, // keep full path for consistency
    //   productId,
    //   stock: productData.stock,
    //   updatedAt: new Date().toISOString(),
    // });

    return {
      productId,
      ...product
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error(error.message || 'Failed to create product');
  }
};

// const getProductsByWarehouse = async (warehouseId) => {
//   try {
//     const snapshot = await db.collection('products')
//       .where('warehouseId', '==', warehouseId)
//       .get();

//     return snapshot.docs.map(doc => doc.data());
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw new Error(error.message || 'Failed to fetch products');
//   }
// };

const updateProduct = async (productId, updateData) => {
  try {
    const productRef = db.collection('products').doc(productId);
    await productRef.update(updateData);

    // Update inventory if stock changed
    if (updateData.stock !== undefined) {
      const product = await productRef.get();
      const productData = product.data();

      const warehouseId = getIdFromPath(productData.warehouseId);
      const inventoryRef = db.collection('warehouse_inventory')
        .doc(`${warehouseId}_${productId}`);

      await inventoryRef.update({
        stock: updateData.stock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    const updatedProduct = await productRef.get();
    return updatedProduct.data();
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(error.message || 'Failed to update product');
  }
};

const deleteProduct = async (productId) => {
  try {
    const productRef = db.collection('products').doc(productId);
    const product = await productRef.get();
    const productData = product.data();

    const warehouseId = getIdFromPath(productData.warehouseId);
    const inventoryRef = db.collection('warehouse_inventory')
      .doc(`${warehouseId}_${productId}`);
    await inventoryRef.delete();

    await productRef.delete();

    return { id: productId, deleted: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.message || 'Failed to delete product');
  }
};

module.exports = {
  createProduct,
//   getProductsByWarehouse,
  updateProduct,
  deleteProduct
};
