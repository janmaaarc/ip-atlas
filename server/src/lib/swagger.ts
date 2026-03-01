import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IP Atlas API',
      version: '1.0.0',
      description: 'API for IP geolocation lookup, search history, favorites, analytics, and shareable results.',
    },
    servers: [
      { url: '/api', description: 'API base path' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
      schemas: {
        GeoData: {
          type: 'object',
          properties: {
            ip: { type: 'string', example: '8.8.8.8' },
            city: { type: 'string', example: 'Mountain View' },
            region: { type: 'string', example: 'California' },
            country: { type: 'string', example: 'US' },
            loc: { type: 'string', example: '37.4056,-122.0775' },
            org: { type: 'string', example: 'AS15169 Google LLC' },
            timezone: { type: 'string', example: 'America/Los_Angeles' },
          },
        },
        HistoryEntry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ipAddress: { type: 'string' },
            geoData: { $ref: '#/components/schemas/GeoData' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        FavoriteIp: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ipAddress: { type: 'string' },
            label: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AnalyticsData: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalSearches: { type: 'number' },
                uniqueIps: { type: 'number' },
                uniqueCountries: { type: 'number' },
              },
            },
            countryCounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  country: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            orgCounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  org: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            searchTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
