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
import { dbSeedStatuses, dbSeedTransitions } from './service/status.service.js';

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
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', userRoutes);

app.use('/api/tables', tableRoutes); 
app.use('/api/waiters', waiterRoutes);  
app.use('/api/cooks', cookRoutes); 
app.use('/api/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/orders', orderRoutes);


const PORT = process.env.PORT || 5000;

await conectDB();
await sequelize.sync();
await dbSeedStatuses();
await dbSeedTransitions();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});