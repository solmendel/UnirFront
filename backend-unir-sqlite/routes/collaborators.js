const express = require("express");
const router = express.Router();
const db = require("../db/database");

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'collaborator',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Obtener todos los colaboradores
router.get("/", async (req, res) => {
  try {
    const rows = await db.queryAsync(`
      SELECT id, name, email, role, created_at FROM collaborators ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener colaboradores" });
  }
});

// Crear colaborador
router.post("/invite", async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO collaborators (name, email, role) VALUES (?, ?, ?)`,
      [name, email, role || "collaborator"]
    );

    const [newCollab] = await db.queryAsync(
      `SELECT * FROM collaborators WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(newCollab);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear colaborador" });
  }
});

// Actualizar rol
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    await db.runAsync(`UPDATE collaborators SET role = ? WHERE id = ?`, [
      role,
      id,
    ]);
    const [updated] = await db.queryAsync(
      `SELECT * FROM collaborators WHERE id = ?`,
      [id]
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar colaborador" });
  }
});

// Eliminar colaborador
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.runAsync(`DELETE FROM collaborators WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar colaborador" });
  }
});

module.exports = router;
