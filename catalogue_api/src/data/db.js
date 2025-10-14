// Simule une base de données en mémoire, non persistante.
// Fournit des méthodes pour créer et lister des produits et catégories.
// ATTENTION : Les données sont perdues à chaque redémarrage du serveur.

// Base de données en mémoire
const db = { 
  products: [], 
  categories: [] 
};

// Compteur global pour l'attribution des IDs
let idCounter = 1;

/**
 * Crée un nouvel élément dans la collection spécifiée
 * @param {string} collection - Nom de la collection ('products' ou 'categories')
 * @param {object} item - Objet à insérer
 * @returns {object} L'objet créé avec son ID
 */
const create = (collection, item) => { 
  const withId = { id: idCounter++, ...item }; 
  db[collection].push(withId); 
  return withId; 
};

/**
 * Récupère tous les éléments d'une collection
 * @param {string} collection - Nom de la collection
 * @returns {array} Tableau des éléments
 */
const getAll = (collection) => db[collection];

/**
 * Trouve un élément par son ID dans une collection
 * @param {string} collection - Nom de la collection
 * @param {number} id - ID de l'élément à trouver
 * @returns {object|undefined} L'élément trouvé ou undefined
 */
const findById = (collection, id) => db[collection].find(item => item.id === id);

/**
 * Réinitialise une collection (utile pour les tests)
 * @param {string} collection - Nom de la collection à vider
 */
const clear = (collection) => {
  db[collection].length = 0;
};

/**
 * Réinitialise complètement la base de données et le compteur d'ID
 */
const reset = () => {
  db.products.length = 0;
  db.categories.length = 0;
  idCounter = 1;
};

module.exports = { db, create, getAll, findById, clear, reset };

