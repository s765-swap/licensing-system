const User = require('../models/User');
const License = require('../models/License');
const Plugin = require('../models/Plugin');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/emailService');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: last30Days } });
    
    // Get user tier distribution
    const userTiers = await User.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get license statistics
    const totalLicenses = await License.countDocuments();
    const activeLicenses = await License.countDocuments({ 
      status: 'active',
      expiresAt: { $gt: now }
    });
    const expiredLicenses = await License.countDocuments({ 
      expiresAt: { $lte: now }
    });
    const revokedLicenses = await License.countDocuments({ 
      status: 'revoked'
    });

    // Get plugin statistics
    const totalPlugins = await Plugin.countDocuments();
    const activePlugins = await Plugin.countDocuments({ isActive: true });

    // Get recent activity
    const recentLicenses = await License.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name email')
      .select('key plugin buyer server status createdAt createdBy');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email tier createdAt lastLogin');

    // Get license creation trend
    const licenseTrend = await License.aggregate([
      {
        $match: {
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get top plugins by license count
    const topPlugins = await License.aggregate([
      {
        $group: {
          _id: '$plugin',
          licenseCount: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'active'] }, { $gt: ['$expiresAt', now] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { licenseCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get revenue data (if payment integration is enabled)
    const revenueData = await License.aggregate([
      {
        $match: {
          paymentIntentId: { $exists: true },
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          activeUsers,
          totalLicenses,
          activeLicenses,
          expiredLicenses,
          revokedLicenses,
          totalPlugins,
          activePlugins
        },
        userTiers,
        recentLicenses,
        recentUsers,
        licenseTrend,
        topPlugins,
        revenueData
      }
    });
  } catch (error) {
    logger.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting admin dashboard data'
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 20, search, tier, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (tier) {
      filter.tier = tier;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    // Get license counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const licenseCount = await License.countDocuments({ createdBy: user._id });
        const activeLicenseCount = await License.countDocuments({ 
          createdBy: user._id, 
          status: 'active',
          expiresAt: { $gt: new Date() }
        });
        
        return {
          ...user.toObject(),
          licenseCount,
          activeLicenseCount
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting users'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const { name, email, tier, licenseLimit, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    if (name) user.name = name;
    if (email) user.email = email;
    if (tier) user.tier = tier;
    if (licenseLimit !== undefined) user.licenseLimit = licenseLimit;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    logger.logBusiness('user_updated', {
      adminId: req.user._id,
      userId: id,
      changes: { name, email, tier, licenseLimit, isActive }
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    // Don't allow deleting the main admin account
    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    // Optionally revoke all user's licenses
    await License.updateMany(
      { createdBy: id },
      { status: 'revoked' }
    );

    logger.logBusiness('user_deleted', {
      adminId: req.user._id,
      userId: id,
      userEmail: user.email
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get all licenses with admin view
// @route   GET /api/admin/licenses
// @access  Private (Admin only)
const getLicenses = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 20, search, status, plugin, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { key: { $regex: search, $options: 'i' } },
        { buyer: { $regex: search, $options: 'i' } },
        { server: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (plugin) filter.plugin = { $regex: plugin, $options: 'i' };

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const licenses = await License.find(filter)
      .populate('createdBy', 'name email tier')
      .sort(sort)
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
    logger.error('Get admin licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting licenses'
    });
  }
};

// @desc    Send announcement email to all users
// @route   POST /api/admin/announcement
// @access  Private (Admin only)
const sendAnnouncement = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.tier !== 'enterprise' && req.user.email !== 'admin@admin.com') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { subject, message, targetTier = 'all' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Get target users
    let filter = { isActive: { $ne: false } };
    if (targetTier !== 'all') {
      filter.tier = targetTier;
    }

    const users = await User.find(filter).select('name email');

    // Send emails
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          await sendEmail({
            to: user.email,
            subject: `[Licensing SaaS] ${subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${subject}</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #666; font-size: 12px;">
                  This is an announcement from the Licensing SaaS team.
                </p>
              </div>
            `
          });
          return { success: true, email: user.email };
        } catch (error) {
          return { success: false, email: user.email, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    logger.logBusiness('announcement_sent', {
      adminId: req.user._id,
      subject,
      targetTier,
      successCount,
      failureCount
    });

    res.json({
      success: true,
      data: {
        totalSent: users.length,
        successCount,
        failureCount,
        results
      },
      message: `Announcement sent to ${successCount} users`
    });
  } catch (error) {
    logger.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending announcement'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getLicenses,
  sendAnnouncement
};
