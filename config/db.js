const mysql = require('mysql2/promise'); // Usamos la versión de Promesas para async/await
require('dotenv').config(); // Carga las variables de entorno del archivo .env

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para probar la conexión
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos MySQL exitosa!');
        connection.release(); // Libera la conexión de vuelta al pool
    } catch (error) {
        console.error('Error al conectar con la base de datos MySQL:', error.message);
        process.exit(1); // Sale de la aplicación si no puede conectar
    }
}

module.exports = {
    pool,
    testDbConnection
};