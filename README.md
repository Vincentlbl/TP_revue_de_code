# API Catalogue - Documentation Complète ( Groupe : Erwan , Jules et Vincent )

## 📋 Description

L'API Catalogue est une API REST Node.js pour la gestion d'un catalogue de produits et de catégories. Elle permet de créer, lister et organiser des produits avec leurs catégories associées.

## 🏗️ Architecture

```
catalogue_api/
├── src/
│   ├── app.js              # Configuration Express et routes principales
│   ├── server.js           # Point d'entrée du serveur
│   ├── data/
│   │   └── db.js           # Simulation base de données en mémoire
│   ├── middleware/
│   │   └── validate.js     # Middlewares de validation
│   └── routes/
│       ├── products.js     # Routes pour les produits
│       └── categories.js   # Routes pour les catégories
├── tests/                  # Tests unitaires et d'intégration
├── package.json
└── jest.config.js
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm

### Installation
```bash
cd catalogue_api
npm install
```

### Démarrage en développement
```bash
npm run dev
```
Le serveur démarre sur http://localhost:3000

### Démarrage en production
```bash
npm start
```

## 📡 Endpoints de l'API

### Health Check
Vérification de l'état de l'API.

**GET** `/health`

**Réponse :**
```json
{
  "status": "ok"
}
```

### Catégories

#### Lister toutes les catégories
**GET** `/categories`

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "Électronique"
  },
  {
    "id": 2,
    "name": "Vêtements"
  }
]
```

#### Créer une nouvelle catégorie
**POST** `/categories`

**Body :**
```json
{
  "name": "Nom de la catégorie"
}
```

**Réponse (201) :**
```json
{
  "id": 3,
  "name": "Nom de la catégorie"
}
```

**Erreurs possibles :**
- `400` : Nom manquant ou invalide
- `400` : Catégorie avec ce nom existe déjà

### Produits

#### Lister tous les produits
**GET** `/products`

**Réponse :**
```json
[
  {
    "id": 1,
    "name": "iPhone 15",
    "price": 999.99,
    "categoryId": 1
  },
  {
    "id": 2,
    "name": "T-shirt",
    "price": 29.90
  }
]
```

#### Créer un nouveau produit
**POST** `/products`

**Body :**
```json
{
  "name": "Nom du produit",
  "price": 99.99,
  "categoryId": 1  // Optionnel
}
```

**Réponse (201) :**
```json
{
  "id": 3,
  "name": "Nom du produit",
  "price": 99.99,
  "categoryId": 1
}
```

**Erreurs possibles :**
- `400` : Nom manquant ou invalide
- `400` : Prix manquant, invalide ou négatif
- `400` : CategoryId invalide (doit être un entier positif)
- `400` : Produit avec ce nom existe déjà
- `400` : Catégorie spécifiée n'existe pas

## 🔍 Règles de Validation

### Catégories
- **name** : Chaîne de caractères non vide (obligatoire)
- Les noms sont uniques (insensible à la casse)
- Les espaces en début/fin sont automatiquement supprimés

### Produits
- **name** : Chaîne de caractères non vide (obligatoire)
- **price** : Nombre fini >= 0 (obligatoire)
- **categoryId** : Entier positif (optionnel)
- Les noms sont uniques (insensible à la casse)
- Si categoryId est fourni, la catégorie doit exister
- Les espaces en début/fin du nom sont automatiquement supprimés

## 🧪 Tests

L'API dispose d'une suite de tests complète couvrant :
- Tests de santé de l'API
- Tests de validation des données
- Tests des endpoints CRUD
- Tests de persistance des données

### Exécution des tests
```bash
npm test
```

### Couverture des tests
Les tests couvrent :
- Validation des données d'entrée
- Gestion des erreurs
- Fonctionnalités CRUD complètes
- Contraintes d'unicité
- Vérification des relations (produit ↔ catégorie)

## 💾 Base de Données

⚠️ **Important** : L'API utilise une base de données **en mémoire**. 

### Caractéristiques :
- **Non persistante** : Toutes les données sont perdues au redémarrage
- **Thread-safe** : Gestion sécurisée des IDs auto-incrémentés
- **Réinitialisation** : Méthodes `clear()` et `reset()` pour les tests

### Structures de données :
```javascript
// Catégorie
{
  id: number,        // Auto-incrémenté
  name: string       // Unique, non vide
}

// Produit
{
  id: number,        // Auto-incrémenté
  name: string,      // Unique, non vide
  price: number,     // >= 0
  categoryId?: number // Référence vers categories.id
}
```

## 🛠️ Middleware et Validation

### Middleware de validation
- `validateProduct()` : Validation complète des données produit
- `validateCategory()` : Validation des données catégorie
- Gestion centralisée des erreurs de validation
- Messages d'erreur explicites pour faciliter le débogage

### Sécurité
- Validation stricte des types de données
- Protection contre les injections via validation des entrées
- Gestion des erreurs serveur avec messages génériques

## 📊 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| `200` | Requête réussie |
| `201` | Ressource créée avec succès |
| `400` | Erreur de validation ou données invalides |
| `500` | Erreur serveur interne |

## 🔧 Configuration

### Variables d'environnement
- `PORT` : Port d'écoute du serveur (défaut: 3000)

### Scripts disponibles
```bash
npm run dev     # Développement avec nodemon
npm start       # Production
npm test        # Tests avec Jest
```

## 🤝 Contribution

### Structure du code
- **Séparation des responsabilités** : Routes, validation, données
- **Documentation intégrée** : Commentaires JSDoc
- **Tests complets** : Couverture de tous les cas d'usage
- **Standards de code** : Formatage cohérent et lisible

### Bonnes pratiques
- Validation systématique des entrées
- Gestion d'erreurs centralisée
- Messages d'erreur informatifs
- Code modulaire et réutilisable
