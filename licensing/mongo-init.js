// MongoDB initialization script
db = db.getSiblingDB('licensing_saas');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address and is required'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be a string with at least 6 characters and is required'
        },
        tier: {
          bsonType: 'string',
          enum: ['free', 'premium', 'enterprise'],
          description: 'Tier must be one of: free, premium, enterprise'
        }
      }
    }
  }
});

db.createCollection('licenses', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key', 'plugin', 'buyer', 'server', 'status', 'expiresAt', 'createdBy'],
      properties: {
        key: {
          bsonType: 'string',
          description: 'License key must be a string and is required'
        },
        plugin: {
          bsonType: 'string',
          description: 'Plugin name must be a string and is required'
        },
        buyer: {
          bsonType: 'string',
          description: 'Buyer name must be a string and is required'
        },
        server: {
          bsonType: 'string',
          description: 'Server name must be a string and is required'
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'expired', 'revoked'],
          description: 'Status must be one of: active, expired, revoked'
        },
        expiresAt: {
          bsonType: 'date',
          description: 'Expiration date must be a date and is required'
        }
      }
    }
  }
});

db.createCollection('plugins', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'description', 'price', 'createdBy'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Plugin name must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'Plugin description must be a string and is required'
        },
        price: {
          bsonType: 'number',
          minimum: 0,
          description: 'Price must be a number >= 0 and is required'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.licenses.createIndex({ key: 1 }, { unique: true });
db.licenses.createIndex({ createdBy: 1 });
db.licenses.createIndex({ status: 1 });
db.licenses.createIndex({ expiresAt: 1 });
db.plugins.createIndex({ createdBy: 1 });
db.plugins.createIndex({ name: 1, createdBy: 1 }, { unique: true });

print('Database initialized successfully!');
