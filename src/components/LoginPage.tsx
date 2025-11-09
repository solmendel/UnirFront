import { useState } from 'react';
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import logo from 'figma:asset/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';
import { authService, LoginRequest } from '../services/authService';
import { logLogin } from '../services/historyService';

interface LoginPageProps {
  onLogin: (userData?: { email: string; name: string }) => void;
  onShowRegister: () => void;
}

export function LoginPage({ onLogin, onShowRegister }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    mail: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.mail || !formData.password) {
      setError('Email y contraseña son requeridos');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      
      // Guardar sesión
      authService.saveSession(response);
      logLogin(response.usuario.email, 'credentials').catch((err) =>
        console.warn('Error al registrar inicio de sesión:', err)
      );
      
      // Extraer nombre del email
      const name = formData.mail.split('@')[0] || 'Usuario';
      onLogin({ email: formData.mail, name });

    } catch (error: any) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      // Decode the JWT token to get user information
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      // Extract user data from Google response
      const userData = {
        email: decoded.email,
        name: decoded.name || decoded.given_name || decoded.email.split('@')[0]
      };
      
      // Fill in the form fields with Google data
      setFormData({
        mail: userData.email,
        password: ''
      });
      logLogin(userData.name, 'google').catch((err) =>
        console.warn('Error al registrar inicio de sesión con Google:', err)
      );
      
      // Automatically log in with Google data
      onLogin(userData);
    } catch (error) {
      console.error('Error decoding Google credential:', error);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error('Google login failed:', error);
    // You could add a toast notification here if you have a toast system
    alert('Error al iniciar sesión con Google. Por favor, verifica que el Client ID esté configurado correctamente.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fef5f8 0%, #f5fcf0 100%)' }}>
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto">
            <img src={logo} alt="UNIR" className="h-28 mx-auto" />
          </div>
          <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
          <CardDescription>
            Accede a tu plataforma de mensajería unificada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="mail"
                  name="mail"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.mail}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-11"
              style={{ backgroundColor: '#ec6c8c' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Error al iniciar sesión con Google');
            }}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
            locale="es"
          />

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onShowRegister}
              className="text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              ¿No tienes cuenta? Regístrate
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
