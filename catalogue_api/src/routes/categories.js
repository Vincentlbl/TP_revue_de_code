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
  // ✅ Correction : on ne supprime que les espaces en début/fin
  // pour ne pas enlever les caractères de contrôle internes (\n, \r, \t)
  const categoryName = req.body.name.replace(/^[\s]+|[\s]+$/g, '');

  // Vérification de l'unicité du nom (insensible à la casse)
  const existingCategories = getAll('categories');
  const nameExists = existingCategories.some(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (nameExists) {
    return res.status(400).json({
      error: 'A category with this name already exists',
    });
  }

  // Création de la nouvelle catégorie
  const created = create('categories', { name: categoryName });
  res.status(201).json(created);
});

module.exports = router;
