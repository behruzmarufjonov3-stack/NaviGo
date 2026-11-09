import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { CONFIG } from '../config';
import { dbStore } from '../db/store';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.middleware';

export const authRouter = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post('/register', async (req, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { email, name, password } = parsed.data;
    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = dbStore.createUser({
      email,
      name,
      passwordHash,
      role: 'USER'
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, name: user.name },
      CONFIG.jwtSecret,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

authRouter.post('/login', async (req, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { email, password } = parsed.data;
    const user = dbStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email, name: user.name },
      CONFIG.jwtSecret,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { passwordHash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehiclePlate: z.string().optional()
});

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const updated = dbStore.updateUser(req.user.id, parsed.data);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...safeUser } = updated;
    return res.json({ user: safeUser, message: 'Profile updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Profile update failed', message: err.message });
  }
});

authRouter.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const parsed = ChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { oldPassword, newPassword } = parsed.data;
    const user = dbStore.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const matches = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!matches) {
      return res.status(400).json({ error: "Eski parol noto'g'ri kiritildi" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    dbStore.updateUser(user.id, { passwordHash: newHash });

    return res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (err: any) {
    return res.status(500).json({ error: 'Password change failed', message: err.message });
  }
});
