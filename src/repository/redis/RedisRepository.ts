import redis from "../../config/redis";
import { IUserRepository } from "../user";
import { RedisEntity } from "./redis.entity";
import { RedisHash } from "./redis.type";

export abstract class RedisRepository<T extends RedisEntity> implements IUserRepository{

  protected abstract readonly prefix: string;
  protected abstract readonly ttlSeconds: number;

  protected getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async save(entity: T): Promise<void> {
    const key = this.getKey(entity.id);

    const hash = this.serialize(entity);

    await redis.hset(key, hash);
    await redis.expire(key, this.ttlSeconds);
  }

  async getById(id: string): Promise<T | null> {
    const key = this.getKey(id);

    const hash = await redis.hgetall(key);
    if (Object.keys(hash).length === 0) {
      return null;
    }

    return this.deserialize(hash);
  }

  async delete(id: string): Promise<void> {
    await redis.del(this.getKey(id));
  }
  

  // -----------------------
  // SERIALIZATION
  // -----------------------

  protected serialize(entity: T): RedisHash {
    const hash: RedisHash = {};

    for (const key in entity) {
      const value = entity[key as keyof T];

      if (value instanceof Date) {
        hash[key] = value.getTime().toString();
      } else {
        hash[key] = String(value);
      }
    }

    return hash;
  }

  // -----------------------
  // DESERIALIZATION
  // -----------------------

  protected deserialize(hash: RedisHash): T {
    const entity: Partial<T> = {};

    for (const key in hash) {
      const value = hash[key];

      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        entity[key as keyof T] = new Date(numeric) as any;
      } else {
        entity[key as keyof T] = value as any;
      }
    }

    return entity as T;
  }
}
