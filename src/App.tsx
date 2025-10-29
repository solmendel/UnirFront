import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { MessagesPage } from './components/MessagesPage';
import { HistoryPage } from './components/HistoryPage';
import { CollaboratorsPage } from './components/CollaboratorsPage';
import { MetricsPage } from './components/MetricsPage';
import { LinkedAccountsPage } from './components/LinkedAccountsPage';
import { MessageSquare, History, Users, BarChart3, LogOut, Link2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import logo from 'figma:asset/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';


// 🧩 1️⃣ Agregamos 'linkedAccounts' al tipo de página
type Page = 'messages' | 'history' | 'collaborators' | 'metrics' | 'linkedAccounts';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('messages');
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ email: string; name: string } | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('unir-session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Check if session is still valid (not expired)
          if (session.expiresAt && new Date().getTime() < session.expiresAt) {
            setIsLoggedIn(true);
            setUserData(session.user);
          } else {
            // Session expired, clear it
            localStorage.removeItem('unir-session');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('unir-session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData?: { email: string; name: string }) => {
    const sessionData = {
      isLoggedIn: true,
      user: userData || { email: 'admin@unir.com', name: 'Admin Usuario' },
      loginTime: new Date().getTime(),
      expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
    };

    localStorage.setItem('unir-session', JSON.stringify(sessionData));
    setIsLoggedIn(true);
    setUserData(sessionData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('unir-session');
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 🧭 2️⃣ Agregamos la opción "Cuentas Vinculadas" al menú lateral
  const navigation = [
    { id: 'messages' as Page, label: 'Mensajes', icon: MessageSquare, color: '#ec6c8c' },
    { id: 'linkedAccounts' as Page, label: 'Cuentas vinculadas', icon: Link2, color: '#acce60' },
    { id: 'metrics' as Page, label: 'Métricas', icon: BarChart3, color: '#8b5cf6' },
    { id: 'history' as Page, label: 'Historial', icon: History, color: '#6366f1' },
    { id: 'collaborators' as Page, label: 'Colaboradores', icon: Users, color: '#f59e0b' },
  ];

  // 🧠 3️⃣ Renderizamos la página nueva
  const renderPage = () => {
    switch (currentPage) {
      case 'messages':
        return <MessagesPage />;
      case 'linkedAccounts':
        return <LinkedAccountsPage />;
      case 'history':
        return <HistoryPage />;
      case 'collaborators':
        return <CollaboratorsPage />;
      case 'metrics':
        return <MetricsPage />;
      default:
        return <MessagesPage />;
    }
  };

   return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gradient-to-b from-pink-50/50 to-green-50/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <img src={logo} alt="UNIR" className="h-32 mx-auto" />
          <p className="text-center text-sm text-muted-foreground mt-3">
            Mensajería Unificada
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: isActive ? `${item.color}20` : 'transparent',
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: isActive ? item.color : '#888' }}
                  />
                </div>
                <span
                  className="transition-colors"
                  style={{ color: isActive ? item.color : '#888' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <Separator />

        {/* User section */}
        <div className="p-4 border-t bg-white/30">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: '#ec6c8c' }}
            >
              {(userData?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{userData?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userData?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto w-full h-full bg-white">
        <div className="min-h-screen w-full">{renderPage()}</div>
      </div>
    </div>
  );
}
