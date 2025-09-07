const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const License = require('../models/License');
const Plugin = require('../models/Plugin');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { pluginId, licenseType, quantity = 1 } = req.body;
    const userId = req.user._id;

    // Get plugin details
    const plugin = await Plugin.findById(pluginId);
    if (!plugin) {
      return res.status(404).json({
        success: false,
        message: 'Plugin not found'
      });
    }

    // Calculate pricing based on license type
    const pricing = {
      '1-month': { price: plugin.price, duration: 30 },
      '3-months': { price: plugin.price * 2.5, duration: 90 },
      '6-months': { price: plugin.price * 4.5, duration: 180 },
      '1-year': { price: plugin.price * 8, duration: 365 },
      'lifetime': { price: plugin.price * 15, duration: 36500 }
    };

    const selectedPricing = pricing[licenseType];
    if (!selectedPricing) {
      return res.status(400).json({
        success: false,
        message: 'Invalid license type'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plugin.name} - ${licenseType} License`,
              description: plugin.description,
              images: [plugin.imageUrl || 'https://via.placeholder.com/300x200']
            },
            unit_amount: Math.round(selectedPricing.price * 100), // Convert to cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: userId.toString(),
        pluginId: pluginId,
        licenseType: licenseType,
        quantity: quantity.toString()
      },
      customer_email: req.user.email,
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session'
    });
  }
};

// @desc    Handle successful payment webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'payment_intent.succeeded':
      logger.info('Payment succeeded:', event.data.object.id);
      break;
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// @desc    Handle checkout session completed
const handleCheckoutCompleted = async (session) => {
  try {
    const { userId, pluginId, licenseType, quantity } = session.metadata;
    const plugin = await Plugin.findById(pluginId);
    const user = await User.findById(userId);

    if (!plugin || !user) {
      logger.error('Plugin or user not found for checkout session:', session.id);
      return;
    }

    // Calculate expiration date
    const pricing = {
      '1-month': 30,
      '3-months': 90,
      '6-months': 180,
      '1-year': 365,
      'lifetime': 36500
    };

    const durationDays = pricing[licenseType] || 365;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Create licenses
    const licenses = [];
    for (let i = 0; i < parseInt(quantity); i++) {
      const license = await License.create({
        key: require('uuid').v4().toUpperCase(),
        plugin: plugin.name,
        buyer: user.name,
        server: 'TBD', // Will be set when first validated
        expiresAt: expiresAt,
        createdBy: userId,
        notes: `Purchased via Stripe - ${licenseType} license`,
        paymentIntentId: session.payment_intent,
        purchaseDate: new Date()
      });
      licenses.push(license);
    }

    // Update user's license count
    const currentLicenseCount = await License.countDocuments({ createdBy: userId });
    if (currentLicenseCount > user.licenseLimit) {
      // Upgrade user tier if they exceed free limit
      if (user.tier === 'free') {
        user.tier = 'premium';
        user.licenseLimit = 500;
        await user.save();
      }
    }

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: `License Purchase Confirmation - ${plugin.name}`,
      template: 'license-purchase',
      data: {
        userName: user.name,
        pluginName: plugin.name,
        licenseType: licenseType,
        quantity: quantity,
        licenses: licenses,
        totalAmount: (session.amount_total / 100).toFixed(2)
      }
    });

    logger.info(`Successfully created ${quantity} licenses for user ${userId} and plugin ${pluginId}`);

  } catch (error) {
    logger.error('Error handling checkout completed:', error);
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Get licenses with payment info
    const licenses = await License.find({ 
      createdBy: req.user._id,
      paymentIntentId: { $exists: true }
    })
    .sort({ purchaseDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await License.countDocuments({ 
      createdBy: req.user._id,
      paymentIntentId: { $exists: true }
    });

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
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payment history'
    });
  }
};

// @desc    Create customer portal session
// @route   POST /api/payments/create-portal-session
// @access  Private
const createPortalSession = async (req, res) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create portal session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating portal session'
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentHistory,
  createPortalSession
};
