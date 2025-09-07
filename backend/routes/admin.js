const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAdminDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getLicenses,
  sendAnnouncement
} = require('../controllers/adminController');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', protect, getAdminDashboard);

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', protect, getUsers);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/users/:id', protect, updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', protect, deleteUser);

// @route   GET /api/admin/licenses
// @desc    Get all licenses with admin view
// @access  Private (Admin only)
router.get('/licenses', protect, getLicenses);

// @route   POST /api/admin/announcement
// @desc    Send announcement email to all users
// @access  Private (Admin only)
router.post('/announcement', protect, sendAnnouncement);

module.exports = router;
