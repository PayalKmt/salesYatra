const express = require('express');
const router = express.Router();
const productController = require('../../controllers/warehouseWeb/productController');
// const validate = require('../middleware/validate');
const { CreateProductSchema, UpdateProductSchema } = require('../../schemas/warehouseWeb/productsValidation');

// Create product
router.post('/create/product', productController.createProduct);

// Get products by warehouse
router.get('/warehouse/:warehouseId', productController.getProductsByWarehouse);

// Update product
router.put('update/product/:id', productController.updateProduct);

// Delete product
router.delete('delete/product/:id', productController.deleteProduct);

module.exports = router;