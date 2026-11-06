import { writeFileSync } from 'node:fs';
import swaggerJsdoc from 'swagger-jsdoc';

// Builds swagger.json from the @openapi comments in src/router.js.
const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Books Web Service',
      version: '2.0.0',
      description: 'CSE 341 Books API with books and authors.',
    },
    components: {
      schemas: {
        Author: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'a1' },
            name: { type: 'string', example: 'Maya Rivera' },
            birthYear: { type: 'integer', example: 1984 },
          },
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/router.js'],
});

writeFileSync('swagger.json', `${JSON.stringify(spec, null, 2)}\n`);
console.log('swagger.json generated');
