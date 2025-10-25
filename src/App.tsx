import { useState } from 'react'; 
import { LoginPage } from './components/LoginPage';
import { MessagesPage } from './components/MessagesPage';
import { HistoryPage } from './components/HistoryPage';
import { CollaboratorsPage } from './components/CollaboratorsPage';
import { MetricsPage } from './components/MetricsPage';
import { MessageSquare, History, Users, BarChart3, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import logo from 'figma:asset/ddbe47dfc68e74892d453d3ae9be3150750b8c47.png';

type Page = 'messages' | 'history' | 'collaborators' | 'metrics';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('messages');

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const navigation = [
    { id: 'messages' as Page, label: 'Mensajes', icon: MessageSquare, color: '#ec6c8c' },
    { id: 'metrics' as Page, label: 'Métricas', icon: BarChart3, color: '#acce60' },
    { id: 'history' as Page, label: 'Historial', icon: History, color: '#6366f1' },
    { id: 'collaborators' as Page, label: 'Colaboradores', icon: Users, color: '#f59e0b' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'messages':
        return <MessagesPage />;
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
                  isActive
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/50'
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
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">Admin Usuario</p>
              <p className="text-xs text-muted-foreground truncate">admin@unir.com</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 rounded-xl"
            onClick={() => setIsLoggedIn(false)}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}
