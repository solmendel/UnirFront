const db = require('../db/database');

/**
 * Crear un nuevo registro de historial
 */
async function createHistory({ user, action, actionType, details, endpoint, method }) {
  const result = await db.runAsync(
    `INSERT INTO history (user, action, action_type, details, endpoint, method) VALUES (?, ?, ?, ?, ?, ?)`,
    [user, action, actionType, details, endpoint || null, method || null]
  );
  return result.insertId;
}

/**
 * Obtener todo el historial con filtros opcionales
 */
async function getHistory({ actionType, user, search, limit, offset }) {
  let sql = `SELECT * FROM history WHERE 1=1`;
  const params = [];

  if (actionType) {
    sql += ` AND action_type = ?`;
    params.push(actionType);
  }

  if (user) {
    sql += ` AND user LIKE ?`;
    params.push(`%${user}%`);
  }

  if (search) {
    sql += ` AND (user LIKE ? OR action LIKE ? OR details LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  sql += ` ORDER BY created_at DESC`;

  if (limit) {
    sql += ` LIMIT ?`;
    params.push(limit);
    if (offset) {
      sql += ` OFFSET ?`;
      params.push(offset);
    }
  }

  const rows = await db.queryAsync(sql, params);
  return rows;
}

/**
 * Obtener estadísticas de acciones por tipo
 */
async function getStatsByActionType() {
  const rows = await db.queryAsync(`
    SELECT action_type, COUNT(*) as count 
    FROM history 
    GROUP BY action_type
  `);
  return rows;
}

/**
 * Eliminar registros antiguos (opcional, para limpieza)
 */
async function deleteOldHistory(daysToKeep = 90) {
  const result = await db.runAsync(
    `DELETE FROM history WHERE created_at < datetime('now', '-${daysToKeep} days')`
  );
  return result.changes;
}

module.exports = {
  createHistory,
  getHistory,
  getStatsByActionType,
  deleteOldHistory
};

