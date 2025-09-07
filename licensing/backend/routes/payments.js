const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  createPortalSession
} = require('../controllers/paymentController');

const router = express.Router();

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout-session', protect, createCheckoutSession);

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history', protect, getPaymentHistory);

// @route   POST /api/payments/create-portal-session
// @desc    Create customer portal session
// @access  Private
router.post('/create-portal-session', protect, createPortalSession);

module.exports = router;
