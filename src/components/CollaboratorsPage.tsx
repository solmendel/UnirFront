import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { UserPlus, Mail, Shield, User, CheckCircle2, Clock, X, Search, TrendingUp, MessageSquare, Award } from 'lucide-react';

interface Collaborator {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'collaborator';
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  messagesThisMonth?: number;
  responseTime?: number;
}

const initialCollaborators: Collaborator[] = [
  {
    id: '1',
    email: 'carlos.admin@unir.com',
    name: 'Carlos Admin',
    role: 'admin',
    status: 'active',
    joinedDate: '15 Ene 2025',
    messagesThisMonth: 312,
    responseTime: 8.5
  },
  {
    id: '2',
    email: 'ana.lopez@unir.com',
    name: 'Ana López',
    role: 'collaborator',
    status: 'active',
    joinedDate: '20 Feb 2025',
    messagesThisMonth: 245,
    responseTime: 10.2
  },
  {
    id: '3',
    email: 'maria@unir.com',
    name: 'María García',
    role: 'admin',
    status: 'active',
    joinedDate: '10 Mar 2025',
    messagesThisMonth: 189,
    responseTime: 9.8
  },
  {
    id: '4',
    email: 'jorge@unir.com',
    name: 'Jorge Ruiz',
    role: 'collaborator',
    status: 'pending',
    joinedDate: '25 Oct 2025',
    messagesThisMonth: 0,
    responseTime: 0
  },
  {
    id: '5',
    email: 'laura.torres@unir.com',
    name: 'Laura Torres',
    role: 'collaborator',
    status: 'active',
    joinedDate: '05 Abr 2025',
    messagesThisMonth: 156,
    responseTime: 12.1
  },
  {
    id: '6',
    email: 'pedro.sanchez@unir.com',
    name: 'Pedro Sánchez',
    role: 'collaborator',
    status: 'inactive',
    joinedDate: '18 Feb 2025',
    messagesThisMonth: 0,
    responseTime: 0
  },
];

export function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'collaborator'>('collaborator');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'collaborator'>('collaborator');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para invitar
    setEmail('');
    setRole('collaborator');
  };

  const handleEditClick = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setEditRole(collaborator.role);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCollaborator) return;

    setCollaborators(prevCollaborators =>
      prevCollaborators.map(collab =>
        collab.id === editingCollaborator.id
          ? { ...collab, role: editRole }
          : collab
      )
    );

    setIsEditDialogOpen(false);
    setEditingCollaborator(null);
  };

  const filteredCollaborators = collaborators.filter(collab => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      collab.name.toLowerCase().includes(query) ||
      collab.email.toLowerCase().includes(query)
    );
  });

  const activeCollaborators = collaborators.filter(c => c.status === 'active');
  const totalMessages = collaborators.reduce((sum, c) => sum + (c.messagesThisMonth || 0), 0);
  const avgResponseTime = activeCollaborators.length > 0 
    ? activeCollaborators.reduce((sum, c) => sum + (c.responseTime || 0), 0) / activeCollaborators.length 
    : 0;

  const statusConfig = {
    active: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: 'Activo',
      color: '#acce60'
    },
    pending: {
      icon: <Clock className="h-4 w-4" />,
      label: 'Pendiente',
      color: '#f59e0b'
    },
    inactive: {
      icon: <X className="h-4 w-4" />,
      label: 'Inactivo',
      color: '#ef4444'
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div>
          <h2>Colaboradores</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tu equipo y sus permisos
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6 pb-6">
          {/* Estadísticas del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Miembros Activos</p>
                    <h3 className="mt-2">{activeCollaborators.length}</h3>
                    <p className="text-sm mt-1 text-muted-foreground">
                      de {collaborators.length} totales
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#acce6020' }}>
                    <User className="h-6 w-6" style={{ color: '#acce60' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensajes del Mes</p>
                    <h3 className="mt-2">{totalMessages}</h3>
                    <p className="text-sm mt-1" style={{ color: '#ec6c8c' }}>
                      +15.3% vs anterior
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#ec6c8c20' }}>
                    <MessageSquare className="h-6 w-6" style={{ color: '#ec6c8c' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                    <h3 className="mt-2">{avgResponseTime.toFixed(1)} min</h3>
                    <p className="text-sm mt-1" style={{ color: '#6366f1' }}>
                      Excelente rendimiento
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#6366f120' }}>
                    <TrendingUp className="h-6 w-6" style={{ color: '#6366f1' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de invitación */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#ec6c8c20' }}>
                  <UserPlus className="h-5 w-5" style={{ color: '#ec6c8c' }} />
                </div>
                <div>
                  <CardTitle>Invitar Colaborador</CardTitle>
                  <CardDescription>
                    Añade nuevos miembros a tu equipo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email del colaborador</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="colaborador@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'collaborator')}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborator">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Colaborador
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="rounded-xl" style={{ backgroundColor: '#ec6c8c' }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Top performers */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#f59e0b20' }}>
                  <Award className="h-5 w-5" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <CardTitle>Mejores Colaboradores del Mes</CardTitle>
                  <CardDescription>Destacados por su rendimiento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeCollaborators
                  .sort((a, b) => (b.messagesThisMonth || 0) - (a.messagesThisMonth || 0))
                  .slice(0, 3)
                  .map((collab, index) => (
                    <div key={collab.id} className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-green-50 text-center">
                      <div className="relative inline-block mb-3">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl"
                          style={{ backgroundColor: '#ec6c8c' }}
                        >
                          {collab.name.charAt(0)}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f59e0b' }}>
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="mb-1">{collab.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{collab.messagesThisMonth} mensajes</p>
                      <Badge className="rounded-full" style={{ backgroundColor: '#acce60' }}>
                        {collab.responseTime} min promedio
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de colaboradores */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipo Actual</CardTitle>
                  <CardDescription>
                    {collaborators.length} miembros en total
                  </CardDescription>
                </div>
                <div className="w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      className="pl-10 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Mensajes</TableHead>
                      <TableHead>Tiempo Resp.</TableHead>
                      <TableHead>Fecha de Ingreso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollaborators.map((collaborator) => (
                      <TableRow key={collaborator.id} className="hover:bg-gradient-to-r hover:from-pink-50/30 hover:to-green-50/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: '#ec6c8c' }}
                            >
                              {collaborator.name.charAt(0)}
                            </div>
                            <span>{collaborator.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {collaborator.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="rounded-full gap-1"
                            style={{ 
                              borderColor: collaborator.role === 'admin' ? '#ec6c8c' : '#acce60',
                              color: collaborator.role === 'admin' ? '#ec6c8c' : '#acce60'
                            }}
                          >
                            {collaborator.role === 'admin' ? (
                              <Shield className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {collaborator.role === 'admin' ? 'Admin' : 'Colaborador'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="rounded-full gap-1"
                            style={{ 
                              borderColor: statusConfig[collaborator.status].color,
                              color: statusConfig[collaborator.status].color
                            }}
                          >
                            {statusConfig[collaborator.status].icon}
                            {statusConfig[collaborator.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {collaborator.messagesThisMonth || 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {collaborator.responseTime ? `${collaborator.responseTime} min` : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {collaborator.joinedDate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-lg"
                            onClick={() => handleEditClick(collaborator)}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Dialog para editar rol */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
            <DialogDescription>
              Modifica el rol de {editingCollaborator?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as 'admin' | 'collaborator')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Colaborador
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
              {editRole === 'admin' 
                ? '⚡ Los administradores tienen acceso completo a todas las funciones de UNIR.'
                : '👤 Los colaboradores pueden gestionar mensajes pero no modificar configuraciones del equipo.'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-xl" style={{ backgroundColor: '#ec6c8c' }}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
