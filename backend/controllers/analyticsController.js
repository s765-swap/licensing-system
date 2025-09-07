const License = require('../models/License');
const Plugin = require('../models/Plugin');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get comprehensive analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get license statistics
    const totalLicenses = await License.countDocuments({ createdBy: userId });
    const activeLicenses = await License.countDocuments({ 
      createdBy: userId, 
      status: 'active',
      expiresAt: { $gt: now }
    });
    const expiredLicenses = await License.countDocuments({ 
      createdBy: userId, 
      expiresAt: { $lte: now }
    });
    const revokedLicenses = await License.countDocuments({ 
      createdBy: userId, 
      status: 'revoked'
    });

    // Get recent licenses
    const recentLicenses = await License.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('key plugin buyer server status expiresAt createdAt');

    // Get license creation trend
    const licenseTrend = await License.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate }
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

    // Get plugin performance
    const pluginStats = await License.aggregate([
      {
        $match: { createdBy: userId }
      },
      {
        $group: {
          _id: '$plugin',
          totalLicenses: { $sum: 1 },
          activeLicenses: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'active'] }, { $gt: ['$expiresAt', now] }] },
                1,
                0
              ]
            }
          },
          expiredLicenses: {
            $sum: {
              $cond: [{ $lte: ['$expiresAt', now] }, 1, 0]
            }
          },
          revokedLicenses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { totalLicenses: -1 }
      }
    ]);

    // Get validation statistics
    const validationStats = await License.aggregate([
      {
        $match: { createdBy: userId }
      },
      {
        $group: {
          _id: null,
          totalValidations: { $sum: '$validationCount' },
          avgValidationsPerLicense: { $avg: '$validationCount' },
          licensesWithValidations: {
            $sum: {
              $cond: [{ $gt: ['$validationCount', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get revenue data (if payment integration is enabled)
    const revenueData = await License.aggregate([
      {
        $match: {
          createdBy: userId,
          paymentIntentId: { $exists: true },
          createdAt: { $gte: startDate }
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

    // Get top buyers
    const topBuyers = await License.aggregate([
      {
        $match: { createdBy: userId }
      },
      {
        $group: {
          _id: '$buyer',
          licenseCount: { $sum: 1 },
          lastPurchase: { $max: '$createdAt' }
        }
      },
      {
        $sort: { licenseCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get server distribution
    const serverStats = await License.aggregate([
      {
        $match: { 
          createdBy: userId,
          server: { $ne: 'TBD' }
        }
      },
      {
        $group: {
          _id: '$server',
          licenseCount: { $sum: 1 }
        }
      },
      {
        $sort: { licenseCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalLicenses,
          activeLicenses,
          expiredLicenses,
          revokedLicenses,
          period
        },
        recentLicenses,
        licenseTrend,
        pluginStats,
        validationStats: validationStats[0] || {
          totalValidations: 0,
          avgValidationsPerLicense: 0,
          licensesWithValidations: 0
        },
        revenueData,
        topBuyers,
        serverStats
      }
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting analytics data'
    });
  }
};

// @desc    Get license usage analytics
// @route   GET /api/analytics/license-usage
// @access  Private
const getLicenseUsageAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { licenseKey } = req.query;

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        message: 'License key is required'
      });
    }

    const license = await License.findOne({
      key: licenseKey.toUpperCase(),
      createdBy: userId
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Get validation history (if you have a separate validation log)
    const validationHistory = await License.aggregate([
      {
        $match: { key: licenseKey.toUpperCase() }
      },
      {
        $project: {
          validations: {
            $map: {
              input: { $range: [0, '$validationCount'] },
              as: 'index',
              in: {
                timestamp: '$lastValidated',
                server: '$server'
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        license: {
          key: license.key,
          plugin: license.plugin,
          buyer: license.buyer,
          server: license.server,
          status: license.status,
          createdAt: license.createdAt,
          expiresAt: license.expiresAt,
          lastValidated: license.lastValidated,
          validationCount: license.validationCount
        },
        usage: {
          totalValidations: license.validationCount,
          lastValidation: license.lastValidated,
          isActive: license.status === 'active' && license.expiresAt > new Date(),
          daysSinceLastValidation: license.lastValidated 
            ? Math.floor((new Date() - license.lastValidated) / (1000 * 60 * 60 * 24))
            : null
        },
        validationHistory: validationHistory[0]?.validations || []
      }
    });
  } catch (error) {
    logger.error('Get license usage analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting license usage data'
    });
  }
};

// @desc    Get plugin performance analytics
// @route   GET /api/analytics/plugin-performance
// @access  Private
const getPluginPerformanceAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { pluginId } = req.query;

    let matchQuery = { createdBy: userId };
    if (pluginId) {
      const plugin = await Plugin.findById(pluginId);
      if (!plugin) {
        return res.status(404).json({
          success: false,
          message: 'Plugin not found'
        });
      }
      matchQuery.plugin = plugin.name;
    }

    const performance = await License.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$plugin',
          totalLicenses: { $sum: 1 },
          activeLicenses: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'active'] }, { $gt: ['$expiresAt', new Date()] }] },
                1,
                0
              ]
            }
          },
          totalValidations: { $sum: '$validationCount' },
          avgValidationsPerLicense: { $avg: '$validationCount' },
          uniqueBuyers: { $addToSet: '$buyer' },
          uniqueServers: { $addToSet: '$server' },
          lastActivity: { $max: '$lastValidated' },
          createdAt: { $min: '$createdAt' }
        }
      },
      {
        $project: {
          plugin: '$_id',
          totalLicenses: 1,
          activeLicenses: 1,
          expiredLicenses: { $subtract: ['$totalLicenses', '$activeLicenses'] },
          totalValidations: 1,
          avgValidationsPerLicense: { $round: ['$avgValidationsPerLicense', 2] },
          uniqueBuyerCount: { $size: '$uniqueBuyers' },
          uniqueServerCount: { $size: '$uniqueServers' },
          lastActivity: 1,
          createdAt: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$activeLicenses', '$totalLicenses'] },
              100
            ]
          }
        }
      },
      {
        $sort: { totalLicenses: -1 }
      }
    ]);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Get plugin performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting plugin performance data'
    });
  }
};

// @desc    Export analytics data
// @route   GET /api/analytics/export
// @access  Private
const exportAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'json', period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const licenses = await License.find({
      createdBy: userId,
      createdAt: { $gte: startDate }
    }).select('-__v');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(licenses);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}.csv`);
      res.send(csvData);
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate: now,
          totalRecords: licenses.length,
          licenses
        }
      });
    }
  } catch (error) {
    logger.error('Export analytics data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics data'
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0].toObject());
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

module.exports = {
  getDashboardAnalytics,
  getLicenseUsageAnalytics,
  getPluginPerformanceAnalytics,
  exportAnalyticsData
};
