# 🚀 UnirFront - Integración Backend + Frontend

## 📁 Estructura del Proyecto

```
UnirFront/
├── src/                    # Frontend React
│   ├── components/
│   │   ├── LoginPage.tsx   # Página de login
│   │   └── RegisterPage.tsx # Página de registro
│   ├── services/
│   │   └── authService.ts  # Servicio de autenticación
│   └── App.tsx            # Componente principal
├── backend/               # Backend Node.js + SQLite
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── db/
└── README-INTEGRATION.md  # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** con TypeScript
- **Vite** como bundler
- **CSS Modules** para estilos

### Backend
- **Node.js** con Express
- **SQLite** como base de datos
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **CORS** para comunicación cross-origin

## 🚀 Cómo ejecutar el proyecto

### 1. Backend (Puerto 3001)
```bash
cd backend
npm install
npm start
```

### 2. Frontend (Puerto 5173)
```bash
npm install
npm run dev
```

## 🔐 Funcionalidades

- ✅ **Registro de usuarios** con mail y contraseña
- ✅ **Login de usuarios** con autenticación JWT
- ✅ **Persistencia de datos** en SQLite
- ✅ **Validación de formularios**
- ✅ **Manejo de errores**
- ✅ **Navegación entre páginas**

## 📊 Base de Datos

La base de datos SQLite se crea automáticamente con la siguiente estructura:

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mail TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  activo INTEGER DEFAULT 1
);
```

## 🔗 Endpoints del Backend

- `POST /api/auth/registrar` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/usuarios` - Ver usuarios registrados (desarrollo)

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/

## 📝 Notas de Desarrollo

- El JWT_SECRET está hardcodeado para evitar problemas con .env
- La base de datos se crea automáticamente al iniciar el backend
- El frontend se conecta al backend en el puerto 3001
- Los errores se manejan tanto en frontend como backend

## 🎯 Próximos pasos

- [ ] Implementar validación de email
- [ ] Agregar recuperación de contraseña
- [ ] Implementar roles de usuario
- [ ] Agregar tests unitarios
- [ ] Mejorar la UI/UX

