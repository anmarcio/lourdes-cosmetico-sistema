
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { Pool } from 'pg';

const app = express();

const port = Number(
  process.env.PUBLIC_PORT ?? process.env.PORT ?? 3001
);

const allowedOrigins = (process.env.PUBLIC_CORS_ORIGINS ??
  'http://localhost:5173,http://localhost:5174,http://localhost:5175')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const uploadsDirectory = path.resolve(
  __dirname,
  '../uploads/products',
);

// Apenas arquivos de imagem da pasta de produtos são disponibilizados.
app.use(
  '/uploads/products',
  express.static(uploadsDirectory, {
    dotfiles: 'deny',
    index: false,
    fallthrough: false,
  }),
);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Erro ao verificar o banco público:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/api/public/products', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        description,
        category,
        price,
        image_url,
        (stock_quantity > 0) AS available
      FROM products
      WHERE active = TRUE
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error('Erro ao carregar produtos públicos:', error);
    res.status(500).json({
      error: 'Erro ao carregar produtos da vitrine.',
    });
  }
});

app.get('/api/public/whatsapp', (_req, res) => {
  const phone = (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '');

  if (!phone) {
    res.status(503).json({
      error: 'Número do WhatsApp não configurado.',
    });
    return;
  }

  res.json({ phone });
});

// Não adicionar rotas administrativas a este servidor.
const server = app.listen(port, () => {
  console.log(`Lourdes Public API running at http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});
