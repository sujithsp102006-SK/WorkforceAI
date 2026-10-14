const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 18,
      max: 75
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other'],
      default: 'Other'
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      index: true
    },
    yearsAtCompany: {
      type: Number,
      required: [true, 'Years at company is required'],
      min: 0,
      default: 0
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: 0
    },
    jobSatisfaction: {
      type: Number,
      min: 1,
      max: 4,
      default: 3
    },
    workLifeBalance: {
      type: Number,
      min: 1,
      max: 4,
      default: 3
    },
    overtime: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    skills: {
      type: [String],
      default: []
    },
    trainingHours: {
      type: Number,
      default: 20,
      min: 0
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0,
      default: 1
    },
    targetRole: {
      type: String,
      trim: true,
      default: ''
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'UNASSESSED'],
      default: 'UNASSESSED',
      index: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    riskFactors: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Helpful index combinations for queries
EmployeeSchema.index({ department: 1, riskLevel: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);
