import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, MessageSquare, UserPlus, Settings, Trash2, Zap, Link2 } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  actionType: 'message' | 'user' | 'settings' | 'delete' | 'auto-response' | 'connection';
  details: string;
}

// 🔹 Mock interno original
const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    date: '25 Oct 2025',
    time: '14:30',
    user: 'Ana López',
    action: 'Envió mensaje',
    actionType: 'message',
    details: 'Respondió a María González vía Instagram'
  },
  {
    id: '2',
    date: '25 Oct 2025',
    time: '12:15',
    user: 'Carlos Admin',
    action: 'Invitó colaborador',
    actionType: 'user',
    details: 'Invitó a jorge@unir.com como Colaborador'
  },
  {
    id: '3',
    date: '25 Oct 2025',
    time: '11:45',
    user: 'Sistema',
    action: 'Respuesta automática',
    actionType: 'auto-response',
    details: 'Envió plantilla "Saludo inicial" a nuevo contacto'
  },
  {
    id: '4',
    date: '24 Oct 2025',
    time: '18:45',
    user: 'Ana López',
    action: 'Envió mensaje',
    actionType: 'message',
    details: 'Respondió a Pedro López vía WhatsApp'
  },
  {
    id: '5',
    date: '24 Oct 2025',
    time: '16:20',
    user: 'Carlos Admin',
    action: 'Modificó configuración',
    actionType: 'settings',
    details: 'Actualizó plantilla de respuesta automática'
  },
  {
    id: '6',
    date: '24 Oct 2025',
    time: '14:30',
    user: 'Carlos Admin',
    action: 'Conectó cuenta',
    actionType: 'connection',
    details: 'Conectó cuenta de Instagram @unir_oficial'
  },
  {
    id: '7',
    date: '23 Oct 2025',
    time: '15:30',
    user: 'Carlos Admin',
    action: 'Eliminó colaborador',
    actionType: 'delete',
    details: 'Eliminó a usuario@ejemplo.com del equipo'
  },
  {
    id: '8',
    date: '22 Oct 2025',
    time: '17:00',
    user: 'Carlos Admin',
    action: 'Invitó colaborador',
    actionType: 'user',
    details: 'Invitó a maria@unir.com como Administrador'
  }
];

// 🔹 Configuración visual
const actionConfig = {
  message: { icon: <MessageSquare className="h-4 w-4" />, label: 'Mensajes', color: '#acce60' },
  user: { icon: <UserPlus className="h-4 w-4" />, label: 'Usuarios', color: '#ec6c8c' },
  settings: { icon: <Settings className="h-4 w-4" />, label: 'Configuración', color: '#6366f1' },
  delete: { icon: <Trash2 className="h-4 w-4" />, label: 'Eliminaciones', color: '#ef4444' },
  'auto-response': { icon: <Zap className="h-4 w-4" />, label: 'Respuestas automáticas', color: '#f59e0b' },
  connection: { icon: <Link2 className="h-4 w-4" />, label: 'Conexiones', color: '#8b5cf6' },
};

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filterType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterType)
        ? prev.filter((f) => f !== filterType)
        : [...prev, filterType]
    );
  };

  const filteredHistory = mockHistory.filter((entry) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        entry.user.toLowerCase().includes(query) ||
        entry.action.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query) ||
        entry.date.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (selectedFilters.length > 0) {
      return selectedFilters.includes(entry.actionType);
    }

    return true;
  });

  const stats = mockHistory.reduce((acc, entry) => {
    acc[entry.actionType] = (acc[entry.actionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      {/* 🔹 Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2>Historial de Actividad</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Registro completo de acciones y cambios
            </p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en historial..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Contenido principal */}
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 pb-6">
          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="mb-4">Filtrar por tipo de acción</h3>
            <div className="flex flex-wrap-safe gap-2 justify-start responsive-scroll pb-2">
              {Object.entries(actionConfig).map(([key, config]) => {
                const isSelected = selectedFilters.includes(key);
                const count = stats[key] || 0;
                return (
                  <Button
                    key={key}
                    variant={isSelected ? 'default' : 'outline'}
                    className="rounded-xl flex-shrink-0"
                    style={
                      isSelected
                        ? { backgroundColor: config.color }
                        : { borderColor: config.color, color: config.color }
                    }
                    onClick={() => toggleFilter(key)}
                    size="sm"
                  >
                    {config.icon}
                    <span className="ml-2">{config.label}</span>
                    <Badge
                      variant="outline"
                      className="ml-2 rounded-full"
                      style={
                        isSelected
                          ? {
                              backgroundColor: 'rgba(255,255,255,0.3)',
                              borderColor: 'white',
                              color: 'white',
                            }
                          : { borderColor: config.color, color: config.color }
                      }
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
            {selectedFilters.length > 0 && (
              <Button
                variant="ghost"
                className="mt-3 rounded-xl"
                onClick={() => setSelectedFilters([])}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-2 md:p-4">
            <div className="mb-4 px-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredHistory.length} de {mockHistory.length} registros
              </p>
            </div>
            <div className="responsive-scroll rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead className="hidden md:table-cell">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-green-50/30"
                    >
                      <TableCell>
                        <div>
                          <div>{entry.date}</div>
                          <div className="text-sm text-muted-foreground">{entry.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: '#ec6c8c' }}
                          >
                            {entry.user.charAt(0)}
                          </div>
                          <span>{entry.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-full gap-1 whitespace-nowrap"
                          style={{
                            borderColor: actionConfig[entry.actionType].color,
                            color: actionConfig[entry.actionType].color,
                          }}
                        >
                          {actionConfig[entry.actionType].icon}
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {entry.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
