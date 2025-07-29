// Importa los módulos necesarios
const cors = require('cors');
const express = require('express'); // Framework web para Node.js
require('dotenv').config(); // Carga las variables de entorno del archivo .env
const { testDbConnection } = require('./config/db'); // Importa la función para probar la conexión a la DB
const adminRoutes = require('./routes/adminRoutes'); // Importa las rutas de administrador.
const paymentRoutes = require('./routes/paymentRoutes'); // Importa la ruta de pagos
const Routes = require('./routes/Pure_Cinema_Feel'); // Importa las rutas de autenticación
const userRoutes = require('./routes/userRoutes');


// Inicializa la aplicación Express
const app = express();
app.use(cors());
// Middleware para parsear el cuerpo de las solicitudes en formato JSON
// Express lee los datos enviados en las solicitudes POST (registro, login)
app.use(express.json());

// Prueba la conexión a la base de datos al iniciar la aplicación
// Esto asegura que la DB esté accesible antes de que el servidor comience a escuchar solicitudes
testDbConnection();

// Monta las rutas de autenticación
// Todas las rutas definidas en Pure_Cinema_Feel (/register, /login / Recuperar)
// serán accesibles bajo el prefijo /api/Pure_Cinema_Feel
// POST /api/Pure_Cinema_Feel/register
app.use('/api/Pure_Cinema_Feel', Routes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
console.log('Registrando rutas de pago en /api');
app.use('/api/', paymentRoutes);

app.use('/uploads', express.static('uploads'));



// Añade esto para ver qué se cargó en 'Routes'
console.log('DEBUG: Rutas principales cargadas en /api/Pure_Cinema_Feel:', Routes.stack.map(s => s.route));


// Ruta de prueba simple para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('¡Servicio de autenticación satisfactorio!');
});

// Se define el puerto dond el servidor escuchará
const PORT = process.env.PORT || 8080;

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor de autenticación corriendo en el puerto ${8080}`);
    console.log(`Accede a http://localhost:${8080}`);
});

// URL Base para TODAS las RUTAS
///http://localhost:8080/api/Pure_Cinema_Feel/