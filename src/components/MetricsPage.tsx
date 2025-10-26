import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MessageSquare, TrendingUp, Clock, CheckCircle, Users, Star, Award, Target } from 'lucide-react';

const messagesByPlatform = [
  { name: 'Instagram', value: 245, color: '#e4405f' },
  { name: 'WhatsApp', value: 380, color: '#25d366' },
  { name: 'Gmail', value: 156, color: '#ea4335' },
];

const messagesOverTime = [
  { date: 'Lun', instagram: 45, whatsapp: 62, gmail: 28 },
  { date: 'Mar', instagram: 52, whatsapp: 58, gmail: 31 },
  { date: 'Mié', instagram: 48, whatsapp: 71, gmail: 25 },
  { date: 'Jue', instagram: 38, whatsapp: 65, gmail: 22 },
  { date: 'Vie', instagram: 62, whatsapp: 74, gmail: 35 },
  { date: 'Sáb', instagram: 55, whatsapp: 45, gmail: 15 },
  { date: 'Dom', instagram: 41, whatsapp: 38, gmail: 12 },
];

const responseTime = [
  { hour: '9:00', tiempo: 12 },
  { hour: '11:00', tiempo: 8 },
  { hour: '13:00', tiempo: 15 },
  { hour: '15:00', tiempo: 10 },
  { hour: '17:00', tiempo: 7 },
  { hour: '19:00', tiempo: 14 },
];

const teamPerformance = [
  { name: 'Ana López', mensajes: 245, satisfaccion: 4.8, avatar: 'A' },
  { name: 'Carlos Admin', mensajes: 312, satisfaccion: 4.9, avatar: 'C' },
  { name: 'María García', mensajes: 189, satisfaccion: 4.7, avatar: 'M' },
  { name: 'Jorge Ruiz', mensajes: 124, satisfaccion: 4.6, avatar: 'J' },
];

const hourlyActivity = [
  { hour: '00:00', mensajes: 5 },
  { hour: '03:00', mensajes: 2 },
  { hour: '06:00', mensajes: 8 },
  { hour: '09:00', mensajes: 45 },
  { hour: '12:00', mensajes: 68 },
  { hour: '15:00', mensajes: 72 },
  { hour: '18:00', mensajes: 58 },
  { hour: '21:00', mensajes: 32 },
];

const stats = [
  {
    title: 'Mensajes Totales',
    value: '781',
    change: '+12.5%',
    icon: MessageSquare,
    color: '#ec6c8c'
  },
  {
    title: 'Mensajes Respondidos',
    value: '654',
    change: '+8.3%',
    icon: CheckCircle,
    color: '#acce60'
  },
  {
    title: 'Tiempo Promedio',
    value: '10.8 min',
    change: '-2.1%',
    icon: Clock,
    color: '#6366f1'
  },
  {
    title: 'Tasa de Respuesta',
    value: '83.7%',
    change: '+5.2%',
    icon: TrendingUp,
    color: '#f59e0b'
  },
];

export function MetricsPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50/30 to-green-50/30">
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div>
          <h2>Métricas y Estadísticas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis del rendimiento de tu equipo
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6 pb-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <h3 className="mt-2">{stat.value}</h3>
                      <p className="text-sm mt-1" style={{ color: stat.color }}>
                        {stat.change} vs semana anterior
                      </p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20` }}>
                      <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mensajes por plataforma */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Mensajes por Plataforma</CardTitle>
                <CardDescription>Distribución de mensajes recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={messagesByPlatform}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {messagesByPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tiempo de respuesta */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Tiempo de Respuesta</CardTitle>
                <CardDescription>Promedio por hora del día (minutos)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="tiempo" 
                      stroke="#ec6c8c" 
                      strokeWidth={3}
                      dot={{ fill: '#ec6c8c', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Mensajes a lo largo del tiempo */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Mensajes de la Semana</CardTitle>
              <CardDescription>Actividad por plataforma en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={messagesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="instagram" name="Instagram" fill="#e4405f" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="whatsapp" name="WhatsApp" fill="#25d366" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="gmail" name="Gmail" fill="#ea4335" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rendimiento del equipo */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#acce6020' }}>
                    <Users className="h-5 w-5" style={{ color: '#acce60' }} />
                  </div>
                  <div>
                    <CardTitle>Rendimiento del Equipo</CardTitle>
                    <CardDescription>Mensajes gestionados este mes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-pink-50/50 to-green-50/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: '#ec6c8c' }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <p>{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.mensajes} mensajes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span style={{ color: '#f59e0b' }}>{member.satisfaccion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actividad por hora */}
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#6366f120' }}>
                    <Target className="h-5 w-5" style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <CardTitle>Actividad por Hora</CardTitle>
                    <CardDescription>Volumen de mensajes durante el día</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="mensajes" name="Mensajes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Objetivos y logros */}
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#ec6c8c20' }}>
                  <Award className="h-5 w-5" style={{ color: '#ec6c8c' }} />
                </div>
                <div>
                  <CardTitle>Objetivos del Mes</CardTitle>
                  <CardDescription>Progreso hacia las metas establecidas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#ec6c8c' }}>
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2">850 / 1000</h3>
                  <p className="text-sm text-muted-foreground">Mensajes Objetivo</p>
                  <Badge className="mt-3 rounded-full" style={{ backgroundColor: '#ec6c8c' }}>
                    85% completado
                  </Badge>
                </div>

                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#acce60' }}>
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2">9.2 min</h3>
                  <p className="text-sm text-muted-foreground">Tiempo &lt; 10 min</p>
                  <Badge className="mt-3 rounded-full" style={{ backgroundColor: '#acce60' }}>
                    ✓ Alcanzado
                  </Badge>
                </div>

                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#f59e0b' }}>
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2">87% / 90%</h3>
                  <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
                  <Badge className="mt-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}>
                    97% completado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
