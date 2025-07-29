const payment = require('../models/payment'); // Importa el modelo payment.js


const processPayment = async (req, res) => {
    console.log('Entrando a processPayment');
    console.log('Cuerpo de la solicitud (req.body):', req.body);
    try {
        // Aquí iría la lógica para interactuar con la pasarela de pagos
        

        const { user_id, id_metodo_pago, monto, divisa, descripcion } = req.body;

        // ***** No se debe manejar CREDIT CARD aqui directamente *****
        // Se debe usar una SDK de pasarela de pago que tokenice la información en el frontend
        // y aquí solo se recibe el token.

        console.log(`Procesando pago: ${monto} ${divisa} con método ${id_metodo_pago}`);

        // Simulación de interacción con una pasarela de pago
        // Caso real, se haría una llamada a la API de Stripe, PayU, Nequi.
        // --- CAMBIO AQUÍ: Generar un id_transaccion único para cada prueba ---
        const uniqueTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const paymentGatewayResponse = {
            status: 'success',
            id_transaccion: uniqueTransactionId,
            message: 'Pago procesado exitosamente.'
        };

        if (paymentGatewayResponse.status === 'success') {
            try {
                const newPayment = await payment.create ({
                    user_id: user_id,
                    id_transaccion: paymentGatewayResponse.id_transaccion,
                    id_metodo_pago: id_metodo_pago,
                    monto: monto,
                    divisa: divisa,
                    descripcion: descripcion,
                    status: 'success' 
                    
                });

                res.status(200).json({
                    success: true,
                    message: 'Pago procesado y registrado exitosamente.',
                    id_transaccion: paymentGatewayResponse.id_transaccion,
                    paymentRecordId: newPayment.insertId
                });

                
            } catch (dbError) {
                console.error('Error al guardar el pago en la BD MySQL:', dbError);
                res.status(500).json({success: false, message: 'Error al registrar el pago después de la aprobación de la pasarela de pagos.', error: dbError.message});
        
            } 
        
        
        } else {
            // Este else es por si la pasarela de pagos indica un FALLO.
            res.status(400).json({ success: false, message: 'El pago fue rechazado por la pasarela de pagos.', error: paymentGatewayResponse.message });
        } 
             } catch (error) {
                console.error('Error en el proceso de pago:', error);
                res.status(500).json({ success: false, message: 'Error interno del servidor durante el pago.', error: error.message });
            }
    
};

module.exports = processPayment;