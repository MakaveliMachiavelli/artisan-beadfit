import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { PrismaUserRepository, PrismaSessionRepository } from '../db/repositories/prisma';

const authRouter = Router();
const userRepo = new PrismaUserRepository();
const sessionRepo = new PrismaSessionRepository();

const SESSION_COOKIE_NAME = 'serene_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Middleware to attach user to request
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const session = await sessionRepo.findByToken(token);
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await userRepo.findById(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to req object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return next();
  }

  try {
    const session = await sessionRepo.findByToken(token);
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return next();
    }

    const user = await userRepo.findById(session.userId);
    if (user) {
      (req as any).user = user;
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    const existing = await userRepo.findByEmail(validated.email);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user = await userRepo.create({
      email: validated.email,
      passwordHash,
      name: validated.name,
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    
    await sessionRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors || error.issues });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const user = await userRepo.findByEmail(validated.email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    
    await sessionRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors || error.issues });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/logout', async (req, res) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (token) {
    try {
      await sessionRepo.deleteByToken(token);
    } catch (e) {
      console.error('Logout error:', e);
    }
  }
  
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ success: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  });
});

export { authRouter };
