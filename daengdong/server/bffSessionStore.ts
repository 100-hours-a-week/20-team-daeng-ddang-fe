import { randomUUID } from "node:crypto";
import { createClient } from "redis";

export interface BffSessionData {
  accessToken: string;
  createdAt: number;
}

const sessions = new Map<string, BffSessionData>();
const REDIS_URL = process.env.REDIS_URL;
const SESSION_KEY_PREFIX = "bff:session:";
const SESSION_TTL_SECONDS = Number(process.env.BFF_SESSION_TTL_SECONDS ?? 60 * 60 * 24);

type RedisClientInstance = ReturnType<typeof createClient>;

let redisClient: RedisClientInstance | null = null;
let redisConnectPromise: Promise<RedisClientInstance | null> | null = null;

const getSessionKey = (sid: string) => `${SESSION_KEY_PREFIX}${sid}`;

const resetRedisClient = async () => {
  if (!redisClient) {
    return;
  }

  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch {
    // Ignore cleanup errors and keep memory fallback path.
  } finally {
    redisClient = null;
  }
};

const getRedisClient = async (): Promise<RedisClientInstance | null> => {
  if (!REDIS_URL) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    redisConnectPromise = (async () => {
      try {
        const client = createClient({ url: REDIS_URL });
        client.on("error", (error) => {
          console.error("[BFF Session] Redis error:", error);
        });
        await client.connect();
        redisClient = client;
        console.log("[BFF Session] Redis connected.");
        return client;
      } catch (error) {
        console.error("[BFF Session] Redis connection failed. Fallback to memory store.", error);
        redisClient = null;
        return null;
      } finally {
        redisConnectPromise = null;
      }
    })();
  }

  return redisConnectPromise;
};

export async function createBffSession(data: BffSessionData): Promise<string> {
  const sid = randomUUID();
  const client = await getRedisClient();

  if (client) {
    try {
      await client.set(getSessionKey(sid), JSON.stringify(data), {
        EX: SESSION_TTL_SECONDS,
      });
      return sid;
    } catch (error) {
      console.error("[BFF Session] Redis set failed. Fallback to memory store.", error);
      await resetRedisClient();
    }
  }

  sessions.set(sid, data);
  return sid;
}

export async function getBffSession(sid: string | undefined | null): Promise<BffSessionData | undefined> {
  if (!sid) return undefined;

  const client = await getRedisClient();

  if (client) {
    try {
      const raw = await client.get(getSessionKey(sid));
      if (!raw) return undefined;

      try {
        return JSON.parse(raw) as BffSessionData;
      } catch {
        return undefined;
      }
    } catch (error) {
      console.error("[BFF Session] Redis get failed. Fallback to memory store.", error);
      await resetRedisClient();
      return undefined;
    }
  }

  return sessions.get(sid);
}

export async function updateBffSession(sid: string | undefined | null, data: BffSessionData): Promise<void> {
  if (!sid) return;

  const client = await getRedisClient();

  if (client) {
    try {
      await client.set(getSessionKey(sid), JSON.stringify(data), {
        EX: SESSION_TTL_SECONDS,
      });
      return;
    } catch (error) {
      console.error("[BFF Session] Redis update failed. Fallback to memory store.", error);
      await resetRedisClient();
    }
  }

  sessions.set(sid, data);
}

export async function deleteBffSession(sid: string | undefined | null): Promise<void> {
  if (!sid) return;

  const client = await getRedisClient();

  if (client) {
    try {
      await client.del(getSessionKey(sid));
      return;
    } catch (error) {
      console.error("[BFF Session] Redis delete failed. Fallback to memory store.", error);
      await resetRedisClient();
    }
  }

  sessions.delete(sid);
}

