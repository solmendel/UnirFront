const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// GET /api/history - Obtener historial con filtros opcionales
router.get('/', historyController.getHistory);

// GET /api/history/stats - Obtener estadísticas de acciones
router.get('/stats', historyController.getStats);

// POST /api/history/log - Crear un registro de historial manualmente (desde el frontend)
router.post('/log', historyController.createHistoryEntry);

module.exports = router;

