import Redis from 'ioredis';
import { env } from './env';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 2000, 30000),
});

// Only log the first error of each disconnected streak to avoid log spam.
let redisErrorLogged = false;
redis.on('connect', () => {
  redisErrorLogged = false;
  console.log('Redis connected');
});
redis.on('error', (err) => {
  if (!redisErrorLogged) {
    console.error('Redis error:', err.message);
    redisErrorLogged = true;
  }
});

export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (err) {
    console.error('Cache read failed:', (err as Error).message);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> => {
  try {
    if (ttlSeconds) {
      await redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    console.error('Cache write failed:', (err as Error).message);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache delete failed:', (err as Error).message);
  }
};

// Delete all keys matching a pattern
export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Cache pattern delete failed:', (err as Error).message);
  }
};

export const getRequiredRedis = async (key: string): Promise<string | null> => {
  return redis.get(key);
};

export const setRequiredRedis = async (
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> => {
  await redis.set(key, value, 'EX', ttlSeconds);
};

export const deleteRequiredRedis = async (key: string): Promise<void> => {
  await redis.del(key);
};

export default redis;
