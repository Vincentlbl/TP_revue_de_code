// Routes pour la gestion des produits
// GET /products — liste tous les produits
// POST /products — crée un produit après validation et vérification de la catégorie

const express = require('express');
const { db, create, getAll, findById } = require('../data/db');
const { validateProduct } = require('../middleware/validate');

const router = express.Router();

/**
 * GET /products
 * Retourne la liste de tous les produits
 */
router.get('/', (_req, res) => {
  res.json(getAll('products'));
});

/**
 * POST /products
 * Crée un nouveau produit après validation
 * Vérifie l'existence de la catégorie si fournie
 * Vérifie l'unicité du nom du produit
 */
router.post('/', validateProduct, (req, res) => {
  const { name, price, categoryId } = req.body;
  const productName = name.trim();

  // Vérification de l'unicité du nom
  const existingProducts = getAll('products');
  const nameExists = existingProducts.some(product => 
    product.name.toLowerCase() === productName.toLowerCase()
  );
  
  if (nameExists) {
    return res.status(400).json({ 
      error: 'A product with this name already exists' 
    });
  }

  // Vérification de l'existence de la catégorie si fournie
  if (categoryId) {
    const categoryExists = db.categories.some(c => c.id === categoryId);
    if (!categoryExists) {
      return res.status(400).json({ 
        error: 'categoryId does not exist' 
      });
    }
  }

  const created = create('products', { 
    name: productName, 
    price, 
    categoryId 
  });
  
  res.status(201).json(created);
});

module.exports = router;
