const crypto = require('crypto');

function safeCompare(first, second) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

function requireAdmin(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN;
  const suppliedToken = req.get('x-admin-token');

  if (
    !expectedToken ||
    !suppliedToken ||
    !safeCompare(suppliedToken, expectedToken)
  ) {
    return res.status(401).json({
      error: 'Staff authorization required.',
    });
  }

  next();
}

module.exports = { requireAdmin };