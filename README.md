# Mini API Catalogue

## Endpoints
- GET /health
- GET /products
- POST /products { name: string, price: number, categoryId?: number }
- GET /categories
- POST /categories { name: string }

## Dev
npm install
npm run dev   # http://localhost:3000/health

## Tests & Lint
npm test
npm run lint
