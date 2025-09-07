const { v4: uuidv4 } = require('uuid');
const License = require('../models/License');
const User = require('../models/User');

// @desc    Create new license
// @route   POST /api/licenses/create
// @access  Private
const createLicense = async (req, res) => {
  try {
    const { plugin, buyer, server, expiresAt, notes } = req.body;

    // Check user's license limit
    const user = await User.findById(req.user._id);
    const userLicenseCount = await License.countDocuments({ createdBy: req.user._id });
    
    if (userLicenseCount >= user.licenseLimit) {
      return res.status(400).json({
        success: false,
        message: `License limit reached. You can create up to ${user.licenseLimit} licenses.`
      });
    }

    // Generate unique license key
    const licenseKey = uuidv4().toUpperCase();

    // Set expiration date (default to 1 year if not provided)
    const expirationDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const license = await License.create({
      key: licenseKey,
      plugin,
      buyer,
      server,
      expiresAt: expirationDate,
      createdBy: req.user._id,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      data: license,
      message: 'License created successfully'
    });
  } catch (error) {
    console.error('Create license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating license'
    });
  }
};

// @desc    Validate license
// @route   POST /api/licenses/validate
// @access  Public
const validateLicense = async (req, res) => {
  try {
    const { key, plugin, server } = req.body;

    if (!key || !plugin || !server) {
      return res.status(400).json({
        success: false,
        message: 'License key, plugin name, and server name are required'
      });
    }

    const license = await License.findOne({ 
      key: key.toUpperCase(),
      plugin: plugin.trim()
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Check if license is valid
    const isValid = license.isValid();
    const isExpired = license.isExpired;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: isExpired ? 'License has expired' : 'License is not active',
        data: {
          status: license.status,
          expiresAt: license.expiresAt,
          isExpired
        }
      });
    }

    // Update validation info
    license.lastValidated = new Date();
    license.validationCount += 1;
    await license.save();

    res.json({
      success: true,
      message: 'License is valid',
      data: {
        key: license.key,
        plugin: license.plugin,
        buyer: license.buyer,
        server: license.server,
        status: license.status,
        expiresAt: license.expiresAt,
        lastValidated: license.lastValidated
      }
    });
  } catch (error) {
    console.error('Validate license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating license'
    });
  }
};

// @desc    Get license by key
// @route   GET /api/licenses/:key
// @access  Private
const getLicense = async (req, res) => {
  try {
    const license = await License.findOne({ 
      key: req.params.key.toUpperCase(),
      createdBy: req.user._id 
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    res.json({
      success: true,
      data: license
    });
  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting license'
    });
  }
};

// @desc    Get all licenses for user
// @route   GET /api/licenses
// @access  Private
const getLicenses = async (req, res) => {
  try {
    const { status, plugin, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;
    if (plugin) filter.plugin = new RegExp(plugin, 'i');

    const licenses = await License.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await License.countDocuments(filter);

    res.json({
      success: true,
      data: licenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting licenses'
    });
  }
};

// @desc    Revoke license
// @route   POST /api/licenses/revoke
// @access  Private
const revokeLicense = async (req, res) => {
  try {
    const { key } = req.body;

    const license = await License.findOne({ 
      key: key.toUpperCase(),
      createdBy: req.user._id 
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    license.status = 'revoked';
    await license.save();

    res.json({
      success: true,
      data: license,
      message: 'License revoked successfully'
    });
  } catch (error) {
    console.error('Revoke license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error revoking license'
    });
  }
};

// @desc    Update license
// @route   PUT /api/licenses/:key
// @access  Private
const updateLicense = async (req, res) => {
  try {
    const { buyer, server, expiresAt, notes } = req.body;

    const license = await License.findOne({ 
      key: req.params.key.toUpperCase(),
      createdBy: req.user._id 
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Update fields
    if (buyer) license.buyer = buyer;
    if (server) license.server = server;
    if (expiresAt) license.expiresAt = new Date(expiresAt);
    if (notes !== undefined) license.notes = notes;

    await license.save();

    res.json({
      success: true,
      data: license,
      message: 'License updated successfully'
    });
  } catch (error) {
    console.error('Update license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating license'
    });
  }
};

// @desc    Get license statistics
// @route   GET /api/licenses/stats
// @access  Private
const getLicenseStats = async (req, res) => {
  try {
    const total = await License.countDocuments({ createdBy: req.user._id });
    const active = await License.countDocuments({ 
      createdBy: req.user._id, 
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    const expired = await License.countDocuments({ 
      createdBy: req.user._id, 
      expiresAt: { $lte: new Date() }
    });
    const revoked = await License.countDocuments({ 
      createdBy: req.user._id, 
      status: 'revoked'
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        expired,
        revoked
      }
    });
  } catch (error) {
    console.error('Get license stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting license statistics'
    });
  }
};

module.exports = {
  createLicense,
  validateLicense,
  getLicense,
  getLicenses,
  revokeLicense,
  updateLicense,
  getLicenseStats
};
