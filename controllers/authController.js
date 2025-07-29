require ('dotenv').config(); //Importa las variables de entorno almacenadas 
const crypto = require('crypto'); // Genera tokens seguros
const jwt = require('jsonwebtoken');
const secret = process.env.TWT_SECRET || 'ultra_secreta'
const User = require('../models/User'); // Importa el modelo de usuario

const nodemailer = require('nodemailer');

const authController = {
    async register(req, res) {
        // Normalizar las claves de red.bdy a minusculas
        const normalizedBody = {};
        for (const key in req.body){
            normalizedBody[key.toLowerCase()] = req.body[key];
        }

        const { nombres, apellidos, correo_electronico, contraseña } = normalizedBody; // Obtiene el nombre de usuario y la contraseña del cuerpo de la solicitud

        // Validación básica
        if (!nombres || !apellidos || !correo_electronico || !contraseña) {
            return res.status(400).json({ message: 'Todos los campos (nombres, apellidos, correo_electronico, contraseña) son requeridos' });
        }

        try {
            // Intenta crear el usuario usando el modelo User
            const result = await User.create(nombres, apellidos, correo_electronico, contraseña,);
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
        } catch (error) {
            if (error.message === 'El nombre de usuario ya existe.' || error.message === 'El correo electronico ya esta registrado') {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            console.error('Error en el registro:', error);
            res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
        }
    },

    async login(req, res) {
        const { email, password } = req.body; // Obtiene el email y la contraseña del cuerpo de la solicitud

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({ message: 'Nombre de usuario y contraseña son requeridos. ⚠' });
        }


            



            try {
                // Busca el usuario por nombre de usuario
                const user = await User.findByEmail(email);
                console.log('👤 Usuario encontrado:', user);

                if (!user) {
                    return res.status(401).json({ message: 'Credenciales inválidas. ❌' }); // 401 Unauthorized
                }

                // Compara la contraseña proporcionada con el hash almacenado
                const isMatch = await User.comparePassword(password, user.password_hash);
                console.log('🔑 Contraseña válida:', isMatch);

                if (!isMatch) {
                    return res.status(401).json({ message: 'Credenciales inválidas. ❌' }); // 401 Unauthorized
                }


                // Validación de rol
                if (user.rol !== 'admin') {
                    return res.status(403).json({message: 'Acceso ¡No! autorizado. Solo administradores ⚠'});
                }



                // Generar token JWT
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.nombres,
                        rol: user.rol,
                        correo: user.correo_electronico
                    },

                    secret,
                    {expiresIn: '2h'} // Duración del token, suficiente para cargar las movies.
                );


                // Enviar token al frontend junto con información 'util.
                return res.status(200).json({
                    message: 'Has iniciado sesión como ADMINISTRADOR ✅',
                    token,
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    correo: user.correo_electronico,
                    rol: user.rol
                    

                });



            

                
                

            } catch (error) {
                console.error('❌ Error en el inicio de sesión:', error);
            return res.status(500).json({ message: '❌ Error interno del servidor al iniciar sesión.' });
            }


        
    
        },
    
    





    // Nuevas funciones 28/06/2025
    // Olvido contraseña.
    async forgotPassword(req, res) {
        const { correo_electronico } = req.body;
        // Validación: Asegura que el correo electrónico esté presente
        if (!correo_electronico) {
            return res.status(400).json({message: 'Se requiere el correo para el restablecer la contraseña.'});

        }
         try {
        // Busca al usuario por correo electrónico (o nombre de usuario si tu método lo permite)
           const user = await User.findByEmail(correo_electronico);
        
        // PRUEBAS.
        console.log('DEBUG (User lookup): Resultado completo de user:', user); // Muestra todo el objeto user
        if (user) {
            console.log('DEBUG (User lookup): Valor de user.email:', user.correo_electronico); // Muestra solo la propiedad email
        } else {
            console.log('DEBUG (User lookup): Usuario NO encontrado en la base de datos para el email:', correo_electronico);
        }
       

           // Cambio clave
            if (user) {
              
                console.log('Usuario encontrado:', user); // Verifica si tiene correo_electronico
             
                // Genera un token aleatorio seguro (32 bytes = 64 caracteres hexadecimales)
                const resetToken = crypto.randomBytes(32).toString('hex');
                //Tiempo de expiración del token, se ha definido 15 min
                const expires = new Date(Date.now() + 900000); // Son 15 min en milisegundos
                // Guarda el token y la expiración en la base de datos
                await User.setResetPasswordToken(user.id, resetToken, expires);



                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com', // SMTP host para el gmail
                    port: 465, // Puerto SMTP seguro para SSL/TLS
                    secure: true, // Usa SSL/TLS (true para puerto 465, false para otros como 587)

                    auth:{
                        user: process.env.SENDING_EMAIL,
                        pass: process.env.EMAIL_PASS
                    }
                });

                console.log('DEBUG (Nodemailer): Intentando enviar correo con usuario:', process.env.SENDING_EMAIL);
                console.log('DEBUG (Nodemailer): Usando host:', transporter.options.host, 'y puerto:', transporter.options.port);


                // Definir las opciones de correo electronico

                const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`; // <=== Se usa template literals para insertar variables
                const mailOptions = {
                    from: process.env.SENDING_EMAIL,       // Quien envia el correo.
                    to: user.correo_electronico,                       // A quien se le envia el correo.
                    subject: 'Restablecimiento de contraseña - Pure Cinema Feel',
                    html:`
                        <p>Estimado usuario,</p>
                        <p>Has solicitado restablecimiento de contraseña de tu cuenta pure_cinema_feel</p>
                        <p>Por favor haga clic en el siguiente enlace <a href="${resetLink}">Restablecer contraseña</a></p>
                        <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo. ⚠</p>
                    
                        `
            
                };
            
            // 3. Enviar el correo elctronico, se usa await para esperar a que el correo se envíe.
            await transporter.sendMail(mailOptions);
            console.log(`[DEBUG] (Nodemailer): Correo de restablecimiento enviado exitosamente a ${user.correo_electronico} con enlace: ${resetLink}`);
             // Una vez que el correo se ha intentado enviar (o ha fallado dentro del 'try'), envía la respuesta al cliente.
            return res.status(200).json({message:'Si el correo electronico existe se ha enviado, un enlace de restablecimiento. ✉'});
         


            
            } else {
                return res.status(200).json({message:'Si el correo electronico existe se ha enviado, un enlace de restablecimiento. ✉' });
            }
           


            
            
       } catch (error){
        console.error('Error (Nodemailer): Error al enviar el correo ❌', error);
        // Un log específico si el error es del envío de correo.
        if (error.code === 'EENVELOPE' || error.responseCode) {
            console.error ('Error al enviar el correo con nodemailer:', error.message);
        }

        return res.status(500).json({message: 'Error interno del servidor al solicitar restablecimiento de contraseña. ❌'});
       }

        
    },






    // Cambiar contraseña.
    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token y nueva contraseña son requeridos. ⚠' });
        }

        try {
            // Busca al usuario por el token y verifica la expiración
            const user = await User.findByPasswordResetToken(token);

            if (!user) {
                return res.status(400).json({ message: 'Token de restablecimiento inválido o expirado. 🔴' });
            }

            // Actualiza la contraseña del usuario y limpia el token
            const passwordUpdated = await User.updatePassword(user.id, newPassword);

            if (passwordUpdated) {
                return res.status(200).json({ message: 'Contraseña restablecida exitosamente. ✅' });
            } else {
                return res.status(500).json({ message: 'No se pudo actualizar la contraseña. ❌' });
            }

        } catch (error) {
            console.error('Error en resetPassword:', error);
            return res.status(500).json({ message: 'Error interno del servidor al restablecer la contraseña. ❌' });
        }
    }


};

module.exports = authController;