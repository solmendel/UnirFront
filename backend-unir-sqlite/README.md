# Backend Unir - Sistema de Autenticación (SQLite)

Backend desarrollado con Node.js, Express y **SQLite** para el sistema de autenticación de usuarios utilizando JWT.

## 🎯 ¿Por qué SQLite?

- ✅ **No necesitas instalar MySQL** ni configurar servidores
- ✅ **Archivo local** - La base de datos es un simple archivo
- ✅ **Cero configuración** - Se crea automáticamente
- ✅ **Perfecto para desarrollo** y proyectos pequeños
- ✅ **Portátil** - Puedes mover el archivo .db donde quieras

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn

**¡Eso es todo!** No necesitas instalar MySQL ni configurar nada más.

## 🚀 Instalación

1. **Descomprimir el proyecto**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Editar el archivo `.env`:
```env
PORT=3001
JWT_SECRET=tu_secreto_super_seguro
```

4. **¡Listo! Iniciar el servidor**
```bash
npm run dev
```

La base de datos SQLite se creará automáticamente en `unir.db` cuando inicies el servidor por primera vez.

## 📡 Endpoints de la API

Exactamente iguales que la versión MySQL:

### 1. Registro de Usuario
**POST** `http://localhost:3001/api/auth/registro`

```json
{
  "nombre": "usuario@ejemplo.com",
  "password": "mipassword123"
}
```

### 2. Login
**POST** `http://localhost:3001/api/auth/login`

```json
{
  "nombre": "usuario@ejemplo.com",
  "password": "mipassword123"
}
```

## 📊 Estructura de la Base de Datos

La tabla se crea automáticamente con esta estructura:

| Campo    | Tipo    | Descripción                      |
|----------|---------|----------------------------------|
| id       | INTEGER | Identificador único (autoincremento) |
| nombre   | TEXT    | Email del usuario (único)        |
| password | TEXT    | Contraseña hasheada (bcrypt)     |
| activo   | INTEGER | Estado del usuario (1 = activo)  |

## 📁 Estructura del Proyecto

```
backend-unir-sqlite/
├── controllers/
│   └── authController.js
├── db/
│   └── database.js           # Configuración SQLite
├── middlewares/
│   └── authMiddleware.js
├── models/
│   └── usuariosModel.js
├── routes/
│   └── authRoutes.js
├── postman/
│   └── API_Unir_Auth.postman_collection.json
├── unir.db                   # Base de datos (se crea automáticamente)
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **SQLite3** - Base de datos local
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Generación y verificación de JWT
- **dotenv** - Gestión de variables de entorno
- **cors** - Manejo de CORS

## 🔍 Ver los datos en la base de datos

Puedes usar cualquiera de estas herramientas para ver el archivo `unir.db`:

1. **DB Browser for SQLite** (gratis, visual): https://sqlitebrowser.org/
2. **DBeaver** (gratis, profesional): https://dbeaver.io/
3. **Extensión de VS Code**: SQLite Viewer

O desde la terminal:
```bash
sqlite3 unir.db
.tables
SELECT * FROM usuarios;
.exit
```

## 🔒 Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Autenticación mediante JWT (24h de duración)
- Validación de formato de email
- Eliminación lógica de usuarios (campo `activo`)

## 🚀 Ventajas de esta versión

✅ **Sin instalaciones complejas** - No necesitas MySQL Workbench ni configurar servidores  
✅ **Funciona de inmediato** - npm install && npm start  
✅ **Fácil de respaldar** - Solo copia el archivo unir.db  
✅ **Perfecto para desarrollo** - Ideal para aprender y prototipar  
✅ **Portátil** - Mueve todo el proyecto a cualquier computadora  

## 📝 Notas

- El archivo `unir.db` contiene toda tu base de datos
- Se crea automáticamente la primera vez que inicias el servidor
- Puedes eliminar `unir.db` para resetear la base de datos
- Mismo código del frontend funciona igual que con MySQL

## 🔄 Migrar a MySQL después

Si después quieres migrar a MySQL, solo:
1. Exporta los datos de SQLite
2. Usa el backend original de MySQL
3. Importa los datos

## 📮 Probar con Postman

Importa la colección desde: `postman/API_Unir_Auth.postman_collection.json`

## 💡 Conectar con tu Frontend

Exactamente igual que con MySQL:

```javascript
// Registro
fetch('http://localhost:3001/api/auth/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'usuario@ejemplo.com',
    password: 'mipassword'
  })
})

// Login
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'usuario@ejemplo.com',
    password: 'mipassword'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
})
```

---

**¡Disfruta de tu backend sin complicaciones!** 🎉
