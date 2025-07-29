const { pool: db } = require('../config/db'); // Ahora 'db' es directamente el pool, y tiene el método .query()
const Subscription = require('../models/Subscription'); // Importa el modelo de suscripción

/**
 * Suscribe a un usuario al plan básico.
 * @param {object} req - El objeto de solicitud HTTP.
 * @param {object} res - El objeto de respuesta HTTP.
 */
const subscribeBasic = async (req, res) => { // Permite a un usuario suscribirse al plan "Básico". Inserta o actualiza el registro del usuario en la tabla subscriptions de DB.
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "El 'userId' es requerido para la suscripción al plan básico." });
    }

    try {
        // Aqui se verifica si el usuario ya está suscrito y se actualiza o inserta el estado de su suscripción en la DB.
        const plan = 'Basico';
        // Usar el modelo de suscripción para crear o actualizar 
        await Subscription.createOrUpdate(userId, plan, 'Activo'); // Este es el metodo del modelo Subscription.js

        console.log(`Usuario ${userId} se ha suscrito al plan Básico.`);
        res.status(200).json({ message: "Suscripción al Plan Básico confirmada.", userId, plan });
    } catch (error) {
        console.error('Error al suscribir al plan Básico:', error);
        res.status(500).json({ error: "Error interno del servidor al procesar la suscripción." });
    }
};

/**
 * Suscribe a un usuario al plan premium.
 * @param {object} req - El objeto de solicitud HTTP.
 * @param {object} res - El objeto de respuesta HTTP.
 */
const subscribePremium = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "El 'userId' es requerido para la suscripción al plan premium." });
    }

    try {
        const plan = 'Premium';
        // Se usa el modelo Suscripcion para crear o actualizar 
        await Subscription.createOrUpdate(userId, plan, 'Activo'); // Este es el metodo del modelo Subscription.js

        console.log(`Usuario ${userId} se ha suscrito al plan Premium.`);
        res.status(200).json({ message: "Suscripción al Plan Premium confirmada.", userId, plan });
    } catch (error) {
        console.error('Error al suscribir al plan Premium:', error);
        res.status(500).json({ error: "Error interno del servidor al procesar la suscripción." });
    }
};

/**
 * Obtiene el estado de suscripción de un usuario.
 * @param {object} req - El objeto de solicitud HTTP (userId viene en parametros).
 * @param {object} res - El objeto de respuesta HTTP.
 */
const getSubscriptionStatus = async (req, res) => { // Recupera y devuelve el estado de la suscripción (plan y estado) para un userId dado.
    const { userId } = req.params; 

    if (!userId) {
        return res.status(400).json({ error: "El 'userId' es requerido para obtener el estado de la suscripción." });
    }

    try {
        const subscription = await Subscription.findByUserId(userId);

        if (!subscription) {
            return res.status(404).json({ message: "Usuario no encontrado o sin suscripción activa." });
        }

        
        res.status(200).json({ userId, plan: subscription.plan_name, status: subscription.status });
    } catch (error) {
        console.error('Error al obtener el estado de suscripción:', error);
        res.status(500).json({ error: "Error interno del servidor al obtener el estado de la suscripción." });
        }
};

/**
 * Cancela la suscripción de un usuario.
 * @param {object} req - El objeto de solicitud HTTP.
 * @param {object} res - El objeto de respuesta HTTP.
 */
const cancelSubscription = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "El 'userId' es requerido para cancelar la suscripción." });
    }

    try {
        // Se podra cambiar el estado a 'Cancelado' o 'Inactivo'
        const deleted = await Subscription.deleteByUserId(userId); // Este es el metodo del modelo Subscription.js

        if (!deleted) {
            return res.status(404).json({ message: "Suscripción no encontrada para el usuario especificado." });
        }

        console.log(`Suscripción del usuario ${userId} ha sido cancelada.`);
        res.status(200).json({ message: "Suscripción cancelada exitosamente.", userId });
    } catch (error) {
        console.error('Error al cancelar la suscripción:', error);
        res.status(500).json({ error: "Error interno del servidor al cancelar la suscripción." });
    }
};

/** 
 *Actualiza el plan de suscripción de un usuario.
 * Permite cambiar de plan Básico a Premium o viceversa.
 * @param {Object} req - // Objeto de solicitud HTTP
 * @param {Object} res - // Objeto de solicitud HTTP
 */

const updatedSubscriptionPlan = async (req, res) => {
     try {
    const { userId, newPlanName } = req.body;
    
    if (!userId || !newPlanName) {
         return res.status(400).json({error: "El 'userId' y 'newPlanName' son requeridos para actualizar la suscripción."});
        }
    

 // Opcional: Validación para asegurar que el nuevo PlanName es un plan válido
    const validPlans = ['Basico', 'Premium'];
    if (!validPlans.includes(newPlanName)) {
        return res.status(400).json({ error: `El 'newPlanName' proporcionado no es un plan válido. Los planes permitidos son ${validPlans.join(' y ')}.` });
    }


    const result = await Subscription.createOrUpdate(userId, newPlanName, 'Activo');
     // Se puede validar si se encontró una suscripción antes de la actualización
    const existingSubscription = await Subscription.findByUserId(userId);
    // Lógica para determinar el mensaje de respuesta basado en si se creó o actualizó:
    if (!existingSubscription) {
      // Si la suscripción NO existía antes (fue creada por createOrUpdate)
      return res.status(200).json({ message: `Suscripción creada/actualizada a ${newPlanName} exitosamente.`, userId, newPlanName });

   } else {
      // Si la suscripción SÍ existía antes (fue actualizada por createOrUpdate)
      return res.status(200).json({
        message: `Plan de suscripción actualizado a ${newPlanName} exitosamente.`,
        userId,
        newPlanName
      });
    }



}catch (error) {
    // 4. Manejo de errores generales (errores de base de datos, errores inesperados)
    console.error('Error al actualizar el plan de suscripción:', error);
    return res.status(500).json({ error: "Error interno del servidor al actualizar el plan de suscripción." });
    };
}
    


/**
 * Obtiene todos los planes de suscripción disponibles.
 * Esto es para que el frontend pueda mostrar las opciones.
 * @param {object} req - El objeto de solicitud HTTP.
 * @param {object} res - El objeto de respuesta HTTP.
 */
const getAllAvailablePlans = async (req, res) => {
    try {
        // Ejemplo: Obtener planes de una base de datos
        // const availablePlans = await Plan.find({});
        // O si usas un ORM como Sequelize:
        // const availablePlans = await Plan.findAll();

        // Por ahora, tu código está bien si es estático:
        const availablePlans = [
             { id: 1, name: 'Basico', description: 'Acceso básico con resolución 1080p', price: 9.99, features: ['1 pantalla simultánea', '3 perfiles', '1080p', 'No Audio Envolvente'] },
             { id: 2, name: 'Premium', description: 'Acceso completo con 4K y HDR', price: 15.99, features: ['5 pantallas simultáneas', '5 perfiles', '4K + HDR', 'Audio Envolvente'] }
        ];

        res.status(200).json({ success: true, data: availablePlans });

    } catch (error) {
        console.error('Error al obtener los planes disponibles:', error);
        res.status(500).json({ error: "Error interno del servidor al obtener los planes disponibles." });
    }
};






module.exports = {
    subscribeBasic,
    subscribePremium,
    getSubscriptionStatus,
    cancelSubscription,
    updatedSubscriptionPlan,
    getAllAvailablePlans
};