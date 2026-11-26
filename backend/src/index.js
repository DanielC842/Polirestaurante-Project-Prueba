import 'dotenv/config';
import './models/user.model.js'
import './models/category.model.js'
import './models/product.model.js'
import './models/status.model.js'
import './models/transition.model.js'
import './models/order.model.js'
import './models/orderDetail.model.js'

import express from 'express';
import cors from 'cors';
import { conectDB, sequelize } from './config/connectionPostgreSQL.js';
import { dbSeedStatuses, dbSeedTransitions } from './service/status.service.js';
import { dbSeedFirstAdmin, dbNormalizeStoredEmails } from './service/auth.service.js';

import authRoutes from './routes/auth.routes.js'

import userRoutes from './routes/user.routes.js'

import tableRoutes from './routes/mesas.routes.js'
import waiterRoutes from './routes/meseros.routes.js'
import cookRoutes from './routes/cocineros.routes.js'
import adminRoutes from './routes/admin.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import statusRoutes from './routes/status.routes.js'
import orderRoutes from './routes/order.routes.js'


const app = express();

// CORS: el front en React se despliega aparte (ADR-001/ADR-002).
// CORS_ORIGIN admite varios orígenes separados por coma.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
// Si la petición no trae JSON, req.body queda vacío en lugar de undefined
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/tables', tableRoutes); 
app.use('/api/waiters', waiterRoutes);  
app.use('/api/cooks', cookRoutes); 
app.use('/api/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/orders', orderRoutes);

// Ruta inexistente: respuesta JSON en lugar de la página HTML de Express
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejador de errores: siempre responde JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'La petición es demasiado grande' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});


const PORT = process.env.PORT || 5000;

await conectDB();
await sequelize.sync();
await dbSeedStatuses();
await dbSeedTransitions();
await dbNormalizeStoredEmails();
await dbSeedFirstAdmin();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});