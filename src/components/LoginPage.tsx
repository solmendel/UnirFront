import { useState } from 'react';
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail } from 'lucide-react';
import logo from '../assets/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';

interface LoginPageProps {
  onLogin: (userData?: { email: string; name: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Extract name from email (part before @)
    const name = email.split('@')[0] || 'Usuario';
    onLogin({ email, name });
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      // Decode the JWT token to get user information
      const decoded: any = jwtDecode(credentialResponse.credential);

      console.log(decoded);
      
      // Extract user data from Google response
      const userData = {
        email: decoded.email,
        name: decoded.name || decoded.given_name || decoded.email.split('@')[0]
      };
      
      // Fill in the form fields with Google data
      setEmail(userData.email);
      setPassword(''); // Don't fill password for security
      
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl h-11"
              style={{ backgroundColor: '#ec6c8c' }}
            >
              Iniciar sesión
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
        </CardContent>
      </Card>
    </div>
  );
}
