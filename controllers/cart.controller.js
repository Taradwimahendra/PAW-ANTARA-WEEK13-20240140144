const { Product, Order, OrderItem } = require('../models');
const bot = require('../config/telegram');
const { formatRupiah } = require('../utils/formatRupiah');

function getCart(req) {
  if (!req.session.cart) req.session.cart = {};
  return req.session.cart;
}

async function renderCart(req, res) {
  const cart = getCart(req);
  const productIds = Object.keys(cart);
  let cartItems = [];
  let total = 0;

  if (productIds.length > 0) {
    const products = await Product.findAll({ where: { id: productIds } });
    products.forEach(p => {
      const qty = cart[p.id];
      const subtotal = p.price * qty;
      total += subtotal;
      cartItems.push({
        product: p,
        quantity: qty,
        subtotal
      });
    });
  }

  res.render('cart', { cartItems, total, user: req.session });
}

async function addToCart(req, res) {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10);
  
  if (qty > 0) {
    const cart = getCart(req);
    if (cart[productId]) {
      cart[productId] += qty;
    } else {
      cart[productId] = qty;
    }
  }
  res.redirect('/');
}

async function updateCart(req, res) {
  const { productId, action } = req.body;
  const cart = getCart(req);
  if (cart[productId]) {
    if (action === 'increase') {
      cart[productId] += 1;
    } else if (action === 'decrease') {
      cart[productId] -= 1;
      if (cart[productId] <= 0) delete cart[productId];
    } else if (action === 'remove') {
      delete cart[productId];
    }
  }
  res.redirect('/cart');
}

async function checkout(req, res) {
  const cart = getCart(req);
  const productIds = Object.keys(cart);
  
  if (productIds.length === 0) {
    return res.redirect('/cart');
  }

  const { buyerName } = req.body;

  try {
    const products = await Product.findAll({ where: { id: productIds } });
    let totalAmount = 0;
    const items = [];

    // Validasi stok
    for (let p of products) {
      const qty = cart[p.id];
      if (p.stock < qty) {
        return res.send(`Stok ${p.name} tidak cukup. Sisa: ${p.stock}, Diminta: ${qty}. <a href="/cart">Kembali</a>`);
      }
      totalAmount += p.price * qty;
      items.push({
        product: p,
        quantity: qty,
        price: p.price
      });
    }

    // Buat Order
    const order = await Order.create({
      userId: req.session.userId || null,
      buyerName: buyerName || (req.session.username ? req.session.username : 'Guest'),
      status: 'pending',
      totalAmount
    });

    // Buat OrderItems dan kurangi stok
    for (let item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price
      });
      
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    // Bersihkan cart
    req.session.cart = {};

    // Notifikasi Admin
    notifyAdminNewOrder(order, items);

    res.render('success', { 
      storeName: process.env.STORE_NAME || 'Toko Kita',
      order: order,
      items: items,
      user: req.session
    });
  } catch (err) {
    res.status(500).send('Gagal checkout: ' + err.message);
  }
}

async function notifyAdminNewOrder(order, items) {
  const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (!bot || !adminChatId || adminChatId === 'isi-chat-id-admin') return;

  let text = `🔔 Order baru masuk!\n\nOrder ID: #${order.id}\nPembeli: ${order.buyerName}\nTotal: ${formatRupiah(order.totalAmount)}\n\nDetail:\n`;
  
  items.forEach(item => {
    text += `- ${item.product.name} (x${item.quantity}) = ${formatRupiah(item.price * item.quantity)}\n`;
  });

  try {
    await bot.sendMessage(adminChatId, text);
  } catch (err) {
    console.error('Gagal kirim notifikasi ke admin:', err.message);
  }
}

module.exports = { renderCart, addToCart, updateCart, checkout };
