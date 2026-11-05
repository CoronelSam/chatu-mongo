require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

connectDB().then(() => {
  // En Express 5 este callback también recibe el error si no se pudo abrir el puerto.
  app.listen(process.env.PORT, (err) => {
    if (err) {
      console.error('No se pudo iniciar el servidor:', err.message);
      process.exit(1);
    }
    console.log(`Servidor en puerto ${process.env.PORT}`);
  });
});
