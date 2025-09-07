const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboardAnalytics,
  getLicenseUsageAnalytics,
  getPluginPerformanceAnalytics,
  exportAnalyticsData
} = require('../controllers/analyticsController');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive analytics dashboard
// @access  Private
router.get('/dashboard', protect, getDashboardAnalytics);

// @route   GET /api/analytics/license-usage
// @desc    Get license usage analytics
// @access  Private
router.get('/license-usage', protect, getLicenseUsageAnalytics);

// @route   GET /api/analytics/plugin-performance
// @desc    Get plugin performance analytics
// @access  Private
router.get('/plugin-performance', protect, getPluginPerformanceAnalytics);

// @route   GET /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.get('/export', protect, exportAnalyticsData);

module.exports = router;
