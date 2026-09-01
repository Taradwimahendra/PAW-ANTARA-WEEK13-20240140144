const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const invoiceController = require('../controllers/invoice.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

// Products
router.get('/products', adminController.renderProducts);
router.post('/products', adminController.createProduct);
router.post('/products/:id/update', adminController.updateProduct);
router.post('/products/:id/delete', adminController.deleteProduct);

// Invoices
router.get('/invoices', invoiceController.renderInvoices);
router.post('/invoices/:id/status', invoiceController.updateOrderStatus);

module.exports = router;
