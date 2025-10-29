const express = require('express');
const cors = require('cors');
// require('dotenv').config(); // Comentado para evitar problemas con .env

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificar conexión a la base de datos
require('./db/database');

// Rutas
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Unir - Sistema de Autenticación',
    version: '1.0.0'
  });
});

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Endpoint para ver usuarios (solo para desarrollo)
app.get('/api/usuarios', async (req, res) => {
  try {
    const db = require('./db/database');
    const usuarios = await db.queryAsync('SELECT id, mail, activo FROM usuarios ORDER BY id');
    
    res.json({
      total: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada' 
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor' 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/`);
});

module.exports = app;
