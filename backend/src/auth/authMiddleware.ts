
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthTokenPayload {
  id: number;
  username: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Autenticação necessária.'
    });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      error: 'Autenticação não configurada no servidor.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'number' ||
      typeof decoded.username !== 'string'
    ) {
      res.status(401).json({
        error: 'Token de acesso inválido.'
      });
      return;
    }

    req.auth = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  } catch {
    res.status(401).json({
      error: 'Token inválido ou expirado.'
    });
  }
}

