const historyModel = require('../models/historyModel');
const jwt = require('jsonwebtoken');

/**
 * Determinar el tipo de acción basado en el endpoint y método
 */
function determineActionType(endpoint, method, body) {
  // Normalizar el endpoint para mejor detección
  const normalizedEndpoint = endpoint.toLowerCase();

  // Detectar autenticación (login/registro)
  if (normalizedEndpoint.includes('auth')) {
    if (normalizedEndpoint.includes('registro') || normalizedEndpoint.includes('register')) {
      return 'user'; // Registro es creación de usuario
    }
    if (normalizedEndpoint.includes('login')) {
      return 'connection'; // Login es una conexión/acceso
    }
  }

  // Detectar tipo de acción según el endpoint
  if (normalizedEndpoint.includes('collaborator') || normalizedEndpoint.includes('user') || normalizedEndpoint.includes('invite')) {
    if (method === 'POST') return 'user';
    if (method === 'PUT') return 'settings';
    if (method === 'DELETE') return 'delete';
  }

  if (normalizedEndpoint.includes('message') || normalizedEndpoint.includes('send')) {
    if (body && (body.content || body.message)) {
      // Verificar si es respuesta automática (tiene template_id o es automático)
      if (body.template_id || body.auto_response) {
        return 'auto-response';
      }
      return 'message';
    }
  }

  if (normalizedEndpoint.includes('connection') || normalizedEndpoint.includes('connect') || normalizedEndpoint.includes('channel')) {
    return 'connection';
  }

  if (normalizedEndpoint.includes('template') || normalizedEndpoint.includes('config')) {
    return 'settings';
  }

  // Por defecto, si es POST o PUT sin clasificación específica
  if (method === 'POST') return 'user';
  if (method === 'PUT') return 'settings';
  
  return 'settings'; // Default
}

/**
 * Generar mensaje de acción legible
 */
function generateActionMessage(endpoint, method, body) {
  const normalizedEndpoint = endpoint.toLowerCase();

  // Detectar autenticación
  if (normalizedEndpoint.includes('auth')) {
    if (normalizedEndpoint.includes('registro') || normalizedEndpoint.includes('register')) {
      return 'Registró usuario';
    }
    if (normalizedEndpoint.includes('login')) {
      return 'Inició sesión';
    }
  }

  if (normalizedEndpoint.includes('collaborator') || normalizedEndpoint.includes('user')) {
    if (method === 'POST' && normalizedEndpoint.includes('invite')) {
      return 'Invitó colaborador';
    }
    if (method === 'PUT') {
      return 'Modificó colaborador';
    }
    if (method === 'DELETE') {
      return 'Eliminó colaborador';
    }
  }

  if (normalizedEndpoint.includes('message') || normalizedEndpoint.includes('send')) {
    if (method === 'POST') {
      return body?.template_id || body?.auto_response ? 'Respuesta automática' : 'Envió mensaje';
    }
  }

  if (normalizedEndpoint.includes('connection') || normalizedEndpoint.includes('connect')) {
    return 'Conectó cuenta';
  }

  if (normalizedEndpoint.includes('template')) {
    if (method === 'POST') return 'Creó plantilla';
    if (method === 'PUT') return 'Modificó plantilla';
    if (method === 'DELETE') return 'Eliminó plantilla';
  }

  // Genérico
  if (method === 'POST') return 'Creó registro';
  if (method === 'PUT') return 'Modificó registro';
  if (method === 'DELETE') return 'Eliminó registro';

  return 'Realizó acción';
}

/**
 * Generar detalles descriptivos de la acción
 */
function generateDetails(endpoint, method, body, params) {
  const normalizedEndpoint = endpoint.toLowerCase();
  let details = '';

  // Detectar autenticación
  if (normalizedEndpoint.includes('auth')) {
    if (normalizedEndpoint.includes('registro') || normalizedEndpoint.includes('register')) {
      const email = body?.mail || body?.email || 'usuario';
      details = `Se registró el usuario ${email}`;
    } else if (normalizedEndpoint.includes('login')) {
      const email = body?.mail || body?.email || 'usuario';
      details = `Inició sesión el usuario ${email}`;
    }
  } else if (normalizedEndpoint.includes('collaborator') || normalizedEndpoint.includes('user')) {
    if (method === 'POST' && body) {
      const role = body.role || 'Colaborador';
      const email = body.email || '';
      const name = body.name || email;
      details = `Invitó a ${name} (${email}) como ${role}`;
    } else if (method === 'PUT' && body) {
      if (body.role) {
        const role = body.role;
        details = `Actualizó rol a ${role}`;
      } else if (body.name || body.email) {
        details = `Actualizó información del colaborador`;
      } else {
        details = `Modificó colaborador`;
      }
    } else if (method === 'DELETE') {
      details = `Eliminó colaborador`;
    }
  } else if (normalizedEndpoint.includes('message') || normalizedEndpoint.includes('send')) {
    if (body) {
      if (body.template_id || body.auto_response) {
        const templateName = body.template_name || 'plantilla';
        details = `Envió plantilla "${templateName}"`;
      } else {
        const to = body.to || body.participant || 'contacto';
        const platform = body.platform || body.channel || '';
        details = `Respondió a ${to}${platform ? ` vía ${platform}` : ''}`;
      }
    }
  } else if (normalizedEndpoint.includes('connection') || normalizedEndpoint.includes('connect')) {
    if (body) {
      const platform = body.platform || body.channel || '';
      const identifier = body.identifier || body.account || '';
      details = `Conectó cuenta de ${platform}${identifier ? ` ${identifier}` : ''}`;
    }
  } else if (normalizedEndpoint.includes('template')) {
    if (method === 'POST' && body) {
      details = `Creó plantilla "${body.name || 'Nueva plantilla'}"`;
    } else if (method === 'PUT' && body) {
      details = `Actualizó plantilla "${body.name || params?.id || ''}"`;
    } else if (method === 'DELETE') {
      details = `Eliminó plantilla ${params?.id || ''}`;
    }
  } else {
    details = `${method} ${endpoint}`;
  }

  return details || 'Sin detalles';
}

/**
 * Decodificar token JWT si está presente
 */
function decodeToken(req) {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer TOKEN
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unir-jwt-secret-key-2025');
        return decoded;
      }
    }
  } catch (err) {
    // Si el token es inválido, simplemente retornar null
    return null;
  }
  return null;
}

/**
 * Obtener nombre de usuario desde el token, body o usar por defecto
 */
function getUserFromRequest(req) {
  // Para login y registro, usar el email del body
  const normalizedEndpoint = req.path.toLowerCase();
  if (normalizedEndpoint.includes('auth')) {
    const email = req.body?.mail || req.body?.email;
    if (email) {
      // Extraer nombre del email
      const name = email.split('@')[0];
      // Capitalizar primera letra
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  // Intentar obtener del usuario decodificado del token (req.usuario del authMiddleware)
  if (req.usuario && req.usuario.mail) {
    const email = req.usuario.mail;
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Si no hay req.usuario, intentar decodificar el token directamente
  const decoded = decodeToken(req);
  if (decoded && decoded.mail) {
    const email = decoded.mail;
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Si hay un header de usuario
  if (req.headers['x-user']) {
    return req.headers['x-user'];
  }

  // Por defecto
  return 'Sistema';
}

/**
 * Middleware para registrar automáticamente las acciones POST y PUT
 */
function logAction(req, res, next) {
  // Solo registrar POST y PUT
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }

  // Excluir solo el endpoint del historial mismo para evitar recursión
  const excludedEndpoints = ['/api/history'];
  const shouldExclude = excludedEndpoints.some(endpoint => req.path.includes(endpoint));
  
  if (shouldExclude) {
    return next();
  }

  // Interceptar cuando la respuesta termine de enviarse
  res.on('finish', async () => {
    // Solo registrar si la acción fue exitosa (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const user = getUserFromRequest(req);
        const actionType = determineActionType(req.path, req.method, req.body);
        const action = generateActionMessage(req.path, req.method, req.body);
        const details = generateDetails(req.path, req.method, req.body, req.params);

        await historyModel.createHistory({
          user,
          action,
          actionType,
          details,
          endpoint: req.path,
          method: req.method
        });

        console.log(`✓ Historial registrado: ${user} - ${action}`);
      } catch (err) {
        // No fallar la request si el registro de historial falla
        console.error('Error al registrar historial:', err);
      }
    }
  });

  next();
}

module.exports = {
  logAction,
  determineActionType,
  generateActionMessage,
  generateDetails
};

