const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  discordId: {
    type: String,
    default: null
  },
  tier: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  licenseLimit: {
    type: Number,
    default: 50 // Free tier limit
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  storeSubdomain: {
    type: String,
    unique: true,
    sparse: true, // allow null for users who don't have a store
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]{3,32}$/, 'Subdomain must be 3-32 characters, lowercase letters, numbers, or hyphens']
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    discordNotifications: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
