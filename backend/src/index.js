import 'dotenv/config';
import './models/user.model.js'

import express from 'express';
import { conectDB, sequelize } from './config/connectionPostgreSQL.js';

import userRoutes from './routes/user.routes.js'
import tableRoutes from './routes/mesas.routes.js'
import waiterRoutes from './routes/meseros.routes.js'

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes); 
app.use('/api/waiters', waiterRoutes);  

const PORT = process.env.PORT || 5000;

await conectDB();
await sequelize.sync();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});