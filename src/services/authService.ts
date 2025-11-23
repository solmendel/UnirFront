// Servicio de autenticación para conectar con el backend de Unir
// Use VITE_AUTH_API_URL if configured, otherwise use the main API URL with /api/auth path
const getAuthApiUrl = (): string => {
  const authUrl = (import.meta as any).env.VITE_AUTH_API_URL;
  if (authUrl) {
    return authUrl;
  }
  const mainApiUrl = (import.meta as any).env.VITE_API_URL;
  return `${mainApiUrl || 'http://localhost:8003'}/api/v1/auth`;
};
const API_BASE_URL = getAuthApiUrl();

export interface LoginRequest {
  mail: string;
  password: string;
}

export interface RegisterRequest {
  mail: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface CoreUserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthSession {
  token: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
    name: string;
  };
  loginTime: number;
  expiresAt: number;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private buildHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildSession(token: string, tokenType: string, user: CoreUserResponse): AuthSession {
    const name = user.username || user.email.split('@')[0] || 'Usuario';
    const now = new Date().getTime();
    return {
      token,
      tokenType,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        name,
      },
      loginTime: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };
  }

  private async fetchCurrentUser(token: string): Promise<CoreUserResponse> {
    const response = await fetch(`${this.baseUrl}/me`, {
      method: 'GET',
      headers: this.buildHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'No se pudo obtener la información del usuario');
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthSession> {
    try {
      const payload = {
        username: credentials.mail,
        password: credentials.password,
      };

      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const tokenData: TokenResponse = await response.json();
      const user = await this.fetchCurrentUser(tokenData.access_token);
      const session = this.buildSession(tokenData.access_token, tokenData.token_type, user);
      this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<CoreUserResponse> {
    try {
      const username = userData.mail.split('@')[0]?.replace(/[^a-zA-Z0-9_.-]/g, '') || userData.mail;
      const payload = {
        username,
        email: userData.mail,
        password: userData.password,
      };

      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al registrar usuario');
      }

      return response.json();
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: this.buildHeaders(token),
      });
      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem('unir-session', JSON.stringify(session));
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const sessionData = localStorage.getItem('unir-session');
      if (sessionData) {
        const session: AuthSession = JSON.parse(sessionData);
        
        // Check if session hasn't expired locally
        if (session.expiresAt && new Date().getTime() >= session.expiresAt) {
          localStorage.removeItem('unir-session');
          return null;
        }

        // If it's a Google login token (starts with "google_"), skip backend verification
        // Google sessions are local-only but persist across browser restarts
        if (session.token && session.token.startsWith('google_')) {
          return session; // Return Google session without backend verification
        }

        // Verify token is still valid on the server (for normal login sessions)
        if (session.token) {
          const isValid = await this.verifyToken(session.token);
          if (isValid) {
            return session;
          } else {
            // Token is invalid, remove session
            localStorage.removeItem('unir-session');
            return null;
          }
        }
        
        // No token in session, remove it
        localStorage.removeItem('unir-session');
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      localStorage.removeItem('unir-session');
      return null;
    }
  }

  async loginWithGoogle(googleToken: string, userData: { email: string; name: string }): Promise<AuthSession> {
    try {
      const username = userData.email.split('@')[0]?.replace(/[^a-zA-Z0-9_.-]/g, '') || userData.email;
      const now = new Date().getTime();
      
      // Create a persistent session for Google login
      // The token starts with "google_" so we know it's a Google session
      const sessionId = `google_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const session: AuthSession = {
        token: sessionId,
        tokenType: 'Bearer',
        user: {
          id: 0,
          email: userData.email,
          username: username,
          role: 'colaborador',
          name: userData.name,
        },
        loginTime: now,
        expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours - persist for 24 hours
      };
      
      // Save session to localStorage so it persists across browser restarts
      this.saveSession(session);
      
      // Verify it was saved correctly by reading directly from localStorage
      const savedData = localStorage.getItem('unir-session');
      if (!savedData) {
        throw new Error('Error al guardar la sesión en localStorage');
      }
      
      return session;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('unir-session');
  }
}

export const authService = new AuthService();
