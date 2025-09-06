const Plugin = require('../models/Plugin');

// @desc    Create new plugin
// @route   POST /api/plugins
// @access  Private
const createPlugin = async (req, res) => {
  try {
    const { name, description, price, version, downloadUrl } = req.body;

    // Check if plugin name already exists for this user
    const existingPlugin = await Plugin.findOne({ 
      name: name.trim(),
      createdBy: req.user._id 
    });

    if (existingPlugin) {
      return res.status(400).json({
        success: false,
        message: 'Plugin with this name already exists'
      });
    }

    const plugin = await Plugin.create({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      version: version || '1.0.0',
      downloadUrl: downloadUrl || '',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: plugin,
      message: 'Plugin created successfully'
    });
  } catch (error) {
    console.error('Create plugin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating plugin'
    });
  }
};

// @desc    Get all plugins for user
// @route   GET /api/plugins
// @access  Private
const getPlugins = async (req, res) => {
  try {
    const plugins = await Plugin.find({ 
      createdBy: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plugins
    });
  } catch (error) {
    console.error('Get plugins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting plugins'
    });
  }
};

// @desc    Get single plugin
// @route   GET /api/plugins/:id
// @access  Private
const getPlugin = async (req, res) => {
  try {
    const plugin = await Plugin.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!plugin) {
      return res.status(404).json({
        success: false,
        message: 'Plugin not found'
      });
    }

    res.json({
      success: true,
      data: plugin
    });
  } catch (error) {
    console.error('Get plugin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting plugin'
    });
  }
};

// @desc    Update plugin
// @route   PUT /api/plugins/:id
// @access  Private
const updatePlugin = async (req, res) => {
  try {
    const { name, description, price, version, downloadUrl, isActive } = req.body;

    const plugin = await Plugin.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!plugin) {
      return res.status(404).json({
        success: false,
        message: 'Plugin not found'
      });
    }

    // Update fields
    if (name) plugin.name = name.trim();
    if (description) plugin.description = description.trim();
    if (price !== undefined) plugin.price = parseFloat(price);
    if (version) plugin.version = version;
    if (downloadUrl !== undefined) plugin.downloadUrl = downloadUrl;
    if (isActive !== undefined) plugin.isActive = isActive;

    await plugin.save();

    res.json({
      success: true,
      data: plugin,
      message: 'Plugin updated successfully'
    });
  } catch (error) {
    console.error('Update plugin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating plugin'
    });
  }
};

// @desc    Delete plugin
// @route   DELETE /api/plugins/:id
// @access  Private
const deletePlugin = async (req, res) => {
  try {
    const plugin = await Plugin.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!plugin) {
      return res.status(404).json({
        success: false,
        message: 'Plugin not found'
      });
    }

    // Soft delete by setting isActive to false
    plugin.isActive = false;
    await plugin.save();

    res.json({
      success: true,
      message: 'Plugin deleted successfully'
    });
  } catch (error) {
    console.error('Delete plugin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting plugin'
    });
  }
};

module.exports = {
  createPlugin,
  getPlugins,
  getPlugin,
  updatePlugin,
  deletePlugin
};
