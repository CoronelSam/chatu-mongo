# ChatU API

API REST de mensajería por salas, construida con Node.js, Express 5, MongoDB y Mongoose 9.

## Requisitos

- Node.js 20.19 o superior. Mongoose 9 lo exige, aunque el enunciado indica Node 18.
- pnpm, porque el proyecto usa `pnpm-lock.yaml`. Se instala con `npm install -g pnpm`.
- MongoDB local o un clúster gratuito de MongoDB Atlas.

## Puesta en marcha

Instala las dependencias y crea tu `.env`:

```bash
pnpm install
```

```bash
cp .env.example .env
```

Prepara la base de datos de una de estas dos formas:

- **Atlas:** crea un clúster gratuito y pon su cadena de conexión en `MONGO_URI`, dentro de `.env`.
- **Docker:** levanta una base local con el siguiente comando; el `MONGO_URI` del ejemplo ya apunta a ella.

```bash
docker run -d --name chatu-mongo -p 27017:27017 mongo:8
```

Arranca el servidor en modo desarrollo:

```bash
pnpm dev
```

Comprueba que responde:

```bash
curl http://localhost:3000/api/v1/health
```

Si la base de datos no está disponible, el servidor tarda unos 30 segundos en terminar con `Error de conexión`.

## Datos de prueba

`pnpm seed` crea dos usuarios y una sala, e imprime sus ID: un usuario es miembro de la sala y el otro no. Se puede repetir sin riesgo, porque solo reinicia la sala `seed-sala` y sus mensajes.

## Endpoints

Todas las rutas llevan el prefijo `/api/v1`. Las rutas con `:id` responden `400 INVALID_ID` si el ID no tiene un formato válido.

| # | Método | Ruta | Descripción | Respuesta OK | Nivel |
|---|---|---|---|---|---|
| 1 | POST | `/users` | Registrar usuario (body: `username`, `email`; opcionales: `avatarUrl`, `status`) | 201 | Obligatorio |
| 2 | GET | `/users` | Listar usuarios (filtro `?status=online`) | 200 | Obligatorio |
| 3 | GET | `/users/:id` | Obtener un usuario | 200 | Obligatorio |
| 4 | PATCH | `/users/:id/status` | Cambiar estado (body: `status`) | 200 | Opcional |
| 5 | POST | `/rooms` | Crear sala (body: `name`, `ownerId`; opcionales: `description`, `isPrivate`) | 201 | Obligatorio |
| 6 | GET | `/rooms` | Listar salas públicas con número de miembros (`memberCount`) | 200 | Obligatorio |
| 7 | GET | `/rooms/:id` | Detalle de sala con sus miembros | 200 | Obligatorio |
| 8 | POST | `/rooms/:id/join` | Unirse a una sala (body: `userId`) | 200 | Obligatorio |
| 9 | POST | `/rooms/:id/leave` | Salir de una sala (body: `userId`) | 200 | Opcional |
| 10 | DELETE | `/rooms/:id` | Eliminar sala y sus mensajes (solo owner; body: `userId`) | 204 | Opcional |
| 11 | POST | `/rooms/:id/messages` | Enviar mensaje (body: `senderId`, `content`) | 201 | Obligatorio |
| 12 | GET | `/rooms/:id/messages` | Listar mensajes (`?page=1&limit=20`), más recientes primero | 200 | Obligatorio |
| 13 | PUT | `/messages/:id` | Editar contenido (body: `content`; marca `edited: true`) | 200 | Obligatorio |
| 14 | DELETE | `/messages/:id` | Eliminar mensaje | 204 | Obligatorio |

## Formato de respuesta

```json
{ "ok": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 57 } }
```

```json
{ "ok": false, "error": { "code": "NOT_MEMBER", "message": "El usuario no pertenece a la sala" } }
```

`meta` solo aparece en los listados paginados. Las respuestas `204` no llevan cuerpo.

## Códigos de error

| HTTP | `error.code` | Cuándo ocurre |
|---|---|---|
| 400 | `VALIDATION` | Los datos no cumplen las reglas del modelo |
| 400 | `INVALID_ID` | Un ID no tiene formato de ObjectId |
| 400 | `INVALID_JSON` | El cuerpo de la petición no es JSON válido |
| 403 | `NOT_MEMBER` | El usuario no pertenece a la sala |
| 403 | `NOT_OWNER` | La acción está reservada al owner de la sala |
| 404 | `NOT_FOUND` | La ruta no existe |
| 404 | `USER_NOT_FOUND`, `ROOM_NOT_FOUND`, `MESSAGE_NOT_FOUND` | El recurso no existe |
| 409 | `DUPLICATE` | Ya existe un registro con ese valor único |
| 409 | `ALREADY_MEMBER` | El usuario ya es miembro de la sala |
| 500 | `SERVER_ERROR` | Error inesperado |

## Ejemplos de mensajes

### Enviar un mensaje

`POST /api/v1/rooms/6aed662af75c82321944ac62/messages`

```json
{ "senderId": "6aed662af75c82321944ac61", "content": "Hola a todos" }
```

Respuesta `201`:

```json
{
  "ok": true,
  "data": {
    "room": "6aed662af75c82321944ac62",
    "sender": { "_id": "6aed662af75c82321944ac61", "username": "ana", "avatarUrl": "" },
    "content": "Hola a todos",
    "edited": false,
    "_id": "6aed662bf75c82321944ac63",
    "createdAt": "2026-11-06T05:31:23.025Z",
    "updatedAt": "2026-11-06T05:31:23.025Z",
    "__v": 0
  }
}
```

Errores:

- `400 INVALID_ID`: falta `senderId` o no es válido.
- `400 VALIDATION`: `content` está vacío o supera los 500 caracteres.
- `403 NOT_MEMBER`: el usuario no pertenece a la sala.
- `404 ROOM_NOT_FOUND`: la sala no existe.

### Listar los mensajes de una sala

`GET /api/v1/rooms/6aed662af75c82321944ac62/messages?page=1&limit=20`

Los mensajes más recientes van primero. `page` empieza en 1 y `limit` va de 1 a 100, con 20 por defecto; los valores fuera de rango se ajustan.

Respuesta `200`:

```json
{
  "ok": true,
  "data": [
    {
      "_id": "6aed662bf75c82321944ac63",
      "room": "6aed662af75c82321944ac62",
      "sender": { "_id": "6aed662af75c82321944ac61", "username": "ana", "avatarUrl": "" },
      "content": "Hola a todos",
      "edited": false,
      "createdAt": "2026-11-06T05:31:23.025Z",
      "updatedAt": "2026-11-06T05:31:23.025Z",
      "__v": 0
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

Error: `404 ROOM_NOT_FOUND` si la sala no existe.

### Editar un mensaje

`PUT /api/v1/messages/6aed662bf75c82321944ac63`

```json
{ "content": "Hola a todas y todos" }
```

Respuesta `200`:

```json
{
  "ok": true,
  "data": {
    "_id": "6aed662bf75c82321944ac63",
    "room": "6aed662af75c82321944ac62",
    "sender": { "_id": "6aed662af75c82321944ac61", "username": "ana", "avatarUrl": "" },
    "content": "Hola a todas y todos",
    "edited": true,
    "createdAt": "2026-11-06T05:31:23.025Z",
    "updatedAt": "2026-11-06T05:31:23.594Z",
    "__v": 0
  }
}
```

Errores:

- `400 VALIDATION`: `content` falta, está vacío o supera los 500 caracteres.
- `404 MESSAGE_NOT_FOUND`: el mensaje no existe.

### Eliminar un mensaje

`DELETE /api/v1/messages/6aed662bf75c82321944ac63`

Responde `204` sin cuerpo, o `404 MESSAGE_NOT_FOUND` si el mensaje no existe.

## Pruebas

La colección de Postman está en [docs/ChatU.postman_collection.json](docs/ChatU.postman_collection.json) y cubre, en orden, los 10 casos de prueba del ejercicio. Usa las variables `baseUrl`, `userId`, `betoId`, `roomId` y `messageId`.

Con el servidor en marcha, impórtala en Postman y ejecútala completa con el Collection Runner, o córrela desde la terminal:

```bash
pnpm dlx newman run docs/ChatU.postman_collection.json
```

- **Orden:** cada request usa datos de los anteriores, así que hay que ejecutarla completa.
- **Puerto:** `baseUrl` apunta a `http://localhost:3000/api/v1`; cámbiala si tu servidor usa otro puerto.
- **Datos:** cada ejecución crea 2 usuarios, 1 sala y 25 mensajes con un sufijo único, así que se puede repetir sin vaciar la base. Esos datos se quedan guardados para poder revisarlos en MongoDB Compass.
