const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/registro - Registrar un nuevo usuario
router.post('/registro', authController.registrar);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

module.exports = router;
