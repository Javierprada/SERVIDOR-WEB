const bcrypt = require('bcryptjs'); // Importa la librería para encriptar contraseñas
const { pool } = require('../config/db'); // Importa el pool de conexiones de la base de datos

class User {
    static async create(nombres, apellidos, correo_electronico, contraseña) {
        try {
            // Encripta la contraseña antes de guardarla en la base de datos
            const password_hash = await bcrypt.hash(contraseña, 10); // El 10 es el costo del salting (rondas de hashing)

            const [result] = await pool.execute(
                'INSERT INTO users (nombres, apellidos, correo_electronico, password_hash) VALUES (?, ?, ?, ?)',
                [nombres, apellidos, correo_electronico, password_hash]
            );
            return result; // Retorna el resultado de la inserción (por ejemplo, el ID del nuevo usuario)
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('username')){
                    throw new Error('El nombre de usuario ya existe');
                } else if (error.message.includes('correo_electronico')){
                    throw new Error('El correo ya esta registrado.');
                }
                throw new Error('Error por duplicidad');
            }
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    }

    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return rows[0]; // Retorna el primer usuario encontrado o undefined si no hay
        } catch (error) {
            throw new Error(`Error al buscar el usuario: ${error.message}`);
        }
    }



    static async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE correo_electronico = ?',
                [email]
            ); 
            return rows[0]; // Devuelve el primer usuario encontrado
        
        } catch (error) {
            console.error('❌ Error al buscar usuario por email:', error);
            throw error;
        }
        
        


    }


    
    

    // Compara una contraseña en texto plano con un hash encriptado
    static async comparePassword(password, password_hash) {
        return await bcrypt.compare(password, password_hash);
    }


    // Obtiene todos los usuarios de la base de datos.
    static async find() {
        try {
            // Consulta para seleccionar todos los usuarios, excluyendo la columna password_hash
            const [rows] = await pool.execute('SELECT id, nombres, apellidos, correo_electronico, rol, created_at FROM users');
            return rows; // Retorna el array de usuarios

        } catch (error){
            //Manejo de errores especifico para este metodo
            throw new Error (`Error al obtener los usuarios: ${error.message}`);
        }
    }

    // Obtiene un usuario específico por su ID.
    static async findById (userId){
        try{
            // Consulta para seleccionar un usuario por su ID, excluyendo la columna password_hash
            const [rows] = await pool.execute('SELECT id, username FROM users WHERE id =?', [userId]);
            return rows [0]; // Retorna el primer usuario encontrado o undefined

        } catch (error){
            // Manejo de errores específico para este método
            throw new Error (`Error al obtener el usuario por ID: ${error.message}`);
        }
    } 


     // Nuevo método para buscar por username o email (28/06/2025)
    static async findByUsernameOrEmail(identifier) {
        const [rows] = await pool.execute (
            'SELECT * FROM users WHERE correo_electronico = ?', [identifier]
        );
        return rows[0]; //Se retorna el primer resultado.
    }

    // Nuevo método para establecer el token de restablecimiento de contraseña (28/06/2025)
    static async setResetPasswordToken(token, expires, userId) {
        try {
            const [result] = await pool.execute (
                // El ? es un marcador de posición que será reemplazado por el token
                //'?' son **placeholders de seguridad**. Previenen ataques de inyección SQL. Los valores reales se pasan en el array posterior.
                'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?', // Primer argumento de consulta
                [token, expires, userId] // Segundo argumento como array
                //Este array contiene los valores que reemplazarán los '?' en la consulta SQL, EN EL MISMO ORDEN.
            );
            return result.affectedRows > 0;

             //Manejo de errores especifico para este metodo
        } catch (error) {
            throw new Error (`Error al establecer el token de restablecimiento: ${error.message}`);
        }


    }


    // Nuevo método para encontrar un usuario por su token de restablecimiento y verificar su expiración
    static async findByResetPasswordToken(token) {
           try {
            // Ejecuta una consulta SQL para buscar el usuario
            const [rows] = await pool.execute(
                // reset_password_expires > NOW() almacena la fecha y hora en que el reset_password_token deja de ser válido (expira).
                'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
                [token]
            );
            return rows [0]; // Retorna el usuario si el token es válido y no ha expirado
        } catch (error) {
            throw new Error (`Error al buscar usuario por token de restablecimiento: ${error.message}`);
        }



    }


    // Nuevo método para actualizar la contraseña de un usuario y limpiar el token
    static async updatePassword (userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash (newPassword, 10);
            const [resul] = await pool.execute (
                'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expire = NULL id = ?',
                [hashedPassword, userId]
            );
            return resul.affectedRows > 0;
        } catch (erro) {
            throw new Error (`Error al actualizar la contraseña: ${error.message} `);
        }


    }


}

module.exports = User;