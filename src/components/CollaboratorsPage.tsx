import { useEffect, useState } from "react";
import {
  UserPlus, Mail, Shield, User, CheckCircle2, Clock, X,
  Search, TrendingUp, MessageSquare, Award
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./ui/select";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "./ui/dialog";
import { collaboratorService, Collaborator } from "../services/collaboratorService";

export function CollaboratorsPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "collaborator">("collaborator");
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<Collaborator | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "collaborator">("collaborator");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 🔹 Cargar colaboradores desde backend
  useEffect(() => {
    const fetchData = async () => {
      const data = await collaboratorService.getAll();
      setCollaborators(data);
    };
    fetchData();
  }, []);

  // 🔹 Invitar nuevo colaborador
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCollab = await collaboratorService.invite({
      name: email.split("@")[0],
      email,
      role,
    });
    setCollaborators(prev => [...prev, newCollab]);
    setEmail("");
    setRole("collaborator");
  };

  // 🔹 Editar rol
  const handleSaveEdit = async () => {
    if (!editing) return;
    await collaboratorService.updateRole(editing.id, editRole);
    setCollaborators(prev =>
      prev.map(c =>
        c.id === editing.id ? { ...c, role: editRole } : c
      )
    );
    setIsDialogOpen(false);
    setEditing(null);
  };

  const filtered = collaborators.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const active = collaborators.filter(c => c.status !== "inactive");
  const totalMessages = collaborators.reduce((sum, c) => sum + (c.messagesThisMonth || 0), 0);
  const avgTime = active.length > 0
    ? active.reduce((s, c) => s + (c.responseTime || 0), 0) / active.length
    : 0;

  const statusConfig = {
    active: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Activo", color: "#acce60" },
    pending: { icon: <Clock className="h-4 w-4" />, label: "Pendiente", color: "#f59e0b" },
    inactive: { icon: <X className="h-4 w-4" />, label: "Inactivo", color: "#ef4444" }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <h2>Colaboradores</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu equipo y sus permisos
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6 pb-6">
            {/* 🔸 Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Miembros Activos</p>
                    <h3 className="mt-2">{active.length}</h3>
                    <p className="text-sm text-muted-foreground">
                      de {collaborators.length} totales
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100">
                    <User className="h-6 w-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mensajes del Mes</p>
                    <h3 className="mt-2">{totalMessages}</h3>
                    <p className="text-sm" style={{ color: "#ec6c8c" }}>
                      +15.3% vs anterior
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-100">
                    <MessageSquare className="h-6 w-6 text-pink-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                    <h3 className="mt-2">{avgTime.toFixed(1)} min</h3>
                    <p className="text-sm" style={{ color: "#6366f1" }}>
                      Excelente rendimiento
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-100">
                    <TrendingUp className="h-6 w-6 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 🔸 Invitación */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100">
                  <UserPlus className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <CardTitle>Invitar Colaborador</CardTitle>
                  <CardDescription>Añade nuevos miembros a tu equipo</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email del colaborador</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="colaborador@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Rol</Label>
                      <Select value={role} onValueChange={(v) => setRole(v as "admin" | "collaborator")}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="collaborator">Colaborador</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 💗 Botón rosa */}
                  <Button
                    type="submit"
                    className="rounded-xl"
                    style={{
                      backgroundColor: "#ec6c8c",
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enviar Invitación
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 🔸 Tabla de colaboradores */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Equipo Actual</CardTitle>
                  <CardDescription>{collaborators.length} miembros en total</CardDescription>
                </div>
                <div className="w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
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
                        <TableHead>Fecha Alta</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-pink-400">
                                {c.name?.charAt(0).toUpperCase()}
                              </div>
                              <span>{c.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{c.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full gap-1" style={{
                              borderColor: c.role === "admin" ? "#ec6c8c" : "#acce60",
                              color: c.role === "admin" ? "#ec6c8c" : "#acce60"
                            }}>
                              {c.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                              {c.role === "admin" ? "Admin" : "Colaborador"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full gap-1" style={{
                              borderColor: statusConfig["active"].color,
                              color: statusConfig["active"].color
                            }}>
                              {statusConfig["active"].icon}
                              {statusConfig["active"].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {c.created_at
                              ? new Date(c.created_at).toLocaleDateString("es-ES")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(c);
                                setEditRole(c.role as any);
                                setIsDialogOpen(true);
                              }}
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
        </div>
      </div>

      {/* 🔸 Modal de edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
            <DialogDescription>
              Modifica el rol de {editing?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Rol</Label>
            <Select value={editRole} onValueChange={(v) => setEditRole(v as any)}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="collaborator">Colaborador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-xl" style={{ backgroundColor: "#ec6c8c", color: "white" }}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
