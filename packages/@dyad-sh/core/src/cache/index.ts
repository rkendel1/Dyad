/**
 * Cache Implementation
 * 
 * Provides offline caching support for Dyad clients
 */

import type { Cache, CacheEntry, CacheOptions } from "../types";

/**
 * In-memory cache implementation
 */
export class MemoryCache implements Cache {
  private storage: Map<string, CacheEntry<any>>;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.storage = new Map();
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: options.maxSize || 100,
      storage: options.storage || "memory",
    };
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.storage.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Enforce max size by removing oldest entries
    if (this.storage.size >= this.options.maxSize) {
      const oldestKey = this.storage.keys().next().value;
      if (oldestKey) {
        this.storage.delete(oldestKey);
      }
    }

    const entry: CacheEntry<T> = {
      key,
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
    };

    this.storage.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.storage.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.storage.size,
      maxSize: this.options.maxSize,
      entries: Array.from(this.storage.keys()),
    };
  }
}

/**
 * Create a cache instance
 */
export function createCache(options: CacheOptions = {}): Cache {
  return new MemoryCache(options);
}
