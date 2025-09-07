const mongoose = require('mongoose');

const pluginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plugin name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Plugin description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Plugin price is required'],
    min: [0, 'Price cannot be negative']
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  downloadUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['utility', 'economy', 'pvp', 'rpg', 'minigame', 'admin', 'other'],
    default: 'utility'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
pluginSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plugin', pluginSchema);
