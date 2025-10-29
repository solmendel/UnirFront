const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear/conectar a la base de datos SQLite
const dbPath = path.join(__dirname, '../unir.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ Error al conectar a SQLite:', err.message);
  } else {
    console.log('✓ Conexión a SQLite exitosa');
    inicializarTablas();
  }
});

// Crear tablas si no existen
function inicializarTablas() {
  // Tabla de usuarios del login
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mail TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      activo INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error al crear tabla usuarios:', err.message);
    } else {
      console.log('✓ Tabla usuarios lista');
    }
  });

  // Tabla de colaboradores (para UNIR)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'collaborator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error al crear tabla users:', err.message);
    } else {
      console.log('✓ Tabla users lista');
    }
  });
}

// Promisificar las consultas para usar async/await
db.queryAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, changes: this.changes });
    });
  });
};

module.exports = db;
