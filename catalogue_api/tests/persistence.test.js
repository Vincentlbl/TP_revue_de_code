// Tests de persistance des données sur plusieurs requêtes
// Vérifie que les données restent cohérentes pendant la durée de vie de l'application

const request = require('supertest');
const app = require('../src/app');
const { db, reset } = require('../src/data/db');

beforeEach(() => {
  reset(); // Utilise la nouvelle fonction reset pour remettre à zéro l'ID counter
});

// Test de persistance : les données créées doivent persister entre les requêtes
test('Data persists across multiple requests within same session', async () => {
  // Créer une catégorie
  const categoryRes = await request(app)
    .post('/categories')
    .send({ name: 'Electronics' });
  
  expect(categoryRes.statusCode).toBe(201);
  const categoryId = categoryRes.body.id;

  // Créer un produit dans cette catégorie
  const productRes = await request(app)
    .post('/products')
    .send({ name: 'Smartphone', price: 599.99, categoryId });
  
  expect(productRes.statusCode).toBe(201);

  // Vérifier que les données persistent en récupérant la liste
  const categoriesRes = await request(app).get('/categories');
  const productsRes = await request(app).get('/products');

  expect(categoriesRes.body).toHaveLength(1);
  expect(categoriesRes.body[0].name).toBe('Electronics');
  
  expect(productsRes.body).toHaveLength(1);
  expect(productsRes.body[0].name).toBe('Smartphone');
  expect(productsRes.body[0].categoryId).toBe(categoryId);
});

// Test d'incrémentation des IDs : les IDs doivent être uniques et croissants
test('IDs are incremented correctly across collections', async () => {
  // Créer plusieurs éléments et vérifier l'incrémentation
  const cat1 = await request(app).post('/categories').send({ name: 'Cat1' });
  const prod1 = await request(app).post('/products').send({ name: 'Prod1', price: 10 });
  const cat2 = await request(app).post('/categories').send({ name: 'Cat2' });
  const prod2 = await request(app).post('/products').send({ name: 'Prod2', price: 20 });

  // Les IDs doivent être séquentiels
  expect(cat1.body.id).toBe(1);
  expect(prod1.body.id).toBe(2);
  expect(cat2.body.id).toBe(3);
  expect(prod2.body.id).toBe(4);
});

// Test de cohérence des relations : les relations entre produits et catégories doivent rester valides
test('Product-category relationships remain consistent', async () => {
  // Créer plusieurs catégories
  const electronics = await request(app).post('/categories').send({ name: 'Electronics' });
  const books = await request(app).post('/categories').send({ name: 'Books' });

  // Créer des produits dans différentes catégories
  const smartphone = await request(app)
    .post('/products')
    .send({ name: 'Smartphone', price: 599.99, categoryId: electronics.body.id });
  
  const novel = await request(app)
    .post('/products')
    .send({ name: 'Novel', price: 15.99, categoryId: books.body.id });

  // Vérifier que les relations sont correctes
  const productsRes = await request(app).get('/products');
  const products = productsRes.body;

  const smartphoneData = products.find(p => p.name === 'Smartphone');
  const novelData = products.find(p => p.name === 'Novel');

  expect(smartphoneData.categoryId).toBe(electronics.body.id);
  expect(novelData.categoryId).toBe(books.body.id);
});

// Test de limite de la base en mémoire : avertissement sur la non-persistance
test('Warning: Data is lost when server restarts (in-memory limitation)', async () => {
  // Ce test documente la limitation de la base en mémoire
  // En réalité, on ne peut pas tester le redémarrage du serveur,
  // mais on peut tester le reset manuel de la base
  
  // Créer des données
  await request(app).post('/categories').send({ name: 'Test Category' });
  await request(app).post('/products').send({ name: 'Test Product', price: 1.0 });

  // Vérifier que les données existent
  let categoriesRes = await request(app).get('/categories');
  let productsRes = await request(app).get('/products');
  
  expect(categoriesRes.body).toHaveLength(1);
  expect(productsRes.body).toHaveLength(1);

  // Simuler un redémarrage en vidant manuellement la base
  db.categories.length = 0;
  db.products.length = 0;

  // Vérifier que les données sont perdues
  categoriesRes = await request(app).get('/categories');
  productsRes = await request(app).get('/products');
  
  expect(categoriesRes.body).toHaveLength(0);
  expect(productsRes.body).toHaveLength(0);
});

// Test de concurrence : plusieurs requêtes simultanées doivent être gérées correctement
test('Concurrent requests are handled correctly', async () => {
  // Créer plusieurs éléments en parallèle
  const requests = Array.from({ length: 5 }, (_, i) => 
    request(app).post('/categories').send({ name: `Category${i}` })
  );

  const responses = await Promise.all(requests);

  // Toutes les requêtes doivent réussir
  responses.forEach(res => {
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  // Vérifier que toutes les catégories ont été créées
  const categoriesRes = await request(app).get('/categories');
  expect(categoriesRes.body).toHaveLength(5);

  // Vérifier que tous les IDs sont uniques
  const ids = categoriesRes.body.map(cat => cat.id);
  const uniqueIds = [...new Set(ids)];
  expect(uniqueIds).toHaveLength(5);
});