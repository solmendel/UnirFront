// Servicio de autenticación para conectar con el backend de Unir
const API_BASE_URL = 'http://localhost:3001/api/auth';

export interface LoginRequest {
  mail: string;
  password: string;
}

export interface RegisterRequest {
  mail: string;
  password: string;
}

export interface AuthResponse {
  mensaje: string;
  token: string;
  usuario: {
    id: number;
    email: string;
  };
}

export interface RegisterResponse {
  mensaje: string;
  id: number;
  email: string;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Verificar si el token es válido
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Guardar sesión en localStorage
   */
  saveSession(authResponse: AuthResponse): void {
    const sessionData = {
      isLoggedIn: true,
      user: {
        email: authResponse.usuario.email,
        name: authResponse.usuario.email.split('@')[0] || 'Usuario',
        id: authResponse.usuario.id
      },
      token: authResponse.token,
      loginTime: new Date().getTime(),
      expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 horas
    };
    
    localStorage.setItem('unir-session', JSON.stringify(sessionData));
  }

  /**
   * Obtener sesión actual
   */
  getCurrentSession(): any | null {
    try {
      const sessionData = localStorage.getItem('unir-session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Verificar si la sesión no ha expirado
        if (session.expiresAt && new Date().getTime() < session.expiresAt) {
          return session;
        } else {
          // Sesión expirada, limpiar
          localStorage.removeItem('unir-session');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      localStorage.removeItem('unir-session');
      return null;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('unir-session');
  }
}

export const authService = new AuthService();
