import { useState } from 'react';
import {
  Instagram,
  Mail,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Link2,
  AlertCircle,
} from 'lucide-react';

// 🧩 Componentes base simulados (reemplazá por tus componentes reales si los tenés)
const Card = ({ className, children }) => (
  <div className={`rounded-xl border shadow-lg bg-white/90 ${className}`}>{children}</div>
);
const CardHeader = ({ className, children }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardTitle = ({ className, children }) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardDescription = ({ className, children }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const CardContent = ({ className, children }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Button = ({ className, variant, onClick, style, children }) => (
  <button
    className={`p-3 rounded-xl font-medium transition-all ${className} ${
      variant === 'outline' ? 'bg-white border-2' : 'text-white'
    }`}
    onClick={onClick}
    style={style}
  >
    {children}
  </button>
);
const Badge = ({ className, variant, style, children }) => (
  <div
    className={`inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 ${className} ${
      variant === 'outline' ? 'border' : 'bg-gray-200'
    }`}
    style={style}
  >
    {children}
  </div>
);

// 🧠 Tipado
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
      icon: <MessageCircle className="h-10 w-10 md:h-12 md:w-12" />,
      color: '#25d366',
      connected: true,
      accountName: '+52 555 123 4567',
      connectedDate: '15 Mar 2025',
      messagesCount: 380,
    },
    {
      id: '2',
      platform: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-10 w-10 md:h-12 md:w-12" />,
      color: '#e4405f',
      connected: true,
      accountName: '@unir_oficial',
      connectedDate: '10 Feb 2025',
      messagesCount: 245,
    },
    {
      id: '3',
      platform: 'gmail',
      name: 'Gmail',
      icon: <Mail className="h-10 w-10 md:h-12 md:w-12" />,
      color: '#ea4335',
      connected: false,
      messagesCount: 0,
    },
  ]);

  const handleToggleConnection = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              connected: !acc.connected,
              accountName: acc.connected
                ? undefined
                : acc.platform === 'gmail'
                ? 'solju@gmail.com'
                : 'Cuenta conectada',
              connectedDate: acc.connected
                ? undefined
                : new Date().toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }),
            }
          : acc
      )
    );
  };

  const connectedCount = accounts.filter((a) => a.connected).length;
  const totalMessages = accounts.reduce((sum, a) => sum + (a.messagesCount || 0), 0);

  return (
    // 🔹 Contenedor principal con scroll interno
    <div className="h-[calc(100vh-0px)] overflow-y-auto scroll-smooth bg-gradient-to-br from-pink-50/30 to-green-50/30 font-sans">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm px-4 md:px-6 py-4 sticky top-0 z-10">
        <h2 className="text-2xl font-semibold">Cuentas vinculadas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecta y administra tus plataformas de mensajería para una gestión centralizada.
        </p>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 px-4 md:px-8 py-12 space-y-20 max-w-7xl mx-auto">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Plataformas Conectadas</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                  {connectedCount} / {accounts.length}
                </h3>
              </div>
              <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#acce6020' }}>
                <Link2 className="h-7 w-7" style={{ color: '#5cb85c' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Mensajes Totales</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                  {totalMessages.toLocaleString('es-ES')}
                </h3>
              </div>
              <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#ec6c8c20' }}>
                <MessageCircle className="h-7 w-7" style={{ color: '#ff6699' }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado General</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-800">
                  {connectedCount === accounts.length ? 'Óptimo' : 'Revisar'}
                </h3>
              </div>
              <div className="p-4 rounded-xl shadow-md" style={{ backgroundColor: '#6366f120' }}>
                {connectedCount === accounts.length ? (
                  <CheckCircle2 className="h-7 w-7" style={{ color: '#6366f1' }} />
                ) : (
                  <AlertCircle className="h-7 w-7" style={{ color: '#f59e0b' }} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plataformas conectadas */}
        <section className="space-y-10">
          <h3 className="text-2xl font-bold text-gray-700">Plataformas de mensajería</h3>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {accounts.map((account) => (
              <Card
                key={account.id}
                className="shadow-lg border-2 border-gray-100 hover:border-gray-200 transition-all rounded-3xl"
              >
                <div
                  className="h-3 rounded-t-3xl"
                  style={{ backgroundColor: account.connected ? account.color : '#e5e7eb' }}
                />
                <CardHeader className="text-center pt-8 pb-4">
                  <div
                    className="mx-auto mb-4 p-5 rounded-3xl"
                    style={{ backgroundColor: `${account.color}15`, width: 'fit-content' }}
                  >
                    <div style={{ color: account.color }}>{account.icon}</div>
                  </div>
                  <CardTitle className="text-2xl text-gray-800">{account.name}</CardTitle>
                  <CardDescription>
                    {account.connected ? account.accountName : 'No conectado'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-6">
                  <div className="flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className="rounded-full gap-2 px-5 py-2 font-bold text-sm"
                      style={{
                        borderColor: account.connected ? account.color : '#ef4444',
                        color: account.connected ? account.color : '#ef4444',
                        backgroundColor: account.connected ? `${account.color}10` : '#fef2f2',
                      }}
                    >
                      {account.connected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Inactivo
                        </>
                      )}
                    </Badge>
                  </div>

                  {account.connected && (
                    <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Conectado desde:</span>
                        <span className="font-semibold text-gray-700">{account.connectedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Mensajes procesados:</span>
                        <span className="font-semibold" style={{ color: account.color }}>
                          {account.messagesCount?.toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className={`w-full rounded-2xl text-lg font-bold shadow-md ${
                      account.connected ? 'hover:bg-gray-100' : 'hover:opacity-90 transition-opacity'
                    }`}
                    variant={account.connected ? 'outline' : 'default'}
                    style={
                      !account.connected
                        ? { backgroundColor: account.color }
                        : { borderColor: account.color, color: account.color, borderWidth: '2px' }
                    }
                    onClick={() => handleToggleConnection(account.id)}
                  >
                    {account.connected ? 'Desconectar' : 'Vincular ahora'}
                  </Button>

                  {!account.connected && (
                    <p className="text-xs text-center text-gray-500 pt-1">
                      Conecta tu cuenta para empezar a gestionar.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pasos finales */}
        <section className="pb-20">
          <Card className="shadow-lg border-none bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">¿Cómo funciona la conexión?</CardTitle>
              <CardDescription>
                Pasos sencillos para vincular tus plataformas a UNIR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="text-center p-6 border rounded-2xl bg-gray-50/50 shadow-inner">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto font-bold text-xl text-white"
                    style={{ backgroundColor: '#ec6c8c' }}
                  >
                    1
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">
                    Selecciona la plataforma
                  </h4>
                  <p className="text-sm text-gray-500">
                    Elige WhatsApp, Instagram o Gmail para unificar tus mensajes en un solo lugar.
                  </p>
                </div>

                <div className="text-center p-6 border rounded-2xl bg-gray-50/50 shadow-inner">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto font-bold text-xl text-white"
                    style={{ backgroundColor: '#acce60' }}
                  >
                    2
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">Autoriza el acceso</h4>
                  <p className="text-sm text-gray-500">
                    Inicia sesión y concede permisos para conectar tus cuentas de forma segura.
                  </p>
                </div>

                <div className="text-center p-6 border rounded-2xl bg-gray-50/50 shadow-inner">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto font-bold text-xl text-white"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    3
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-800">
                    Comienza a gestionar
                  </h4>
                  <p className="text-sm text-gray-500">
                    Tus mensajes aparecerán automáticamente en el panel unificado de UNIR.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
