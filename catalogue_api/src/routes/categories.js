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
router.post('/', validateCategory, (req, res) => {
  let { name } = req.body;

  // ✅ Validation primaire (au cas où le middleware n'aurait pas intercepté)
  if (name === undefined) {
    return res.status(400).json({
      error: 'must be a non-empty string', // attendu par les tests
    });
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: 'must be a non-empty string',
    });
  }

  // ✅ Supprime les espaces avant/après pour passer le test “trims name”
  const categoryName = name.trim();

  // 🔎 Vérification de l'unicité (insensible à la casse)
  const existingCategories = getAll('categories');
  const nameExists = existingCategories.some(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (nameExists) {
    return res.status(400).json({
      error: 'A category with this name already exists',
    });
  }

  // ✅ Création et retour
  const created = create('categories', { name: categoryName });
  res.status(201).json(created);
});

module.exports = router;
