// Servicio para notificar al backend SQLite sobre acciones realizadas
const HISTORY_API_URL = (import.meta as any).env.VITE_HISTORY_API_URL;

interface HistoryEntry {
  user: string;
  action: string;
  actionType: 'message' | 'user' | 'settings' | 'delete' | 'auto-response' | 'connection';
  details: string;
  endpoint?: string;
  method?: string;
}

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
    
    const response = await fetch(`${HISTORY_API_URL}/api/history/log`, {
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
export async function logMessageSend(content: string, to?: string, platform?: string): Promise<void> {
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

