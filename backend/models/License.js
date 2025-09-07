const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'License key is required'],
    unique: true,
    uppercase: true
  },
  plugin: {
    type: String,
    required: [true, 'Plugin name is required'],
    trim: true
  },
  buyer: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true
  },
  server: {
    type: String,
    required: [true, 'Server name is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastValidated: {
    type: Date,
    default: null
  },
  validationCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  hardwareFingerprint: {
    type: String,
    default: null
  },
  allowedServers: [{
    ip: String,
    port: String,
    name: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxServers: {
    type: Number,
    default: 1
  }
});

// Index for faster queries
licenseSchema.index({ key: 1 });
licenseSchema.index({ createdBy: 1 });
licenseSchema.index({ status: 1 });
licenseSchema.index({ expiresAt: 1 });

// Virtual for checking if license is expired
licenseSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to check if license is valid
licenseSchema.methods.isValid = function() {
  return this.status === 'active' && !this.isExpired;
};

module.exports = mongoose.model('License', licenseSchema);
