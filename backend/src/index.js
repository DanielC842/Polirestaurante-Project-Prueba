import 'dotenv/config';
import './models/user.model.js'

import express from 'express';
import { conectDB, sequelize } from './config/connectionPostgreSQL.js';

import userRoutes from './routes/user.routes.js'

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

await conectDB();
await sequelize.sync();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});