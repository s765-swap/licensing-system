const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Import simple database
const db = require('./config/database-simple');

// Create default admin account on startup
const createDefaultAdmin = async () => {
  try {
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

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Auth middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await db.findUserById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

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

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, discordId } = req.body;

    // Check if user exists
    const userExists = await db.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.createUser({
      name,
      email,
      password: hashedPassword,
      discordId: discordId || null,
      tier: 'free',
      licenseLimit: 50
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        discordId: user.discordId,
        tier: user.tier,
        licenseLimit: user.licenseLimit,
        token: generateToken(user._id)
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.findUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          discordId: user.discordId,
          tier: user.tier,
          licenseLimit: user.licenseLimit,
          token: generateToken(user._id)
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        discordId: req.user.discordId,
        tier: req.user.tier,
        licenseLimit: req.user.licenseLimit,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Purchase routes
app.post('/api/purchase/license', async (req, res) => {
  try {
    const { pluginId, buyerName, maxServers, paymentMethod } = req.body;

    // Find the plugin
    const plugin = await db.findPluginById(pluginId);
    if (!plugin) {
      return res.status(404).json({
        success: false,
        message: 'Plugin not found'
      });
    }

    // Check if user is admin (free license)
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('admin');
    
    if (!isAdmin && (!paymentMethod || paymentMethod === 'none')) {
      return res.status(400).json({
        success: false,
        message: 'Payment required for license purchase'
      });
    }

    // Generate license key
    const licenseKey = uuidv4().toUpperCase();
    const expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Create license with server management
    const license = await db.createLicense({
      key: licenseKey,
      plugin: plugin.name,
      buyer: buyerName,
      server: 'Not configured yet', // Will be set when servers are added
      expiresAt: expirationDate,
      createdBy: plugin.createdBy,
      status: 'active',
      purchaseDate: new Date(),
      paymentMethod: isAdmin ? 'admin_free' : paymentMethod,
      price: isAdmin ? 0 : plugin.price,
      allowedServers: [],
      maxServers: parseInt(maxServers) || 1
    });

    res.status(201).json({
      success: true,
      data: {
        license: license,
        plugin: plugin,
        downloadUrl: plugin.downloadUrl,
        embeddedCode: generateEmbeddedCode(licenseKey, plugin.name)
      },
      message: isAdmin ? 'Free license created for admin testing' : 'License purchased successfully'
    });
  } catch (error) {
    console.error('Purchase license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing purchase'
    });
  }
});

// Generate embedded license code for plugins
const generateEmbeddedCode = (licenseKey, pluginName) => {
  return `
// Auto-generated license validation code
// DO NOT MODIFY - This code validates your license
const LICENSE_KEY = "${licenseKey}";
const PLUGIN_NAME = "${pluginName}";
const API_URL = "http://localhost:4000/api";

// IMPORTANT: Replace these with your actual server details
const SERVER_IP = "YOUR_SERVER_IP"; // e.g., "192.168.1.100"
const SERVER_PORT = "YOUR_SERVER_PORT"; // e.g., "25565"
const SERVER_IDENTIFIER = SERVER_IP + ":" + SERVER_PORT;

async function validateLicense() {
  try {
    const response = await fetch(API_URL + "/licenses/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: LICENSE_KEY,
        plugin: PLUGIN_NAME,
        server: SERVER_IDENTIFIER
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ License valid for " + result.data.buyer);
      console.log("📅 Expires: " + new Date(result.data.expiresAt).toLocaleDateString());
      console.log("🖥️ Allowed servers: " + result.data.allowedServers.map(s => s.ip + ":" + s.port).join(", "));
      return true;
    } else {
      console.error("❌ License invalid: " + result.message);
      if (result.data && result.data.allowedServers) {
        console.log("🖥️ Allowed servers: " + result.data.allowedServers.map(s => s.ip + ":" + s.port).join(", "));
      }
      return false;
    }
  } catch (error) {
    console.error("❌ License validation failed:", error);
    return false;
  }
}

// Validate license on plugin load
validateLicense().then(valid => {
  if (!valid) {
    console.error("🚫 Plugin disabled - Invalid license or server not authorized");
    // Disable plugin functionality here
    return;
  }
  console.log("🎮 Plugin loaded successfully with valid license");
});
`;
};

// License routes
app.post('/api/licenses/validate', async (req, res) => {
  try {
    const { key, plugin, server } = req.body;

    if (!key || !plugin || !server) {
      return res.status(400).json({
        success: false,
        message: 'License key, plugin name, and server name are required'
      });
    }

    const license = await db.findLicenseByKey(key.toUpperCase());

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    // Check if license is valid
    const isExpired = new Date(license.expiresAt) < new Date();
    const isValid = license.status === 'active' && !isExpired;

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

    // Check if server is allowed (if server info provided)
    if (server) {
      const serverParts = server.split(':');
      if (serverParts.length === 2) {
        const [ip, port] = serverParts;
        const isServerAllowed = license.allowedServers && license.allowedServers.some(s => 
          s.ip === ip && s.port === parseInt(port)
        );
        
        if (!isServerAllowed) {
          return res.status(403).json({
            success: false,
            message: 'License is not valid for this server. Please add this server to your license.',
            data: {
              providedServer: server,
              allowedServers: license.allowedServers || []
            }
          });
        }
      }
    }

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
        allowedServers: license.allowedServers || []
      }
    });
  } catch (error) {
    console.error('Validate license error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error validating license'
    });
  }
});

app.post('/api/licenses/create', protect, async (req, res) => {
  try {
    const { plugin, buyer, server, expiresAt } = req.body;

    // Check user's license limit
    const userLicenseCount = await db.countLicensesByUser(req.user._id);
    
    if (userLicenseCount >= req.user.licenseLimit) {
      return res.status(400).json({
        success: false,
        message: `License limit reached. You can create up to ${req.user.licenseLimit} licenses.`
      });
    }

    // Generate unique license key
    const licenseKey = uuidv4().toUpperCase();

    // Set expiration date (default to 1 year if not provided)
    const expirationDate = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const license = await db.createLicense({
      key: licenseKey,
      plugin,
      buyer,
      server,
      expiresAt: expirationDate,
      createdBy: req.user._id,
      status: 'active'
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
});

app.get('/api/licenses', protect, async (req, res) => {
  try {
    const licenses = await db.findLicensesByUser(req.user._id);
    res.json({
      success: true,
      data: licenses
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting licenses'
    });
  }
});

app.post('/api/licenses/revoke', protect, async (req, res) => {
  try {
    const { key } = req.body;

    const license = await db.updateLicense(key.toUpperCase(), { status: 'revoked' });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

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
});

// Server management endpoints
app.post('/api/licenses/:key/servers', protect, async (req, res) => {
  try {
    const { key } = req.params;
    const { ip, port, name } = req.body;

    if (!ip || !port) {
      return res.status(400).json({
        success: false,
        message: 'IP and port are required'
      });
    }

    const license = await db.addServerToLicense(key.toUpperCase(), { ip, port, name });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    res.json({
      success: true,
      data: license,
      message: 'Server added successfully'
    });
  } catch (error) {
    console.error('Add server error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding server'
    });
  }
});

app.delete('/api/licenses/:key/servers', protect, async (req, res) => {
  try {
    const { key } = req.params;
    const { ip, port } = req.body;

    if (!ip || !port) {
      return res.status(400).json({
        success: false,
        message: 'IP and port are required'
      });
    }

    const license = await db.removeServerFromLicense(key.toUpperCase(), { ip, port });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'License not found'
      });
    }

    res.json({
      success: true,
      data: license,
      message: 'Server removed successfully'
    });
  } catch (error) {
    console.error('Remove server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing server'
    });
  }
});

// Plugin routes
app.post('/api/plugins', protect, async (req, res) => {
  try {
    const { name, description, price, version, downloadUrl } = req.body;

    const plugin = await db.createPlugin({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      version: version || '1.0.0',
      downloadUrl: downloadUrl || '',
      createdBy: req.user._id,
      isActive: true
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
});

app.get('/api/plugins', protect, async (req, res) => {
  try {
    const plugins = await db.findPluginsByUser(req.user._id);
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
});

// Get all plugins for store (public)
app.get('/api/store/plugins', async (req, res) => {
  try {
    const plugins = await db.findPluginsByUser('all'); // Get all plugins
    res.json({
      success: true,
      data: plugins
    });
  } catch (error) {
    console.error('Get store plugins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting store plugins'
    });
  }
});

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
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💾 Database: In-memory (for testing)`);
  
  // Create default admin account
  await createDefaultAdmin();
});
