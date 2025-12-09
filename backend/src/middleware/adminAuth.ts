import { Request, Response, NextFunction } from 'express';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-admin-token'];

  if (!ADMIN_TOKEN) {
    console.warn('⚠️  ADMIN_TOKEN environment variable is not set. Admin endpoints are disabled.');
    return res.status(503).json({ error: 'Admin authentication not configured' });
  }

  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

