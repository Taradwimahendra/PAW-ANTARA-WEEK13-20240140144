const { Order, OrderItem, Product } = require('../models');

async function renderInvoices(req, res) {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const storeName = process.env.STORE_NAME || 'Toko Kita';

    res.render('invoices', {
      orders: orders.map((o) => o.toJSON()),
      storeName,
      user: req.session
    });
  } catch (err) {
    res.status(500).send('Gagal memuat invoice: ' + err.message);
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Order.update({ status }, { where: { id } });
    res.redirect('/admin/invoices');
  } catch (err) {
    res.status(500).send('Gagal update status: ' + err.message);
  }
}

module.exports = { renderInvoices, updateOrderStatus };
