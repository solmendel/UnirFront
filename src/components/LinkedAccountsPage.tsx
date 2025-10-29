import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Instagram, Mail, MessageCircle, CheckCircle2, XCircle, Link2, AlertCircle, Award } from 'lucide-react';

interface LinkedAccount {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'gmail';
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  accountName?: string;
  connectedDate?: string;
  messagesCount?: number;
}

export function LinkedAccountsPage() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([
    {
      id: '1',
      platform: 'whatsapp',
      name: 'WhatsApp Business',
      icon: <MessageCircle className="h-12 w-12" />,
      color: '#25d366',
      connected: true,
      accountName: '+52 555 123 4567',
      connectedDate: '15 Mar 2025',
      messagesCount: 380
    },
    {
      id: '2',
      platform: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-12 w-12" />,
      color: '#e4405f',
      connected: true,
      accountName: '@unir_oficial',
      connectedDate: '10 Feb 2025',
      messagesCount: 245
    },
    {
      id: '3',
      platform: 'gmail',
      name: 'Gmail',
      icon: <Mail className="h-12 w-12" />,
      color: '#ea4335',
      connected: false,
      messagesCount: 0
    },
  ]);

  const handleToggleConnection = (accountId: string) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === accountId
          ? {
              ...account,
              connected: !account.connected,
              accountName: account.connected ? undefined : 'Cuenta conectada',
              connectedDate: account.connected ? undefined : new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            }
          : account
      )
    );
  };

  const connectedCount = accounts.filter(a => a.connected).length;
  const totalMessages = accounts.reduce((sum, a) => sum + (a.messagesCount || 0), 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 border-b bg-white/80 backdrop-blur-sm px-4 md:px-6 py-4">
        <div>
          <h2>Cuentas Vinculadas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecta y administra tus plataformas de mensajería
          </p>
        </div>
      </div>

      {/* Contenedor con padding-top para compensar el header */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6 pb-6">
          {/* Card invisible para compensar el header fijo */}
          <div className="pt-32" style={{ minHeight: 'auto' }}>
            <div className="border-none shadow-sm bg-white/80 backdrop-blur-sm" style={{ minHeight: 'auto', opacity: 0, pointerEvents: 'none' }}>
              <div className="p-3" style={{ padding: '0.75rem', minHeight: 'auto' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Card de Prueba</p>
                    <h3 className="mt-1">999</h3>
                  </div>
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#f59e0b20' }}>
                    <div className="h-5 w-5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plataformas Conectadas</p>
                    <h3 className="mt-2">{connectedCount} de {accounts.length}</h3>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#acce6020' }}>
                    <Link2 className="h-6 w-6" style={{ color: '#acce60' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensajes Totales</p>
                    <h3 className="mt-2">{totalMessages}</h3>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#ec6c8c20' }}>
                    <MessageCircle className="h-6 w-6" style={{ color: '#ec6c8c' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estado General</p>
                    <h3 className="mt-2">
                      {connectedCount === accounts.length ? 'Completo' : 'Parcial'}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#6366f120' }}>
                    {connectedCount === accounts.length ? (
                      <CheckCircle2 className="h-6 w-6" style={{ color: '#6366f1' }} />
                    ) : (
                      <AlertCircle className="h-6 w-6" style={{ color: '#f59e0b' }} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plataformas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                <div 
                  className="h-2" 
                  style={{ backgroundColor: account.connected ? account.color : '#d1d5db' }}
                />
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-2xl" style={{ backgroundColor: `${account.color}15` }}>
                    <div style={{ color: account.color }}>
                      {account.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{account.name}</CardTitle>
                  <CardDescription>
                    {account.connected ? account.accountName : 'No conectado'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estado */}
                  <div className="flex items-center justify-center">
                    <Badge 
                      variant="outline" 
                      className="rounded-full gap-2 px-4 py-1"
                      style={{ 
                        borderColor: account.connected ? '#acce60' : '#ef4444',
                        color: account.connected ? '#acce60' : '#ef4444'
                      }}
                    >
                      {account.connected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Conectado
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Desconectado
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Información adicional */}
                  {account.connected && (
                    <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-pink-50/50 to-green-50/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Conectado desde:</span>
                        <span>{account.connectedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mensajes procesados:</span>
                        <span style={{ color: account.color }}>{account.messagesCount}</span>
                      </div>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <Button
                    className="w-full rounded-xl"
                    variant={account.connected ? 'outline' : 'default'}
                    style={!account.connected ? { backgroundColor: account.color } : { borderColor: account.color, color: account.color }}
                    onClick={() => handleToggleConnection(account.id)}
                  >
                    {account.connected ? 'Desconectar' : 'Conectar'}
                  </Button>

                  {/* Información de ayuda */}
                  {!account.connected && (
                    <p className="text-xs text-center text-muted-foreground">
                      Conecta tu cuenta para centralizar tus mensajes
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Información adicional */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>¿Cómo funciona la conexión?</CardTitle>
              <CardDescription>
                Pasos para vincular tus plataformas a UNIR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: '#ec6c8c20' }}>
                    <span className="text-xl" style={{ color: '#ec6c8c' }}>1</span>
                  </div>
                  <h4 className="mb-2">Selecciona la plataforma</h4>
                  <p className="text-sm text-muted-foreground">
                    Elige WhatsApp, Instagram o Gmail según tus necesidades
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: '#acce6020' }}>
                    <span className="text-xl" style={{ color: '#acce60' }}>2</span>
                  </div>
                  <h4 className="mb-2">Autoriza la conexión</h4>
                  <p className="text-sm text-muted-foreground">
                    Inicia sesión y otorga los permisos necesarios de forma segura
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: '#6366f120' }}>
                    <span className="text-xl" style={{ color: '#6366f1' }}>3</span>
                  </div>
                  <h4 className="mb-2">Comienza a gestionar</h4>
                  <p className="text-sm text-muted-foreground">
                    Tus mensajes aparecerán automáticamente en el panel unificado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
