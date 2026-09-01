const { Product } = require('../models');

async function renderProducts(req, res) {
  try {
    const products = await Product.findAll();
    res.render('admin/products', { products, user: req.session });
  } catch (err) {
    res.status(500).send('Error loading products: ' + err.message);
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    await Product.create({ name, description, price, stock });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Error creating product: ' + err.message);
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    await Product.update({ name, description, price, stock }, { where: { id } });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Error updating product: ' + err.message);
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await Product.destroy({ where: { id } });
    res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send('Error deleting product: ' + err.message);
  }
}

module.exports = { renderProducts, createProduct, updateProduct, deleteProduct };
