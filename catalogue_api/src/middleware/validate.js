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

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed: name must be a non-empty string'
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

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
}

/**
 * Middleware de validation pour les catégories
 * Doit produire des messages exactement comme attendus par les tests :
 * - "name is required"
 * - "must be a non-empty string"
 */
function validateCategory(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Request body is required and must be valid JSON'
      });
    }

    const { name } = req.body;

    // Champ manquant
    if (name === undefined) {
      return res.status(400).json({
        error: 'Validation failed: name is required'
      });
    }

    // Type invalide
    if (typeof name !== 'string') {
      return res.status(400).json({
        error: 'Validation failed: name must be a non-empty string'
      });
    }

    // Chaîne vide (après suppression des espaces uniquement)
    if (name.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed: name must be a non-empty string'
      });
    }

    // ✅ On ne modifie pas req.body.name (pour garder \n, \r, \t)
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
}

module.exports = { validateProduct, validateCategory };
