const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quorum Voting API',
      version: '1.0.0',
      description: 'API documentation for Quorum Voting Platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Server',
      },
    ],
      tags: [
      {
        name: 'Campaigns',
        description: 'Campaign management endpoints',
      },
    ],
  components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  schemas: {
    Campaign: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: '684f0e8e0f123456789abcd1',
        },
        title: {
          type: 'string',
          example: 'Best Artist Award 2026',
        },
        description: {
          type: 'string',
          example: 'Vote for your favorite artist',
        },
        status: {
          type: 'string',
          enum: ['DRAFT', 'ACTIVE', 'CLOSED'],
          example: 'ACTIVE',
        },
        coinPerVote: {
          type: 'integer',
          example: 1,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },

    CreateCampaignRequest: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          example: 'Best Artist Award 2026',
        },
        description: {
          type: 'string',
          example: 'Vote for your favorite artist',
        },
        coinPerVote: {
          type: 'integer',
          example: 1,
        },
      },
    },

    Category: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        campaignId: {
          type: 'string',
        },
        name: {
          type: 'string',
          example: 'Best Male Artist',
        },
      },
    },

    CreateCategoryRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          example: 'Best Female Artist',
        },
      },
    },

    Nominee: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        categoryId: {
          type: 'string',
        },
        name: {
          type: 'string',
          example: 'Burna Boy',
        },
        bio: {
          type: 'string',
          example: 'Award-winning Nigerian artist',
        },
      },
    },

    CreateNomineeRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          example: 'Burna Boy',
        },
        bio: {
          type: 'string',
          example: 'Award-winning Nigerian artist',
        },
      },
    },

    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: 'Validation failed',
        },
      },
    },
  },
},
  },

  //response
  CampaignResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true,
    },
    data: {
      $ref: '#/components/schemas/Campaign',
    },
  },
},

CampaignListResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true,
    },
    data: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Campaign',
      },
    },
  },
},

CategoryListResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true,
    },
    data: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Category',
      },
    },
  },
},

NomineeListResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true,
    },
    data: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/Nominee',
      },
    },
  },
},

UnauthorizedResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: false,
    },
    message: {
      type: 'string',
      example: 'Access denied. No token provided.',
    },
  },
},

ForbiddenResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: false,
    },
    message: {
      type: 'string',
      example: 'Forbidden: Insufficient permissions',
    },
  },
},

  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    'src/modules/campaigns/campaigns.routes.js'
  ],
}

module.exports = swaggerJsdoc(options)
