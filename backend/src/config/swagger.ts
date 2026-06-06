import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Eventful API',
    version: '1.0.0',
    description: 'API documentation for Eventful'
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server',
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
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['CREATOR', 'EVENTEE'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          imageUrl: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          price: { type: 'number' },
          totalTickets: { type: 'number' },
          availableTickets: { type: 'number' },
          category: { type: 'string' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ticketCode: { type: 'string' },
          qrCode: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'SCANNED', 'CANCELLED'] },
          scannedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          status: {
            type: 'string',
            enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
          },
          paystackReference: { type: 'string' },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password', 'role'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', example: 'password123' },
                role: { type: 'string', enum: ['CREATOR', 'EVENTEE'] },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login a user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', example: 'password123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/User' },
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'New access token issued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout current user',
      responses: {
        200: { description: 'Logged out successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current authenticated user',
      responses: {
        200: {
          description: 'Current user data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        401: { description: 'Not authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/events': {
    get: {
      tags: ['Events'],
      summary: 'Get all published events',
      security: [],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
        { name: 'category', in: 'query', schema: { type: 'string', example: 'Music' } },
        { name: 'search', in: 'query', schema: { type: 'string', example: 'Lagos Jazz' } },
        { name: 'status', in: 'query', schema: { type: 'string', example: 'PUBLISHED' } },
      ],
      responses: {
        200: {
          description: 'List of events with pagination',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      events: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer' },
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          totalPages: { type: 'integer' },
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
    },
    post: {
      tags: ['Events'],
      summary: 'Create a new event (Creator only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'description', 'location', 'startDate', 'endDate', 'price', 'totalTickets', 'category'],
              properties: {
                title: { type: 'string', example: 'Lagos Jazz Night' },
                description: { type: 'string', example: 'A great jazz event' },
                location: { type: 'string', example: 'Eko Hotel, Lagos' },
                imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                price: { type: 'number', example: 5000 },
                totalTickets: { type: 'integer', example: 100 },
                category: { type: 'string', example: 'Music' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Event created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } },
        400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/events/{id}': {
    get: {
      tags: ['Events'],
      summary: 'Get a single event by ID',
      security: [],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Event with share links',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    allOf: [
                      { $ref: '#/components/schemas/Event' },
                      {
                        type: 'object',
                        properties: {
                          shareLinks: {
                            type: 'object',
                            properties: {
                              eventUrl: { type: 'string' },
                              twitter: { type: 'string' },
                              facebook: { type: 'string' },
                              whatsapp: { type: 'string' },
                              linkedin: { type: 'string' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    put: {
      tags: ['Events'],
      summary: 'Update an event (Creator only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                location: { type: 'string' },
                imageUrl: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                price: { type: 'number' },
                totalTickets: { type: 'integer' },
                category: { type: 'string' },
                status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Event updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Events'],
      summary: 'Delete an event (Creator only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Event deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/events/creator/my-events': {
    get: {
      tags: ['Events'],
      summary: 'Get all events created by the authenticated creator',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
        { name: 'category', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: { description: 'Creator events with pagination', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/events/{id}/attendees': {
    get: {
      tags: ['Events'],
      summary: 'Get attendees for an event (Creator only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'List of attendees with ticket and payment info', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/tickets/purchase': {
    post: {
      tags: ['Tickets'],
      summary: 'Purchase a ticket for an event (Eventee only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['eventId'],
              properties: {
                eventId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Ticket purchased', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } } },
        400: { description: 'No tickets available or event not published', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: 'Already have a ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/tickets/my-tickets': {
    get: {
      tags: ['Tickets'],
      summary: 'Get all tickets for the authenticated eventee',
      responses: {
        200: { description: 'List of tickets with event and payment info', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
      },
    },
  },

  '/tickets/{id}': {
    get: {
      tags: ['Tickets'],
      summary: 'Get a single ticket by ID (Eventee only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Ticket details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ticket' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Ticket not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/tickets/{id}/cancel': {
    patch: {
      tags: ['Tickets'],
      summary: 'Cancel a ticket (Eventee only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Ticket cancelled', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Cannot cancel scanned or already cancelled ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/tickets/verify': {
    post: {
      tags: ['Tickets'],
      summary: 'Verify and scan a ticket at event entrance (Creator only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['ticketCode'],
              properties: {
                ticketCode: { type: 'string', example: 'uuid-ticket-code' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Ticket verification result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean' },
                      message: { type: 'string' },
                      ticket: { $ref: '#/components/schemas/Ticket' },
                    },
                  },
                },
              },
            },
          },
        },
        404: { description: 'Invalid ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/payments/initiate': {
    post: {
      tags: ['Payments'],
      summary: 'Initiate a payment for an event (Eventee only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['eventId'],
              properties: {
                eventId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Payment initiated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      free: { type: 'boolean' },
                      paymentId: { type: 'string' },
                      reference: { type: 'string' },
                      authorizationUrl: { type: 'string' },
                      accessCode: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Event not available or no tickets', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: 'Already have a ticket', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/payments/webhook': {
    post: {
      tags: ['Payments'],
      summary: 'Paystack webhook handler',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                event: { type: 'string', example: 'charge.success' },
                data: { type: 'object' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Webhook received', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Invalid webhook signature', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/payments/verify/{reference}': {
    get: {
      tags: ['Payments'],
      summary: 'Verify a payment by Paystack reference',
      parameters: [{ name: 'reference', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Payment details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Payment' } } } },
        404: { description: 'Payment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/payments/creator': {
    get: {
      tags: ['Payments'],
      summary: 'Get all payments for the authenticated creator',
      responses: {
        200: {
          description: 'All payments with total revenue',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                      totalRevenue: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/payments/event/{eventId}': {
    get: {
      tags: ['Payments'],
      summary: 'Get payments for a specific event (Creator only)',
      parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Event payments with total revenue', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/reminders': {
    post: {
      tags: ['Reminders'],
      summary: 'Set a reminder for an event (Eventee only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['eventId', 'offset'],
              properties: {
                eventId: { type: 'string', format: 'uuid' },
                offset: {
                  type: 'object',
                  required: ['value', 'unit'],
                  properties: {
                    value: { type: 'integer', example: 1 },
                    unit: { type: 'string', enum: ['minutes', 'hours', 'days', 'weeks'], example: 'days' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Reminder created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Reminder time has passed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: 'Reminder already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/reminders/my-reminders': {
    get: {
      tags: ['Reminders'],
      summary: 'Get all reminders for the authenticated eventee',
      responses: {
        200: { description: 'List of reminders with event info', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
      },
    },
  },

  '/reminders/{id}': {
    delete: {
      tags: ['Reminders'],
      summary: 'Delete a reminder (Eventee only)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'Reminder deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Reminder already sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Reminder not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/reminders/event-default': {
    post: {
      tags: ['Reminders'],
      summary: 'Set a default reminder for all attendees of an event (Creator only)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['eventId', 'offset'],
              properties: {
                eventId: { type: 'string', format: 'uuid' },
                offset: {
                  type: 'object',
                  required: ['value', 'unit'],
                  properties: {
                    value: { type: 'integer', example: 1 },
                    unit: { type: 'string', enum: ['minutes', 'hours', 'days', 'weeks'], example: 'days' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Reminders set for all attendees', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        400: { description: 'Reminder time has passed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/reminders/event/{eventId}': {
    get: {
      tags: ['Reminders'],
      summary: 'Get all reminders for a specific event (Creator only)',
      parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: { description: 'List of reminders for the event', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/analytics/overview': {
    get: {
      tags: ['Analytics'],
      summary: 'Get overall analytics for the authenticated creator',
      responses: {
        200: {
          description: 'Creator analytics overview',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      totalEvents: { type: 'integer' },
                      totalTicketsSold: { type: 'integer' },
                      totalRevenue: { type: 'number' },
                      totalScans: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/analytics/trend/tickets': {
    get: {
      tags: ['Analytics'],
      summary: 'Get ticket sales trend for the last 30 days (Creator only)',
      responses: {
        200: {
          description: 'Daily ticket sales for last 30 days',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string', format: 'date' },
                        tickets: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/analytics/trend/revenue': {
    get: {
      tags: ['Analytics'],
      summary: 'Get revenue trend for the last 30 days (Creator only)',
      responses: {
        200: {
          description: 'Daily revenue for last 30 days',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string', format: 'date' },
                        revenue: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/analytics/top-events': {
    get: {
      tags: ['Analytics'],
      summary: 'Get top 5 events by ticket sales (Creator only)',
      responses: {
        200: {
          description: 'Top events ranked by tickets sold',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        startDate: { type: 'string', format: 'date-time' },
                        ticketsSold: { type: 'integer' },
                        revenue: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/analytics/event/{eventId}': {
    get: {
      tags: ['Analytics'],
      summary: 'Get analytics for a specific event (Creator only)',
      parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Event analytics with attendance rate',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      event: { $ref: '#/components/schemas/Event' },
                      totalTicketsSold: { type: 'integer' },
                      totalScanned: { type: 'integer' },
                      totalRevenue: { type: 'number' },
                      attendanceRate: { type: 'number' },
                      recentTickets: { type: 'array', items: { $ref: '#/components/schemas/Ticket' } },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: 'Not authorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
},
};

export const setupSwagger = (app: Express): void => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger docs available at /api/docs');
};