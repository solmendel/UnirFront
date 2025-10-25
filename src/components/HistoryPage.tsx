import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, MessageSquare, UserPlus, Settings, Trash2 } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  actionType: 'message' | 'user' | 'settings' | 'delete';
  details: string;
}

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
    date: '24 Oct 2025',
    time: '18:45',
    user: 'Ana López',
    action: 'Envió mensaje',
    actionType: 'message',
    details: 'Respondió a Pedro López vía WhatsApp'
  },
  {
    id: '4',
    date: '24 Oct 2025',
    time: '16:20',
    user: 'Carlos Admin',
    action: 'Modificó configuración',
    actionType: 'settings',
    details: 'Actualizó plantilla de respuesta automática'
  },
  {
    id: '5',
    date: '24 Oct 2025',
    time: '11:00',
    user: 'Ana López',
    action: 'Envió mensaje',
    actionType: 'message',
    details: 'Respondió a Laura Torres vía Instagram'
  },
  {
    id: '6',
    date: '23 Oct 2025',
    time: '15:30',
    user: 'Carlos Admin',
    action: 'Eliminó colaborador',
    actionType: 'delete',
    details: 'Eliminó a usuario@ejemplo.com del equipo'
  },
  {
    id: '7',
    date: '23 Oct 2025',
    time: '10:15',
    user: 'Ana López',
    action: 'Envió mensaje',
    actionType: 'message',
    details: 'Respondió a Ana Martínez vía Gmail'
  },
  {
    id: '8',
    date: '22 Oct 2025',
    time: '17:00',
    user: 'Carlos Admin',
    action: 'Invitó colaborador',
    actionType: 'user',
    details: 'Invitó a maria@unir.com como Administrador'
  },
];

const actionIcons = {
  message: <MessageSquare className="h-4 w-4" />,
  user: <UserPlus className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />
};

const actionColors = {
  message: '#acce60',
  user: '#ec6c8c',
  settings: '#6366f1',
  delete: '#ef4444'
};

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = mockHistory.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.user.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query) ||
      entry.details.toLowerCase().includes(query) ||
      entry.date.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2>Historial de Actividad</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Registro completo de acciones y cambios
            </p>
          </div>
          <div className="w-80">
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

      <ScrollArea className="flex-1 p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-green-50/30">
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
                      className="rounded-full gap-1"
                      style={{ borderColor: actionColors[entry.actionType], color: actionColors[entry.actionType] }}
                    >
                      {actionIcons[entry.actionType]}
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
