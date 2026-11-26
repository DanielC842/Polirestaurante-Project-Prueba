# Frontend PoliRestaurante (React + Vite)

## Correr en local
1. Levantar el backend (`cd backend && npm run dev`) con `JWT_SECRET`, `CORS_ORIGIN=http://localhost:5173`, `ADMIN_CORREO` y `ADMIN_CONTRASENA` en su `.env`.
2. En esta carpeta: copiar `.env.example` a `.env` (define `VITE_API_URL`), luego `npm install` y `npm run dev`.
3. Abrir http://localhost:5173 e iniciar sesión con el administrador inicial.

## Vistas
- Mesero: crear pedido (salón o para llevar), ver sus pedidos activos, cancelar y marcar entregado.
- Cocina: tablero Pendiente / En preparación / Listo con consulta cada 2 s.
- Administrador: conteo y lista de pedidos en tiempo real, productos y categorías.

## Despliegue
`npm run build` genera `dist/`, que se publica como Static Site en Render con `VITE_API_URL` apuntando a la API.
