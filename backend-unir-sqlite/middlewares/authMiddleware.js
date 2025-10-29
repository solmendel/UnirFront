const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 */
function verificarToken(req, res, next) {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token no proporcionado' 
    });
  }

  try {
    // Verificar el token usando la variable de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar la información del usuario a la request
    req.usuario = decoded;
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Token inválido o expirado' 
    });
  }
}

module.exports = {
  verificarToken
};