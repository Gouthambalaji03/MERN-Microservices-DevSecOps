const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeatured);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/inventory', productController.updateInventory);
router.put('/:id/rating', productController.updateRating);

module.exports = router;

