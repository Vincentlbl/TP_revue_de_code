// Middleware de validation pour les produits et catégories
// Vérifie la validité des champs avant la création

/**
 * Middleware de validation pour les produits
 * Vérifie que name est une chaîne non vide, price est un nombre >= 0
 * et categoryId est un entier positif (optionnel)
 */
function validateProduct(req, res, next) {
  try {
    // Vérification de la présence du body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Request body is required and must be valid JSON' 
      });
    }

    const { name, price, categoryId } = req.body;

    // Validation du nom
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation failed: name is required and must be a non-empty string' 
      });
    }

    // Validation du prix
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ 
        error: 'Validation failed: price must be a finite number >= 0' 
      });
    }

    // Validation du categoryId (optionnel)
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
 * Vérifie que name est une chaîne non vide
 */
function validateCategory(req, res, next) {
  try {
    // Vérification de la présence du body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Request body is required and must be valid JSON' 
      });
    }

    const { name } = req.body;

    // Validation du nom
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation failed: name is required and must be a non-empty string' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error during validation' 
    });
  }
}

module.exports = { validateProduct, validateCategory };

