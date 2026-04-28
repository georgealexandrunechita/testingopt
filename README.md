# UD4 - API Characters (Testing + OpenAPI + Auth)

API REST en Node.js + Express con modelos Mongoose, autenticación JWT, pruebas con Mocha/Chai y especificación OpenAPI para el modelo `Character`.

---

## Requisitos

- Node.js y npm
- MongoDB en ejecución local (por defecto en `mongodb://localhost:27017/otradb`)

---

## Instalación

```bash
npm install
```

Copia el archivo de ejemplo de variables de entorno y rellena los valores:

```bash
cp .env.example .env
```

---

## Variables de entorno (`.env`)

El archivo `.env` contiene información confidencial y **no se sube al repositorio** (está en `.gitignore`).

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Clave secreta para firmar los access tokens |
| `JWT_REFRESH_SECRET` | Clave secreta para firmar los refresh tokens |
| `MONGODB_URI` | Cadena de conexión a MongoDB |

---

## Arrancar el servidor

```bash
node index.js
```

El servidor escucha en el puerto `8080`.

---

## Modelos

### Character

| Campo | Tipo | Restricciones |
|---|---|---|
| `name` | String | Obligatorio, 2–20 caracteres |
| `weapon` | String | Obligatorio |
| `job` | String | Obligatorio, enum: `Fighter`, `Mage`, `Healer`, `Monk` |
| `level` | Number | Obligatorio, 1–99 |

### Weapon

| Campo | Tipo | Restricciones |
|---|---|---|
| `name` | String | Obligatorio, único, 2–40 caracteres |
| `damage` | Number | Obligatorio, 1–100 |

### User

| Campo | Tipo | Restricciones |
|---|---|---|
| `username` | String | Obligatorio, único, 3–30 caracteres |
| `password` | String | Obligatorio, mínimo 6 caracteres (se guarda cifrada con bcrypt) |
| `roles` | [String] | Valores posibles: `user`, `admin`. Por defecto: `['user']` |
| `refreshToken` | String | Se genera al hacer login y se invalida al hacer logout |

---

## Autenticación

La autenticación se basa en **JWT** con dos tokens:

- **Access token**: corta duración (15 minutos), se envía en cada petición protegida.
- **Refresh token**: larga duración (7 días), se usa para obtener un nuevo access token sin volver a iniciar sesión. Se almacena en la base de datos para poder invalidarlo.

### Rutas de autenticación (públicas)

#### `POST /auth/register`

Registra un nuevo usuario.

**Body:**
```json
{
  "username": "cloud",
  "password": "123456",
  "roles": ["user"]
}
```

`roles` es opcional. Si no se indica, se asigna `["user"]` por defecto. Valores posibles: `user`, `admin`.

**Respuestas:**
- `201` — Usuario creado correctamente
- `400` — Username ya en uso o datos inválidos

---

#### `POST /auth/login`

Inicia sesión y devuelve los dos tokens.

**Body:**
```json
{
  "username": "cloud",
  "password": "123456"
}
```

**Respuesta `200`:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

- `401` — Credenciales incorrectas

---

#### `POST /auth/refresh`

Obtiene un nuevo access token usando el refresh token.

**Body:**
```json
{
  "refreshToken": "<jwt>"
}
```

**Respuesta `200`:**
```json
{
  "accessToken": "<jwt>"
}
```

- `401` — No se ha enviado refresh token
- `403` — Refresh token inválido o no reconocido

---

#### `POST /auth/logout`

Invalida el refresh token en la base de datos.

**Body:**
```json
{
  "refreshToken": "<jwt>"
}
```

**Respuesta:** `204`

---

### Cómo usar el access token

En todas las rutas protegidas hay que incluir el access token en la cabecera:

```
Authorization: Bearer <accessToken>
```

---

## Rutas de Characters

### Protección por roles

| Ruta | Método | Protección |
|---|---|---|
| `/characters` | GET | Login requerido (cualquier rol) |
| `/characters/:id` | GET | Login requerido (cualquier rol) |
| `/characters` | POST | Rol `admin` requerido |
| `/characters/:id` | PUT | Rol `admin` requerido |
| `/characters/:id` | DELETE | Rol `admin` requerido |

### Detalle de rutas

#### `GET /characters`
Devuelve todos los personajes.
- `200` — Lista de personajes
- `401` — Sin token
- `403` — Token inválido

#### `GET /characters/:id`
Devuelve un personaje por su ID.
- `200` — Personaje encontrado
- `404` — No encontrado
- `401` / `403` — Sin token o token inválido

#### `POST /characters`
Crea un nuevo personaje. Requiere rol `admin`.

**Body:**
```json
{
  "name": "Cloud",
  "job": "Fighter",
  "weapon": "Buster Sword",
  "level": 10
}
```

- `201` — Personaje creado
- `400` — Nombre duplicado o datos inválidos
- `401` — Sin token
- `403` — Token inválido o rol insuficiente

#### `PUT /characters/:id`
Actualiza un personaje existente. Requiere rol `admin`.
- `204` — Actualizado correctamente
- `400` — Nombre duplicado o datos inválidos
- `404` — No encontrado
- `401` / `403` — Sin token o rol insuficiente

#### `DELETE /characters/:id`
Elimina un personaje. Requiere rol `admin`.
- `204` — Eliminado correctamente
- `404` — No encontrado
- `401` / `403` — Sin token o rol insuficiente

---

## Tests

Las pruebas usan **Mocha** como test runner y **Chai** como librería de aserciones. Prueban directamente los modelos Mongoose contra una base de datos real.

```bash
npm test
```

### Cobertura de tests

**`test.character.test.js`**
- Crea un personaje válido
- Falla si falta el campo `name`
- Falla si `job` no está en el enum
- Falla si `level` es menor que 1
- Actualiza un personaje correctamente

**`test.weapon.test.js`**
- Crea un arma válida
- No permite `damage` menor que 1
- No permite `name` demasiado corto (menos de 2 caracteres)
- No permite `name` duplicado
- Actualiza un arma correctamente

---

## Especificación OpenAPI

El archivo `openapi-character.yml` documenta la API del modelo `Character` siguiendo la especificación **OpenAPI 3.0.3**. Incluye:

- Todos los endpoints de `/characters` y `/characters/:id`
- Esquemas `Character` (respuesta) y `CharacterInput` (body de entrada)
- Códigos de respuesta para cada operación

---

## Estructura del proyecto

```
.
├── middleware/
│   └── auth.js          # verifyToken y requireRole
├── models/
│   ├── Character.js
│   ├── User.js
│   └── Weapon.js
├── routes/
│   └── auth.js          # register, login, refresh, logout
├── test/
│   ├── test.character.test.js
│   └── test.weapon.test.js
├── views/
├── .env                 # Variables confidenciales (no en git)
├── .env.example         # Plantilla de variables de entorno
├── .gitignore
├── db.js
├── index.js
├── openapi-character.yml
└── package.json
```

---

## Dependencias principales

| Paquete | Uso |
|---|---|
| `express` | Framework HTTP |
| `mongoose` | ODM para MongoDB |
| `dotenv` | Carga de variables de entorno desde `.env` |
| `jsonwebtoken` | Generación y verificación de JWTs |
| `bcryptjs` | Cifrado de contraseñas |
| `mocha` | Test runner |
| `chai` | Aserciones en tests |
