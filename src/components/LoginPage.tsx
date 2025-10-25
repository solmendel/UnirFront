import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail } from 'lucide-react';
import logo from 'figma:asset/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
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

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl h-11"
            onClick={onLogin}
          >
            <Mail className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
