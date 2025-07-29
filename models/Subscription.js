const { pool } = require('../config/db');

//Método para crear o actualizar una suscripción
//Este método es flexible para manejar tanto la primera suscripción como el cambio de plan
class Subscription {
    static async createOrUpdate(userId, planName, status = 'Activo') {
        try {
            const query = `INSERT INTO subscriptions (user_id, plan_name, status) VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name), status = VALUES(status), updated_at = CURRENT_TIMESTAMP`;
                const [result] = await pool.execute (query, [userId, planName, status]); 
                return result;
        } catch (error) {
            throw new Error (`Error al crear o actualizar la suscripción ${error.message}`);
        }
    }



 //Método para obtener una suscripción por userId
 static async findByUserId (userId) {
    try{
        const [row] = await pool.execute ('SELECT id, user_id, plan_name, status, created_at, updated_at FROM subscriptions WHERE user_id = ?', [userId]);
        return row [0]; // Retorna la suscripción encontrada o undefined

    } catch (error) {
        throw new Error (`Error al buscar suscripción por ID de usuario: ${error.message}`);
    }
 } 


 // Método para cancelar una suscripción o (Sencillamente cambiar el estado de 'INACTIVO' / 'CANCELADO')
 // Por simplicidad, el controlador actual usara DELETE, pero se prefiere cambiar status
 static async deleteByUserId (userId) {
    try {
        const [result] = await pool.execute ('DELETE FROM subscriptions WHERE user_id = ?', [userId]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error (`Error al eliminar la suscripción ${error.message}`);
    }
 }



}

module.exports = Subscription;