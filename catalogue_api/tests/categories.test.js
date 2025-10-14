// Tests unitaires pour les routes /categories
// Vérifie l'état initial, la validation et la création

const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/data/db');

beforeEach(() => { 
  db.products.length = 0; 
  db.categories.length = 0; 
});

// Test de l'état initial : la liste des catégories doit être vide
test('GET /categories -> [] initially', async () => {
  const res = await request(app).get('/categories');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([]);
});

// Test de validation : création d'une catégorie sans nom doit échouer
test('POST /categories 400 when name missing', async () => {
  const res = await request(app).post('/categories').send({});
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/name is required/);
});

// Test de validation : création d'une catégorie avec un nom non-string doit échouer
test('POST /categories 400 when name is not a string', async () => {
  const res = await request(app).post('/categories').send({ name: 123 });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/must be a non-empty string/);
});

// Test de validation : création d'une catégorie avec un nom null doit échouer
test('POST /categories 400 when name is null', async () => {
  const res = await request(app).post('/categories').send({ name: null });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/must be a non-empty string/);
});

// Test de validation : body absent ou mal formé doit échouer
test('POST /categories 400 when body is missing', async () => {
  const res = await request(app).post('/categories');
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/Request body is required/);
});

// Test de création réussie : création d'une catégorie avec un nom valide
test('POST /categories 201 with valid name', async () => {
  const res = await request(app).post('/categories').send({ name: 'Fruits' });
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.name).toBe('Fruits');
});

// Test de trimming : les espaces en début et fin de nom sont supprimés
test('POST /categories trims name', async () => {
  const res = await request(app).post('/categories').send({ name: '  Fruits  ' });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Fruits'); 
});

// Test d'unicité : création d'une catégorie avec un nom déjà existant doit échouer
test('POST /categories 400 when name already exists', async () => {
  await request(app).post('/categories').send({ name: 'Fruits' });
  const res = await request(app).post('/categories').send({ name: 'Fruits' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/already exists/);
});

// Test d'unicité insensible à la casse
test('POST /categories 400 when name exists with different case', async () => {
  await request(app).post('/categories').send({ name: 'Fruits' });
  const res = await request(app).post('/categories').send({ name: 'FRUITS' });
  expect(res.statusCode).toBe(400);
  expect(res.body.error).toMatch(/already exists/);
});

// Test avec caractères spéciaux : noms avec caractères spéciaux autorisés
test('POST /categories 201 with special characters', async () => {
  const res = await request(app).post('/categories').send({ name: 'Produits bio & équitables!' });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Produits bio & équitables!');
});

// Test avec espaces dans le nom : espaces internes conservés
test('POST /categories 201 with spaces in name', async () => {
  const res = await request(app).post('/categories').send({ name: 'Fruits et légumes' });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('Fruits et légumes');
});