# cse341-books

Books Web Service for CSE 341 (Node.js, Express, MongoDB).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string.
3. `npm run dev`, then open http://localhost:3000
4. API documentation is at http://localhost:3000/api-docs

## Swagger

Routes are documented with `@openapi` comments in `src/router.js`. After changing a comment, run `npm run swagger` to regenerate `swagger.json`, and commit the result. Render serves the committed file.
