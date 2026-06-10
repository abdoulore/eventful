import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CREATOR', 'EVENTEE']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const result = await authService.registerUser(parsed.data);

  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  const result = await authService.loginUser(parsed.data);

  res.status(200).json({ success: true, data: result });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  await authService.requestPasswordReset(parsed.data);

  res.status(200).json({
    success: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  await authService.resetPassword(parsed.data);

  res.status(200).json({ success: true, message: 'Password reset successfully' });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required' });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({ success: true, data: result });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(' ')[1] ?? '';

  await authService.logoutUser(accessToken, req.user!.id);

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
  const user = await authService.getMe(req.user!.id);

  res.status(200).json({ success: true, data: user });
});
