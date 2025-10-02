/**
 * LocalStorage Cache Implementation
 * 
 * Provides persistent browser caching using localStorage
 */

import type { Cache, CacheEntry, CacheOptions } from "../types";

/**
 * LocalStorage cache implementation
 */
export class LocalStorageCache implements Cache {
  private options: Required<CacheOptions>;
  private prefix: string;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: options.maxSize || 100,
      storage: options.storage || "localStorage",
    };
    this.prefix = "dyad_cache_";
    
    // Check if localStorage is available
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("LocalStorage is not available in this environment");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if entry has expired
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("LocalStorageCache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      // Enforce max size by removing oldest entries
      const keys = this.getAllKeys();
      if (keys.length >= this.options.maxSize) {
        // Find and remove the oldest entry
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;

        for (const k of keys) {
          const item = localStorage.getItem(this.prefix + k);
          if (item) {
            const entry = JSON.parse(item);
            if (entry.timestamp < oldestTimestamp) {
              oldestTimestamp = entry.timestamp;
              oldestKey = k;
            }
          }
        }

        if (oldestKey) {
          await this.delete(oldestKey);
        }
      }

      const entry: CacheEntry<T> = {
        key,
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.options.ttl,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error("LocalStorageCache set error:", error);
      // If quota exceeded, try to clear some space
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        const keys = this.getAllKeys();
        if (keys.length > 0) {
          await this.delete(keys[0]);
          // Try again
          const entry: CacheEntry<T> = {
            key,
            data: value,
            timestamp: Date.now(),
            ttl: ttl || this.options.ttl,
          };
          localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        }
      }
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    const keys = this.getAllKeys();
    for (const key of keys) {
      localStorage.removeItem(this.prefix + key);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      
      if (!item) {
        return false;
      }

      const entry = JSON.parse(item);

      // Check if entry has expired
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error("LocalStorageCache has error:", error);
      return false;
    }
  }

  /**
   * Get all cache keys (without prefix)
   */
  private getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const keys = this.getAllKeys();
    return {
      size: keys.length,
      maxSize: this.options.maxSize,
      entries: keys,
    };
  }
}
