const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/', cartController.renderCart);
router.post('/add', cartController.addToCart);
router.post('/update', cartController.updateCart);
router.post('/checkout', cartController.checkout);

module.exports = router;
