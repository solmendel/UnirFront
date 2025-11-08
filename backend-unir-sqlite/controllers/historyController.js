const historyModel = require('../models/historyModel');

/**
 * Obtener todo el historial con filtros opcionales
 */
async function getHistory(req, res) {
  try {
    const { actionType, user, search, limit, offset } = req.query;
    
    const history = await historyModel.getHistory({
      actionType,
      user,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });

    // Formatear la respuesta para coincidir con el formato esperado por el frontend
    const formattedHistory = history.map(entry => {
      const date = new Date(entry.created_at);
      
      // Formato de fecha: "25 Oct 2025" (sin padding en el día)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate(); // Sin padding, ej: 25 no 025
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;
      
      // Formato de hora: "14:30"
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      return {
        id: entry.id.toString(),
        date: formattedDate,
        time: formattedTime,
        user: entry.user,
        action: entry.action,
        actionType: entry.action_type,
        details: entry.details
      };
    });

    res.json(formattedHistory);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
}

/**
 * Obtener estadísticas de acciones
 */
async function getStats(req, res) {
  try {
    const stats = await historyModel.getStatsByActionType();
    res.json(stats);
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

/**
 * Crear un registro de historial manualmente (desde el frontend)
 */
async function createHistoryEntry(req, res) {
  try {
    const { user, action, action_type, details, endpoint, method } = req.body;

    if (!user || !action || !action_type || !details) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: user, action, action_type, details' 
      });
    }

    const historyId = await historyModel.createHistory({
      user,
      action,
      actionType: action_type,
      details,
      endpoint: endpoint || null,
      method: method || 'POST'
    });

    res.status(201).json({ 
      id: historyId,
      message: 'Historial registrado exitosamente' 
    });
  } catch (err) {
    console.error('Error al crear registro de historial:', err);
    res.status(500).json({ error: 'Error al crear registro de historial' });
  }
}

module.exports = {
  getHistory,
  getStats,
  createHistoryEntry
};

