import { useState } from 'react';
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import logo from 'figma:asset/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';
import { authService, RegisterRequest } from '../services/authService';

interface RegisterPageProps {
  onRegister: (userData: { email: string; name: string }) => void;
  onBackToLogin: () => void;
}

export function RegisterPage({ onRegister, onBackToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    mail: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    // Validaciones básicas
    if (!formData.mail || !formData.password) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.mail)) {
      setError('El formato del email no es válido');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(formData);

      const session = await authService.login({
        mail: formData.mail,
        password: formData.password,
      });

      setSuccess('¡Usuario registrado exitosamente! Redirigiendo...');

      setTimeout(() => {
        onRegister({
          email: session.user.email,
          name: session.user.name,
        });
      }, 800);
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fef5f8 0%, #f5fcf0 100%)' }}>
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto">
            <img src={logo} alt="UNIR" className="h-28 mx-auto" />
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Únete a la plataforma de mensajería unificada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Registrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta
                </div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={onBackToLogin}
              className="text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

