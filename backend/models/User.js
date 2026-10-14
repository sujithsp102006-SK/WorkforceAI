const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },

    role: {
      type: String,
      enum: ['HR', 'EMPLOYEE'],
      required: true,
      default: 'EMPLOYEE',
      index: true
    },

    employeeId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ role: 1, employeeId: 1 });

module.exports = mongoose.model('User', UserSchema);