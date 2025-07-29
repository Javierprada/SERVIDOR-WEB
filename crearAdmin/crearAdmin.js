// crearAdmin.js
const bcrypt = require('bcryptjs');
const {pool} = require('../config/db'); // Ajusta esta ruta si tu conexión está en otro archivo

async function crearAdmin() {
    const nombres = 'admin';
    const apellidos = 'server';
    const correo_electronico = 'adminserver@purecinemafeel.com';
    const contraseña = 'admin12390';
    const rol = 'admin';

    try {
        const password_hash = await bcrypt.hash(contraseña, 10);

        await pool.execute(
            'INSERT INTO users (nombres, apellidos, correo_electronico, password_hash, rol) VALUES (?, ?, ?, ?,?)',
            [nombres, apellidos, correo_electronico, password_hash, rol]
        );

        console.log('✅ Administrador creado con éxito.');
    } catch (error) {
        console.error('❌ Error al crear administrador:', error.message);
    }
}

crearAdmin();