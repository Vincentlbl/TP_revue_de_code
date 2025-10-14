// Routes pour la gestion des catégories
// GET /categories — liste toutes les catégories
// POST /categories — crée une nouvelle catégorie après validation

const express = require('express');
const { create, getAll } = require('../data/db');
const { validateCategory } = require('../middleware/validate');

const router = express.Router();

/**
 * GET /categories
 * Retourne la liste de toutes les catégories
 */
router.get('/', (_req, res) => {
  res.json(getAll('categories'));
});

/**
 * POST /categories
 * Crée une nouvelle catégorie après validation
 * Vérifie l'unicité du nom avant création
 */
router.post('/', (req, res, next) => {
  // ⚠️ Cas spécifique : champ "name" totalement absent → erreur claire
  if (req.body && req.body.name === undefined) {
    return res.status(400).json({
      error: 'Validation failed: name must be a non-empty string'
    });
  }

  next(); // passe au middleware de validation si tout va bien
}, validateCategory, (req, res) => {
  let { name } = req.body;

  // ✅ Vérifie que c’est une string non vide
  if (typeof name !== 'string') {
    return res.status(400).json({
      error: 'Validation failed: name must be a non-empty string'
    });
  }

  // ✅ Supprime uniquement les espaces autour, pas les \n, \t, etc.
  const categoryName = name.replace(/(^ +| +$)/g, '');

  if (categoryName === '') {
    return res.status(400).json({
      error: 'Validation failed: name must be a non-empty string'
    });
  }

  // 🔎 Vérification de l'unicité (insensible à la casse)
  const existingCategories = getAll('categories');
  const nameExists = existingCategories.some(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (nameExists) {
    return res.status(400).json({
      error: 'A category with this name already exists'
    });
  }

  // ✅ Création et retour
  const created = create('categories', { name: categoryName });
  res.status(201).json(created);
});

module.exports = router;
