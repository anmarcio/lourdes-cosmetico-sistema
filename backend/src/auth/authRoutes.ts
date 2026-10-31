
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

router.post('/login', async (req, res) => {
  try {
    const username =
      typeof req.body?.username === 'string'
        ? req.body.username.trim()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!username || !password) {
      res.status(400).json({
        error: 'Informe o usuário e a senha.'
      });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, username, password_hash
       FROM admin_users
       WHERE username = $1 AND active = TRUE
       LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      res.status(401).json({
        error: 'Usuário ou senha inválidos.'
      });
      return;
    }

    const admin = rows[0] as {
      id: number;
      username: string;
      password_hash: string;
    };

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      res.status(401).json({
        error: 'Usuário ou senha inválidos.'
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        error: 'Autenticação não configurada no servidor.'
      });
      return;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username
      },
      secret,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Não foi possível realizar o login.'
    });
  }
});

export default router;
