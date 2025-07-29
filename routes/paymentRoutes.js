const express = require('express');
const processPayment  = require('../controllers/processPayment'); // Importa el controlador 

const router = express.Router();

// Define la ruta POST para procesar pagos
router.post('/process-payment', processPayment);

module.exports = router;