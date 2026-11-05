# ChatU API

API REST de mensajería por salas, construida con Node.js, Express 5, MongoDB y Mongoose 9.

- Especificación del ejercicio: [docs/enunciado.md](docs/enunciado.md)
- Reparto del trabajo e instrucciones para agentes: [AGENTS.md](AGENTS.md)

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

Todas las rutas llevan el prefijo `/api/v1`. Un endpoint que aún no está implementado responde `501 NOT_IMPLEMENTED`.

| # | Método | Ruta | Descripción | Respuesta OK | Nivel |
|---|---|---|---|---|---|
| 1 | POST | `/users` | Registrar usuario | 201 | Obligatorio |
| 2 | GET | `/users` | Listar usuarios (filtro `?status=online`) | 200 | Obligatorio |
| 3 | GET | `/users/:id` | Obtener un usuario | 200 | Obligatorio |
| 4 | PATCH | `/users/:id/status` | Cambiar estado | 200 | Opcional |
| 5 | POST | `/rooms` | Crear sala (body incluye `ownerId`) | 201 | Obligatorio |
| 6 | GET | `/rooms` | Listar salas públicas con número de miembros | 200 | Obligatorio |
| 7 | GET | `/rooms/:id` | Detalle de sala con sus miembros | 200 | Obligatorio |
| 8 | POST | `/rooms/:id/join` | Unirse a una sala (body: `userId`) | 200 | Obligatorio |
| 9 | POST | `/rooms/:id/leave` | Salir de una sala | 200 | Opcional |
| 10 | DELETE | `/rooms/:id` | Eliminar sala y sus mensajes (solo owner) | 204 | Opcional |
| 11 | POST | `/rooms/:id/messages` | Enviar mensaje (body: `senderId`, `content`) | 201 | Obligatorio |
| 12 | GET | `/rooms/:id/messages` | Listar mensajes (`?page=1&limit=20`), más recientes primero | 200 | Obligatorio |
| 13 | PUT | `/messages/:id` | Editar contenido (marca `edited: true`) | 200 | Obligatorio |
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

## Pruebas

La colección de Postman estará en `docs/ChatU.postman_collection.json` y cubre los 10 casos del enunciado.
