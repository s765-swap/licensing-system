const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Use simple in-memory database for Pterodactyl hosting
const db = require('./config/database-simple');

// Import routes
const authRoutes = require('./routes/auth');
const licenseRoutes = require('./routes/licenses');
const pluginRoutes = require('./routes/plugins');
const paymentRoutes = require('./routes/payments');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

// Import Swagger
const { specs, swaggerUi } = require('./config/swagger');

// Create default admin account on startup
const createDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const adminExists = await db.findUserByEmail('admin@admin.com');
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      await db.createUser({
        name: 'Admin User',
        email: 'admin@admin.com',
        password: hashedPassword,
        discordId: null,
        tier: 'enterprise',
        licenseLimit: 1000
      });
      
      console.log('✅ Default admin account created:');
      console.log('   Email: admin@admin.com');
      console.log('   Password: admin');
    }
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
};

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS - Allow all origins for Pterodactyl hosting
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Licensing SaaS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'in-memory',
    stats: db.getStats()
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Licensing SaaS API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/plugins', pluginRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💾 Database: In-memory (for Pterodactyl hosting)`);
  
  // Create default admin account
  await createDefaultAdmin();
});
