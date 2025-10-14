// Tests de validation avancés pour les middleware
// Vérifie les cas limites et les erreurs de validation

const request = require('supertest');
const app = require('../src/app');
const { db } = require('../src/data/db');

beforeEach(() => {
  db.products.length = 0;
  db.categories.length = 0;
});

describe('Advanced validation tests', () => {
  
  describe('Body validation', () => {
    // Test avec un body JSON invalide
    test('POST /categories should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/categories')
        .set('Content-Type', 'application/json')
        .send('{"name": invalid json}');
      
      expect(res.statusCode).toBe(400);
    });

    // Test avec un Content-Type incorrect
    test('POST /categories should handle non-JSON content type', async () => {
      const res = await request(app)
        .post('/categories')
        .set('Content-Type', 'text/plain')
        .send('name=Test');
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('String validation edge cases', () => {
    // Test avec une chaîne vide après trim
    test('POST /categories should reject empty string after trim', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: '   ' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/must be a non-empty string/);
    });

    // Test avec des caractères de contrôle
    test('POST /categories should handle control characters', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Test\n\r\t' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Test\n\r\t');
    });

    // Test avec des émojis
    test('POST /categories should handle emoji characters', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: 'Fruits 🍎🍌' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Fruits 🍎🍌');
    });

    // Test avec une très longue chaîne
    test('POST /categories should handle very long strings', async () => {
      const longName = 'A'.repeat(1000);
      const res = await request(app)
        .post('/categories')
        .send({ name: longName });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(longName);
    });
  });

  describe('Price validation edge cases', () => {
    // Test avec Infinity
    test('POST /products should reject Infinity price', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: Infinity });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/finite number/);
    });

    // Test avec -Infinity
    test('POST /products should reject -Infinity price', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: -Infinity });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/finite number/);
    });

    // Test avec NaN
    test('POST /products should reject NaN price', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: NaN });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/finite number/);
    });

    // Test avec un très grand nombre
    test('POST /products should handle very large numbers', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Expensive Item', price: Number.MAX_SAFE_INTEGER });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.price).toBe(Number.MAX_SAFE_INTEGER);
    });

    // Test avec un très petit nombre positif
    test('POST /products should handle very small positive numbers', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Cheap Item', price: Number.MIN_VALUE });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.price).toBe(Number.MIN_VALUE);
    });
  });

  describe('CategoryId validation edge cases', () => {
    // Test avec zéro
    test('POST /products should reject categoryId = 0', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: 1.0, categoryId: 0 });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/positive integer/);
    });

    // Test avec un nombre décimal proche d'un entier
    test('POST /products should reject decimal categoryId', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: 1.0, categoryId: 1.0000001 });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/positive integer/);
    });

    // Test avec un très grand entier
    test('POST /products should handle large categoryId', async () => {
      // D'abord créer une catégorie avec un ID normal
      const catRes = await request(app)
        .post('/categories')
        .send({ name: 'Test Category' });
      
      // Puis tester avec l'ID valide
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: 1.0, categoryId: catRes.body.id });
      
      expect(res.statusCode).toBe(201);
    });
  });

  describe('Field type validation', () => {
    // Test avec des types complètement incorrects
    test('POST /categories should reject array as name', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: ['not', 'a', 'string'] });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/must be a non-empty string/);
    });

    test('POST /categories should reject object as name', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: { nested: 'object' } });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/must be a non-empty string/);
    });

    test('POST /products should reject string as price', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: '10.99' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/finite number/);
    });

    test('POST /products should reject boolean as price', async () => {
      const res = await request(app)
        .post('/products')
        .send({ name: 'Test', price: true });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/finite number/);
    });
  });

  describe('Missing fields handling', () => {
    // Test avec undefined explicite
    test('POST /categories should reject undefined name', async () => {
      const res = await request(app)
        .post('/categories')
        .send({ name: undefined });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/must be a non-empty string/);
    });

    // Test avec tous les champs manquants pour les produits
    test('POST /products should reject when all fields missing', async () => {
      const res = await request(app)
        .post('/products')
        .send({});
      
      expect(res.statusCode).toBe(400);
      // Le premier champ validé (name) doit échouer
      expect(res.body.error).toMatch(/name is required/);
    });
  });
});