const { User } = require('../models');
const bcrypt = require('bcryptjs');

function renderLogin(req, res) {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
}

async function handleLogin(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.render('login', { error: 'Username atau password salah' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.render('login', { error: 'Username atau password salah' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    if (user.role === 'admin') {
      res.redirect('/admin/products');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Terjadi kesalahan sistem' });
  }
}

function handleLogout(req, res) {
  req.session.destroy((err) => {
    res.redirect('/');
  });
}

module.exports = { renderLogin, handleLogin, handleLogout };
