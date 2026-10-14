const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../data/userRepo');

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'workforce_analytics_dev_secret_change_me';

// =========================
// LOGIN
// =========================

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await userRepo.findByEmail(email);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        employeeId: user.employeeId || null
      },
      JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

// =========================
// CURRENT LOGGED-IN USER
// =========================

async function getMe(req, res) {
  try {
    const user = await userRepo.findById(req.user.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null
      }
    });
  } catch (error) {
    console.error('[Auth] Get current user error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch current user'
    });
  }
}

// =========================
// EXPORTS
// =========================

module.exports = {
  login,
  getMe
};