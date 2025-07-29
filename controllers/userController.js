const User = require('../models/User');
const userController = {

    async getAllUsers(req, res) {
        try {
            const users = await User.find();
            // Envía una respuesta exitosa con los datos de los usuarios
            res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente.',
            data: users
            });
        } catch (error) {
            //Manejo de errores
            console.error ('Error al obtener todos los usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor al intentar obtener los usuarios.', 
                error: error.message
            });

        }
    },

    async getUserById(req, res) {
        try {
            const userId = req.params.id; // Captura el ID del parámetro de la URL

            // Lógica para consultar y devolver un usuario específico de la base de datos por ID

            const user = await User.findById(userId)

            // Si el usuario no es encontrado
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: `Usuario con ID ${userId} no encontrado.`
                });
            }

            // Envía una respuesta exitosa con los datos del usuario encontrado
            res.status(200).json({
                success: true,
                message: `Usuario con ID ${userId} Obtenido exitosamente.`,
                data: user
            });

        } catch (error){
            // Manejo de errores
            console.error (`Error al obtener usuario por ID ${req.params.id}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al intentar obtener el usuario.',
                error: error.message
            });
        }
    },



};

module.exports = userController;