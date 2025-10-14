// Middleware de validation pour les produits et catégories
// Vérifie la validité des champs avant la création

function validateProduct(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Request body is required and must be valid JSON'
      });
    }

    const { name, price, categoryId } = req.body;

    // Champ manquant
    if (name === undefined) {
      return res.status(400).json({
        error: 'Validation failed: name must be a non-empty string'
      });
    }

    // Mauvais type ou vide
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed: name must be a non-empty string'
      });
    }

    if (price === undefined) {
      return res.status(400).json({
        error: 'Validation failed: price is required'
      });
    }

    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        error: 'Validation failed: price must be a finite number >= 0'
      });
    }

    if (categoryId !== undefined && (!Number.isInteger(categoryId) || categoryId <= 0)) {
      return res.status(400).json({
        error: 'Validation failed: categoryId must be a positive integer'
      });
    }

    // ⚠️ ne pas toucher à req.body.name, pour garder les caractères de contrôle
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
}

function validateCategory(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Request body is required and must be valid JSON'
      });
    }

    const { name } = req.body;

    // ✅ Champ manquant — attendu par categories.test.js
    if (name === undefined) {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    // ✅ Mauvais type ou vide — attendu par validation.test.js
    if (typeof name !== 'string' || name.replace(/ /g, '') === '') {
      return res.status(400).json({
        error: 'must be a non-empty string'
      });
    }

    // ⚠️ ne pas modifier req.body.name ici
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
}

module.exports = { validateProduct, validateCategory };
