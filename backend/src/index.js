import 'dotenv/config';
import express from 'express';
import { conectDB } from './config/connectionPostgreSQL.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

await conectDB();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});