function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect('/auth/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  return res.status(403).send('Akses Ditolak: Anda bukan admin.');
}

module.exports = { requireAuth, requireAdmin };
