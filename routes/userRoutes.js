const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();



    router.get('/', userController.getAllUsers);

    router.get('/:Id', userController.getUserById);



module.exports = router;