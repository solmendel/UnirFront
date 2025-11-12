// Servicio para notificar al backend Core sobre acciones realizadas
import { API_CONFIG } from '../config/api';

const HISTORY_API_BASE = `${API_CONFIG.baseUrl}/api/v1/history`;

interface HistoryEntry {
  user: string;
  action: string;
  actionType: 'message' | 'user' | 'settings' | 'delete' | 'auto-response' | 'connection';
  details: string;
  endpoint?: string;
  method?: string;
}

type LoginMethod = 'credentials' | 'google';

/**
 * Obtener el nombre del usuario desde la sesión
 */
function getUserName(): string {
  try {
    const session = localStorage.getItem('unir-session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.user?.name || 'Usuario';
    }
  } catch {
    // Ignorar errores
  }
  return 'Usuario';
}

/**
 * Registrar una acción en el historial del backend SQLite
 */
export async function logAction(entry: HistoryEntry): Promise<void> {
  try {
    // Usar el nombre del usuario de la sesión si no se proporciona
    const user = entry.user || getUserName();
    
    const response = await fetch(`${HISTORY_API_BASE}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        action: entry.action,
        action_type: entry.actionType,
        details: entry.details,
        endpoint: entry.endpoint || null,
        method: entry.method || 'POST',
      }),
    });

    if (!response.ok) {
      console.warn('No se pudo registrar acción en historial:', await response.text());
    }
  } catch (err) {
    // No fallar la acción principal si el registro de historial falla
    console.warn('Error al registrar historial:', err);
  }
}

/**
 * Helper para registrar el envío de un mensaje
 */
export async function logMessageSend(_content: string, to?: string, platform?: string): Promise<void> {
  await logAction({
    user: getUserName(),
    action: 'Envió mensaje',
    actionType: 'message',
    details: `Respondió a ${to || 'contacto'}${platform ? ` vía ${platform}` : ''}`,
    endpoint: '/api/v1/messages',
    method: 'POST',
  });
}

/**
 * Helper para registrar respuesta automática
 */
export async function logAutoResponse(templateName: string): Promise<void> {
  await logAction({
    user: getUserName(),
    action: 'Respuesta automática',
    actionType: 'auto-response',
    details: `Envió plantilla "${templateName}" a nuevo contacto`,
    endpoint: '/api/v1/messages',
    method: 'POST',
  });
}

export async function logLogin(userIdentifier: string, method: LoginMethod): Promise<void> {
  const userName = userIdentifier || getUserName();
  const details =
    method === 'google'
      ? 'Inicio de sesión con Google'
      : 'Inicio de sesión con correo y contraseña';

  await logAction({
    user: userName,
    action: 'Inicio de sesión',
    actionType: 'connection',
    details,
    endpoint: method === 'google' ? '/auth/google' : '/api/v1/auth/login',
    method: 'POST',
  });
}

