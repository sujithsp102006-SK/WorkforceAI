const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'workforce_analytics_dev_secret_change_me';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error('[Auth Middleware]', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};