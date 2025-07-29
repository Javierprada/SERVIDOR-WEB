const {pool} = require('../config/db');


const payment = {
    create: async (paymentData) => {
        const {user_id, id_transaccion, id_metodo_pago, monto, divisa, descripcion, status} = paymentData;
        
        const query = 'INSERT INTO payments (user_id, id_transaccion, id_metodo_pago, monto, divisa, descripcion, status) VALUES (?,?,?,?,?,?,?)';
        
        const result = await pool.execute(query, [user_id, id_transaccion, id_metodo_pago, monto, divisa, descripcion, status]);
        
        return result; // Devuelve el resultado de la inserción            
                    
                    
                    
                    
    }





};

module.exports = payment;