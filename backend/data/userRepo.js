
const fs = require('fs');
const path = require('path');
const { getIsMongo, storeFilePath } = require('../config/db');
const User = require('../models/User');

function getUserStorePath() {
  return path.join(path.dirname(storeFilePath), 'user_store.json');
}

function readJsonStore() {
  const filePath = getUserStorePath();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }

  // If the file is corrupt or unreadable, throw an error.
  // Do not silently treat the user database as empty.
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error('Invalid user store format');
  }

  return data;
}

function writeJsonStore(users) {
  const filePath = getUserStorePath();

  // Let write errors reach the calling function.
  fs.writeFileSync(
    filePath,
    JSON.stringify(users, null, 2),
    'utf8'
  );
}

class UserRepository {
  async findByEmail(email) {
    if (typeof email !== 'string' || !email.trim()) {
      return null;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (getIsMongo()) {
      return await User.findOne({ email: normalizedEmail });
    }

    const users = readJsonStore();

    return users.find(
      user => user.email === normalizedEmail
    ) || null;
  }

  async findById(id) {
    if (!id) return null;

    if (getIsMongo()) {
      if (!/^[a-f\d]{24}$/i.test(String(id))) {
        return null;
      }

      return await User.findById(id);
    }

    const users = readJsonStore();

    return users.find(
      user => user._id === id
    ) || null;
  }

  async create(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('User data is required');
    }

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const passwordHash = data.passwordHash;

    if (!name) {
      throw new Error('Name is required');
    }

    if (!email) {
      throw new Error('Email is required');
    }

    if (typeof passwordHash !== 'string' || !passwordHash) {
      throw new Error('Password hash is required');
    }

    const normalizedData = {
      ...data,
      name,
      email,
      passwordHash,
      role: data.role || 'EMPLOYEE',
      employeeId: data.employeeId || null,
      isActive: data.isActive !== false
    };

    if (getIsMongo()) {
      const user = new User(normalizedData);
      return await user.save();
    }

    const users = readJsonStore();

    const existingUser = users.find(
      user => user.email === email
    );

    if (existingUser) {
      const error = new Error(
        'A user with this email already exists'
      );
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    const newUser = {
      _id:
        'user_' +
        Date.now() +
        '_' +
        Math.random().toString(36).substring(2, 7),

      ...normalizedData,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save before returning success.
    writeJsonStore([...users, newUser]);

    return newUser;
  }

  async deleteById(id) {
    if (!id) return false;

    if (getIsMongo()) {
      if (!/^[a-f\d]{24}$/i.test(String(id))) {
        return false;
      }

      const result = await User.deleteOne({ _id: id });
      return result.deletedCount > 0;
    }

    const users = readJsonStore();
    const updatedUsers = users.filter(
      user => user._id !== id
    );

    if (updatedUsers.length === users.length) {
      return false;
    }

    writeJsonStore(updatedUsers);
    return true;
  }

  async getAll() {
    if (getIsMongo()) {
      return await User.find().sort({ createdAt: -1 });
    }

    return readJsonStore().sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

module.exports = new UserRepository();
