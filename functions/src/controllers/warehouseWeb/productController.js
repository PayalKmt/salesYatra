const productService = require('../../services/warehouseWeb/productService');
const { CreateProductSchema, UpdateProductSchema } = require('../../schemas/warehouseWeb/productsValidation'); // Corrected import path for productSchema
const { z } = require('zod');

const createProduct = async (req, res) => {
  try {
    const validatedData = CreateProductSchema.parse(req.body);
    const product = await productService.createProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error in createProduct:', error.errors);
      res.status(400).json({ errors: error.errors });
    } else {
      console.error('Error in createProduct controller:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
};

const getProductsByWarehouse = async (req, res) => {
  try {
    const products = await productService.getProductsByWarehouse(req.params.warehouseId);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getProductsByWarehouse controller:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    // const validatedData = UpdateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.body);
    res.status(200).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error in updateProduct:', error.errors);
      res.status(400).json({ errors: error.errors });
    } else {
      console.error('Error in updateProduct controller:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.productId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteProduct controller:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProductsByWarehouse,
  updateProduct,
  deleteProduct
};
