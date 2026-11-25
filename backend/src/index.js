import 'dotenv/config';
import './models/user.model.js'
import './models/category.model.js'
import './models/product.model.js'
import './models/status.model.js'
import './models/transition.model.js'
import './models/order.model.js'
import './models/orderDetail.model.js'

import express from 'express';
import { conectDB, sequelize } from './config/connectionPostgreSQL.js';
import { dbSeedStatuses } from './service/status.service.js';

import userRoutes from './routes/user.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import statusRoutes from './routes/status.routes.js'
import orderRoutes from './routes/order.routes.js'

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

await conectDB();
await sequelize.sync();
await dbSeedStatuses();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});