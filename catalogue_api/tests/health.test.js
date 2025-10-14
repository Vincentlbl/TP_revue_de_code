// Test de la route /health pour la disponibilité de l'API

const request = require('supertest');
const app = require('../src/app');

// Test principal : vérifier que l'API répond avec le statut OK
test('GET /health -> {status: ok}', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});

// Test de méthode non autorisée : POST sur /health doit échouer
test('POST /health should return 404', async () => {
  const res = await request(app).post('/health');
  expect(res.statusCode).toBe(404);
});

// Test de méthode non autorisée : PUT sur /health doit échouer
test('PUT /health should return 404', async () => {
  const res = await request(app).put('/health');
  expect(res.statusCode).toBe(404);
});

// Test de méthode non autorisée : DELETE sur /health doit échouer
test('DELETE /health should return 404', async () => {
  const res = await request(app).delete('/health');
  expect(res.statusCode).toBe(404);
});

// Test de cohérence : plusieurs appels consécutifs doivent donner le même résultat
test('GET /health should be consistent across multiple calls', async () => {
  const responses = await Promise.all([
    request(app).get('/health'),
    request(app).get('/health'),
    request(app).get('/health')
  ]);
  
  responses.forEach(res => {
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

