const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Licensing SaaS API',
      version: '1.0.0',
      description: 'A comprehensive SaaS platform for Minecraft plugin developers to manage licenses, subscriptions, and Discord bot integration.',
      contact: {
        name: 'API Support',
        email: 'support@licensingsaas.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.licensingsaas.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            tier: {
              type: 'string',
              enum: ['free', 'premium', 'enterprise'],
              description: 'User subscription tier'
            },
            licenseLimit: {
              type: 'number',
              description: 'Maximum number of licenses user can create'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login date'
            }
          }
        },
        License: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'License ID'
            },
            key: {
              type: 'string',
              description: 'Unique license key'
            },
            plugin: {
              type: 'string',
              description: 'Plugin name'
            },
            buyer: {
              type: 'string',
              description: 'Buyer name'
            },
            server: {
              type: 'string',
              description: 'Server name/IP'
            },
            status: {
              type: 'string',
              enum: ['active', 'expired', 'revoked'],
              description: 'License status'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'License expiration date'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'License creation date'
            },
            lastValidated: {
              type: 'string',
              format: 'date-time',
              description: 'Last validation date'
            },
            validationCount: {
              type: 'number',
              description: 'Number of times license was validated'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            }
          }
        },
        Plugin: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Plugin ID'
            },
            name: {
              type: 'string',
              description: 'Plugin name'
            },
            description: {
              type: 'string',
              description: 'Plugin description'
            },
            price: {
              type: 'number',
              description: 'Plugin price in USD'
            },
            version: {
              type: 'string',
              description: 'Plugin version'
            },
            downloadUrl: {
              type: 'string',
              description: 'Plugin download URL'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether plugin is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Plugin creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
