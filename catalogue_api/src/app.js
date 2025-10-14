// Point d'entrée principal de l'application Express
// Définit les routes pour /products, /categories et /health
// Utilise express.json() pour parser le body en JSON

const express = require('express');
const products = require('./routes/products');
const categories = require('./routes/categories');

const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Routes principales de l'API
app.use('/products', products);
app.use('/categories', categories);

// Route de santé pour vérifier la disponibilité de l'API
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
