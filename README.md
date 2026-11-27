# API de productos con JWT (Actividades 5 y 6)

API REST en Node.js + Express + MySQL. Solo quien inicia sesión puede crear,
cambiar o borrar productos, y solo un **admin** puede borrar.

## Estructura

```
Programaci-n-Web/
├── package.json
├── .env                 # claves: NUNCA va a git
├── .env.example         # plantilla del .env: sí va
├── tienda.sql           # crea la base, productos y usuarios
├── api-tienda.postman_collection.json
└── src/                 # EL BACK: la API
    ├── server.js        # solo monta los routers
    ├── db.js
    ├── validaciones.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── productos.routes.js
    │   └── categorias.routes.js
    └── middlewares/
        └── auth.middleware.js
```

## Cómo encenderla

1. Ejecuta `tienda.sql` en MySQL Workbench (crea la base `tienda` y sus tablas).
2. Copia `.env.example` como `.env` y pon tu clave de MySQL y un `JWT_SECRET`.
3. En la terminal:
   ```
   npm install
   npm start
   ```
   Debe salir `Servidor listo en http://localhost:3000`.

## Rutas

| Método | Ruta | Protección | Respuestas |
|---|---|---|---|
| POST | `/registro` | libre | 201 creado · 400 datos malos · 409 email repetido |
| POST | `/login` | libre | 200 `{ token }` · 401 email o clave incorrectos |
| GET | `/productos` (`?max=50000`) | libre | 200 |
| GET | `/productos/:id` | libre | 200 · 404 |
| POST | `/productos` | token | 201 · 400 · 401 |
| PUT | `/productos/:id` | token | 200 · 400 · 401 · 404 |
| PATCH | `/productos/:id` | token | 200 · 400 · 401 · 404 |
| DELETE | `/productos/:id` | token + admin | 204 · 401 · 403 · 404 |
| GET | `/categorias` | libre | 200 |
| GET | `/categorias/:nombre/productos` | libre | 200 · 404 |

El token se envía en Postman en **Authorization → Bearer Token**.

## Usuarios y admin

Todo usuario nuevo de `/registro` queda con rol `usuario`.
`tienda.sql` ya crea un administrador de prueba:
**admin@tienda.com / admin123**.

Para volver admin a otro usuario ya registrado:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'correo@ejemplo.com';
```

Después hay que volver a hacer login, porque el rol viaja dentro del token.

## Pruebas en Postman

Importa `api-tienda.postman_collection.json` y corre las carpetas en orden.
Los tokens se guardan solos al hacer login.

- Sin token → **401**
- Usuario normal borra → **403**
- Admin borra → **204**
