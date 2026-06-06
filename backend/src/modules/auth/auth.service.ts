import prisma from '../../config/prisma';
import { getCache, setCache, deleteCache } from '../../config/redis';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middlewares/error.middleware';
import { v4 as uuidv4 } from 'uuid';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'CREATOR' | 'EVENTEE';
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await comparePassword(input.password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Cache user profile for 1 hour
  await setCache(`user:${user.id}`, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }), 3600);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const accessToken = generateAccessToken({
    id: payload.id,
    email: payload.email,
    role: payload.role,
  });

  return { accessToken };
};

export const logoutUser = async (accessToken: string, userId: string) => {
  // Blacklist the access token until it naturally expires
  await setCache(`blacklist:${accessToken}`, '1', 60 * 15);

  // Remove all refresh tokens for this user
  await prisma.refreshToken.deleteMany({ where: { userId } });

  // Clear cached user profile
  await deleteCache(`user:${userId}`);
};

export const getMe = async (userId: string) => {
  // Try cache first
  const cached = await getCache(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) throw new AppError('User not found', 404);

  await setCache(`user:${userId}`, JSON.stringify(user), 3600);

  return user;
};