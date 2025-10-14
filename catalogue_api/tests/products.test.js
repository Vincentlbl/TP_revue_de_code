// Tests unitaires pour les routes /products
// Vérifie la validation, la création et les erreurs liées à la catégorie

const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/data/db');

beforeEach(() => { 
  db.products.length = 0; 
  db.categories.length = 0; 
});

// Test de l'état initial : la liste des produits doit être vide
test('GET /products -> [] initially', async () => {
  const res = await request(app).get('/products');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});

// Test de validation : création d'un produit sans nom doit échouer
test('POST /products 400 when name missing', async () => {
  const res = await request(app).post('/products').send({ price: 1.2 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/name is required/);
});

// Test de validation : création d'un produit avec un prix invalide doit échouer
test('POST /products 400 when price invalid', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: 'x' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/price must be a finite number/);
});

// Test de validation : création d'un produit avec une catégorie inexistante doit échouer
test('POST /products 400 when categoryId unknown', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: 1.2, categoryId: 999 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/categoryId does not exist/);
});

// Test de création réussie : produit avec catégorie valide
test('POST /products 201 nominal', async () => {
  const cat = await request(app).post('/categories').send({ name: 'Fruits' });
  const res = await request(app).post('/products').send({ name: 'Apple', price: 1.2, categoryId: cat.body.id });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Apple');
  expect(res.body.price).toBe(1.2);
  expect(res.body.categoryId).toBe(cat.body.id);
});

// Test de création réussie : produit avec prix à zéro
test('POST /products 201 with price = 0', async () => {
  const res = await request(app).post('/products').send({ name: 'Free Item', price: 0 });
  expect(res.statusCode).toBe(201);
  expect(res.body.price).toBe(0);
});

// Test de création réussie : produit sans catégorie
test('POST /products 201 without categoryId', async () => {
  const res = await request(app).post('/products').send({ name: 'Generic Product', price: 5.99 });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Generic Product');
  expect(res.body.categoryId).toBeUndefined();
});

// Test de validation : body absent ou mal formé doit échouer
test('POST /products 400 when body is missing', async () => {
  const res = await request(app).post('/products');
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Request body is required/);
});

// Test de validation : prix négatif doit échouer
test('POST /products 400 when price is negative', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: -1.5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/price must be a finite number >= 0/);
});

// Test de validation : prix non numérique doit échouer
test('POST /products 400 when price is not a number', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: null });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/price must be a finite number/);
});

// Test de validation : nom non-string doit échouer
test('POST /products 400 when name is not a string', async () => {
  const res = await request(app).post('/products').send({ name: 123, price: 1.5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/must be a non-empty string/);
});

// Test de validation : categoryId non-entier doit échouer
test('POST /products 400 when categoryId is not an integer', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: 1.5, categoryId: 1.5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/categoryId must be a positive integer/);
});

// Test de validation : categoryId négatif doit échouer
test('POST /products 400 when categoryId is negative', async () => {
  const res = await request(app).post('/products').send({ name: 'Apple', price: 1.5, categoryId: -1 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/categoryId must be a positive integer/);
});

// Test d'unicité : création d'un produit avec un nom déjà existant doit échouer
test('POST /products 400 when name already exists', async () => {
  await request(app).post('/products').send({ name: 'Apple', price: 1.2 });
  const res = await request(app).post('/products').send({ name: 'Apple', price: 1.5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/already exists/);
});

// Test d'unicité insensible à la casse
test('POST /products 400 when name exists with different case', async () => {
  await request(app).post('/products').send({ name: 'Apple', price: 1.2 });
  const res = await request(app).post('/products').send({ name: 'APPLE', price: 1.5 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/already exists/);
});

// Test avec champs supplémentaires : les champs non attendus sont ignorés
test('POST /products 201 ignores unexpected fields', async () => {
  const res = await request(app).post('/products').send({ 
    name: 'Apple', 
    price: 1.2, 
    description: 'This should be ignored',
    color: 'red'
  });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Apple');
  expect(res.body.price).toBe(1.2);
  expect(res.body.description).toBeUndefined();
  expect(res.body.color).toBeUndefined();
});

// Test de trimming : les espaces en début et fin de nom sont supprimés
test('POST /products trims product name', async () => {
  const res = await request(app).post('/products').send({ name: '  Apple  ', price: 1.2 });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Apple');
});

// Test avec prix décimal très précis
test('POST /products 201 with precise decimal price', async () => {
  const res = await request(app).post('/products').send({ name: 'Precision Item', price: 1.999999 });
  expect(res.statusCode).toBe(201);
  expect(res.body.price).toBe(1.999999);
});