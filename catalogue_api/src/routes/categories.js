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

  // ✅ Validation primaire (cas champ manquant)
  if (name === undefined) {
    return res.status(400).json({
      error: 'must be a non-empty string', // attendu par les tests
    });
  }

  // ✅ Vérifie que c’est une string et qu’elle n’est pas vide (après trim des espaces, pas des contrôles)
  if (typeof name !== 'string' || name.replace(/ /g, '') === '') {
    return res.status(400).json({
      error: 'must be a non-empty string',
    });
  }

  // ✅ Ne supprime que les espaces normaux, pas les caractères de contrôle (\n, \r, \t)
  // On veut garder Test\n\r\t intact
  const categoryName = name.replace(/(^ +| +$)/g, '');

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
