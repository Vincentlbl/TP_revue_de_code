// Démarre le serveur Express sur le port spécifié
// Affiche l'URL d'écoute sur la console
// Gère les erreurs de démarrage et l'arrêt propre du serveur

const app = require('./app');

// Configuration du port depuis les variables d'environnement ou valeur par défaut
const PORT = process.env.PORT || 3000;

// Démarrage du serveur avec gestion d'erreurs
const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    console.error(`💡 You can set a custom port with: PORT=3001 npm start`);
  } else {
    console.error('❌ Server failed to start:', err.message);
  }
  process.exit(1);
});

// Gestion de l'arrêt propre du serveur
const gracefulShutdown = (signal) => {
  console.log(`\n📤 Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Écoute des signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export du serveur pour les tests
module.exports = server;
