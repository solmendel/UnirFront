const db = require('../db/database');

/**
 * Crear un nuevo usuario
 */
async function createUsuario({ mail, password }) {
  const result = await db.runAsync(
    `INSERT INTO usuarios (mail, password) VALUES (?, ?)`,
    [mail, password]
  );
  return result.insertId;
}

/**
 * Buscar un usuario por email
 */
async function getUsuarioPorMail(mail) {
  const rows = await db.queryAsync(
    `SELECT * FROM usuarios WHERE mail = ? AND activo = 1`,
    [mail]
  );
  return rows[0];
}

/**
 * Obtener todos los usuarios con filtros opcionales
 */
async function getUsuarios({ mail, activo }) {
  let sql = `SELECT id, mail, activo FROM usuarios WHERE 1=1`;
  const params = [];

  if (mail) {
    sql += ` AND mail LIKE ?`;
    params.push(`%${mail}%`);
  }

  if (activo !== undefined) {
    sql += ` AND activo = ?`;
    params.push(activo === 'true' ? 1 : 0);
  }

  const rows = await db.queryAsync(sql, params);
  return rows;
}

/**
 * Actualizar un usuario
 */
async function updateUsuario(id, campos) {
  const columnas = [];
  const valores = [];

  for (const [key, value] of Object.entries(campos)) {
    columnas.push(`${key} = ?`);
    valores.push(value);
  }

  if (columnas.length === 0) return false;

  const sql = `UPDATE usuarios SET ${columnas.join(', ')} WHERE id = ?`;
  valores.push(id);

  const result = await db.runAsync(sql, valores);
  return result.changes > 0;
}

/**
 * Eliminar (lógicamente) un usuario
 */
async function deleteUsuario(id) {
  const result = await db.runAsync(
    `UPDATE usuarios SET activo = 0 WHERE id = ?`,
    [id]
  );
  return result.changes > 0;
}

module.exports = {
  createUsuario,
  getUsuarioPorMail,
  getUsuarios,
  updateUsuario,
  deleteUsuario
};
