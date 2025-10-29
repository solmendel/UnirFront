const usuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registrar un nuevo usuario
 */
async function registrar(req, res) {
  try {
    const { nombre, password } = req.body;

    // Validar que se envíen los campos requeridos
    if (!nombre || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nombre)) {
      return res.status(400).json({ 
        error: 'El formato del email no es válido' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await usuariosModel.getUsuarioPorNombre(nombre);
    if (usuarioExistente) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hashear la contraseña
    const passwordHasheada = await bcrypt.hash(password, 10);

    // Crear el usuario
    const nuevoId = await usuariosModel.createUsuario({
      nombre,
      password: passwordHasheada
    });

    res.status(201).json({ 
      mensaje: 'Usuario registrado exitosamente',
      id: nuevoId,
      email: nombre
    });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ 
      error: 'Error al registrar el usuario' 
    });
  }
}

/**
 * Login de usuario
 */
async function login(req, res) {
  try {
    const { nombre, password } = req.body;

    // Validar que se envíen los campos requeridos
    if (!nombre || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar el usuario por email
    const usuario = await usuariosModel.getUsuarioPorNombre(nombre);

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar la contraseña
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar el token JWT usando la variable de entorno
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nombre: usuario.nombre 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.nombre
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
}

module.exports = {
  registrar,
  login
};