import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, MessageSquare, UserPlus, Settings, Trash2, Zap, Link2, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  actionType: 'message' | 'user' | 'settings' | 'delete' | 'auto-response' | 'connection';
  details: string;
}

// URL del backend Core
const HISTORY_API_BASE = `${API_CONFIG.baseUrl}/api/v1/history`;

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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  // Cargar historial desde el backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construir query params - solo filtros, la búsqueda se hace localmente
        const params = new URLSearchParams();
        if (selectedFilters.length > 0) {
          // Si hay múltiples filtros, el backend solo acepta uno, así que usamos el primero
          params.append('actionType', selectedFilters[0]);
        }

        const url = `${HISTORY_API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al cargar el historial');
        }

        const data = await response.json();
        setHistory(data);

        // Calcular estadísticas basadas en todos los datos
        const statsData: Record<string, number> = {};
        data.forEach((entry: HistoryEntry) => {
          statsData[entry.actionType] = (statsData[entry.actionType] || 0) + 1;
        });
        setStats(statsData);
      } catch (err) {
        console.error('Error loading history:', err);
        setError('No se pudo cargar el historial. Verifica que el backend esté corriendo.');
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para searchQuery - solo recargar si cambian los filtros
    const timer = setTimeout(() => {
      loadHistory();
    }, searchQuery ? 300 : 0); // Delay para búsqueda

    return () => clearTimeout(timer);
  }, [selectedFilters]); // Solo recargar cuando cambian los filtros, no cuando cambia searchQuery

  const toggleFilter = (filterType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterType)
        ? prev.filter((f) => f !== filterType)
        : [...prev, filterType]
    );
  };

  // Filtrar localmente además de la búsqueda del servidor para mejor UX
  const filteredHistory = history.filter((entry) => {
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
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
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Cargando historial...</p>
                </div>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredHistory.length} de {history.length} registros
                </p>
              )}
            </div>
            <div className="responsive-scroll rounded-xl">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No hay registros disponibles</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
