import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QUORUM - Event Award Nominee Voting System',
      version: '1.0.0',
      description: 'Fully self-contained API documentation for the Quorum coin-based secure voting platform.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User registration, login contexts, and account metadata' },
      { name: 'Campaigns', description: 'Public or protected event award configuration, categories, and nominees' },
      { name: 'Votes', description: 'Platform coin wallet queries and atomic ballot entry deductions' },
      { name: 'Payments', description: 'Third-party gateway transaction initialization and webhooks' },
      { name: 'Admin Management', description: 'High-privilege platform state controllers, global overrides, and audit exports' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide your 15-minute JWT authorization token context to test locked routes.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr_cl987654321' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'voter@example.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'ORGANIZER'], example: 'ADMIN' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'wlt_abc123' },
            userId: { type: 'string', example: 'usr_cl987654321' },
            balance: { type: 'integer', description: 'Current balance in platform coins', example: 200 },
          },
        },
      },
    },

    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new voter account',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'voter@example.com' },
                    password: { type: 'string', format: 'password', example: 'SecurePass123!' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered successfully and automatic digital wallet provisioned.' },
            400: { description: 'Email already exists or invalid data configuration structure.' },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Authenticate account identity',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'voter@example.com' },
                    password: { type: 'string', format: 'password', example: 'SecurePass123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Cryptographic credentials verified. Emits JWT and identification structures.' },
            401: { description: 'Invalid identity credentials matching failed.' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Retrieve currently logged-in user context and wallet profile',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Decoded contextual session parameters payload successfully fetched.' },
            401: { description: 'Session context token invalid or absent.' },
          },
        },
      },
      '/api/campaigns/active': {
        get: {
          summary: 'Get all active campaigns',
          tags: ['Campaigns'],
          responses: {
            200: { description: 'List of currently active open campaigns fetched.' },
          },
        },
      },
      '/api/campaigns/{id}': {
        get: {
          summary: 'Get campaign by ID',
          tags: ['Campaigns'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Campaign retrieved successfully.' },
            404: { description: 'Target campaign reference not found.' },
          },
        },
      },
      '/api/campaigns/{id}/nominees': {
        get: {
          summary: 'Get campaign nominees list',
          tags: ['Campaigns'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Nominees retrieved successfully.' },
          },
        },
      },
      '/api/campaigns/{id}/categories': {
        get: {
          summary: 'Get campaign categories list',
          tags: ['Campaigns'],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Categories retrieved successfully.' },
          },
        },
      },
      '/api/campaigns': {
        get: {
          summary: 'List all campaigns (Organizer/Admin View)',
          tags: ['Campaigns'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Comprehensive campaign data repository listing returned.' },
          },
        },
        post: {
          summary: 'Create an award campaign framework',
          tags: ['Campaigns'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description'],
                  properties: {
                    title: { type: 'string', example: 'Soundcity MVP Awards 2026' },
                    description: { type: 'string', example: 'Annual music event celebrating African artistry.' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Campaign framework configured and created successfully.' },
          },
        },
      },
      '/api/campaigns/categories/{categoryId}/nominees': {
        post: {
          summary: 'Add a new nominee to a campaign category',
          tags: ['Campaigns'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'categoryId', required: true, schema: { type: 'string' }, example: 'cat_abc123' },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Burna Boy' },
                    bio: { type: 'string', example: 'Grammy award-winning contemporary artist.' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Nominee linked and added to category registry successfully.' },
          },
        },
      },
      '/api/votes': {
        post: {
          summary: 'Cast a ballot tracking coin ledger deduction',
          tags: ['Votes'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nomineeId', 'campaignId', 'coinsToSpend'],
                  properties: {
                    nomineeId: { type: 'string', example: 'nom_67890' },
                    campaignId: { type: 'string', example: 'cmp_12345' },
                    coinsToSpend: { type: 'integer', example: 10 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Ballot verified and wallet coins deducted successfully.' },
            400: { description: 'Insufficient wallet balances.' },
          },
        },
      },
      '/api/votes/my-votes': {
        get: {
          summary: 'Fetch personal user transactional ballot tracking history',
          tags: ['Votes'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Array payload tracking historically allocated coin transactions returned.' },
          },
        },
      },
      '/api/votes/balance': {
        get: {
          summary: 'Query current checking profile coin balance parameters',
          tags: ['Votes'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Active financial wallet balance profile details outputted.' },
          },
        },
      },
      '/api/payments/webhook': {
        post: {
          summary: 'Asynchronous event gateway callback webhook listener',
          tags: ['Payments'],
          responses: {
            200: { description: 'Webhook cryptographic key read and payload recorded successfully.' },
          },
        },
      },
      '/api/payments/packages': {
        get: {
          summary: 'Enumerate platform currency conversion packages index matrix',
          tags: ['Payments'],
          responses: {
            200: { description: 'Conversion matrices listing cash pricing values array returned.' },
          },
        },
      },
      '/api/admin/campaigns': {
        get: {
          summary: 'Get all campaigns globally (Admin Framework Overview)',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Master catalog repository list of all existing campaigns emitted.' },
            403: { description: 'Forbidden - Missing structural ADMIN role constraints.' },
          },
        },
      },
      '/api/admin/campaigns/{id}/publish': {
        patch: {
          summary: 'Publish a draft campaign stage template',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Campaign state successfully shifted to PUBLISHED.' },
          },
        },
      },
      '/api/admin/campaigns/{id}/activate': {
        patch: {
          summary: 'Activate a campaign framework for active public live voting operations',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Campaign state successfully altered to ACTIVE.' },
          },
        },
      },
      '/api/admin/campaigns/{id}/pause': {
        patch: {
          summary: 'Temporarily lock or halt ballot casting capabilities on a live campaign',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Campaign state successfully suspended to PAUSED.' },
          },
        },
      },
      '/api/admin/campaigns/{id}/close': {
        patch: {
          summary: 'Permanently conclude a campaign and lock calculations',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string' }, example: 'cmp_12345' },
          ],
          responses: {
            200: { description: 'Campaign state permanently sealed to CLOSED.' },
          },
        },
      },
      '/api/admin/votes': {
        get: {
          summary: 'Fetch all votes database ledger details logs across the platform',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Full master database array tracking system ledger actions outputted.' },
          },
        },
      },
      '/api/admin/export/votes': {
        get: {
          summary: 'Export system votes audit database record indexes to spreadsheet CSV format',
          tags: ['Admin Management'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Returns an append-stream payload detailing raw spreadsheet row columns.' },
          },
        },
      },
    },
  },
  apis: [], 
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;