import { AppError } from '../middlewares/error.middleware';

export const getStringParam = (value: unknown, name: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AppError(`Invalid ${name}`, 400);
  }

  return value;
};