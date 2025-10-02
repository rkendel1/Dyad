/**
 * IndexedDB Cache Implementation
 * 
 * Provides persistent browser caching using IndexedDB
 */

import type { Cache, CacheEntry, CacheOptions } from "../types";

/**
 * IndexedDB cache implementation
 */
export class IndexedDBCache implements Cache {
  private options: Required<CacheOptions>;
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default 5 minutes
      maxSize: options.maxSize || 100,
      storage: options.storage || "indexedDB",
    };
    this.dbName = "dyad_cache";
    this.storeName = "cache_entries";
    
    // Check if IndexedDB is available
    if (typeof window === "undefined" || !window.indexedDB) {
      throw new Error("IndexedDB is not available in this environment");
    }
  }

  /**
   * Initialize the database connection
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: "key" });
          objectStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(key);

        request.onerror = () => {
          reject(new Error("Failed to get item from IndexedDB"));
        };

        request.onsuccess = async () => {
          const entry: CacheEntry<T> | undefined = request.result;

          if (!entry) {
            resolve(null);
            return;
          }

          // Check if entry has expired
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            await this.delete(key);
            resolve(null);
            return;
          }

          resolve(entry.data);
        };
      });
    } catch (error) {
      console.error("IndexedDBCache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const db = await this.initDB();

      // Check and enforce max size
      const count = await this.getCount();
      if (count >= this.options.maxSize) {
        // Remove oldest entry
        await this.removeOldest();
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const objectStore = transaction.objectStore(this.storeName);

        const entry: CacheEntry<T> = {
          key,
          data: value,
          timestamp: Date.now(),
          ttl: ttl || this.options.ttl,
        };

        const request = objectStore.put(entry);

        request.onerror = () => {
          reject(new Error("Failed to set item in IndexedDB"));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error("IndexedDBCache set error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.delete(key);

        request.onerror = () => {
          reject(new Error("Failed to delete item from IndexedDB"));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error("IndexedDBCache delete error:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readwrite");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.clear();

        request.onerror = () => {
          reject(new Error("Failed to clear IndexedDB"));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error("IndexedDBCache clear error:", error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly");
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(key);

        request.onerror = () => {
          reject(new Error("Failed to check item in IndexedDB"));
        };

        request.onsuccess = async () => {
          const entry = request.result;

          if (!entry) {
            resolve(false);
            return;
          }

          // Check if entry has expired
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            await this.delete(key);
            resolve(false);
            return;
          }

          resolve(true);
        };
      });
    } catch (error) {
      console.error("IndexedDBCache has error:", error);
      return false;
    }
  }

  /**
   * Get count of entries in the cache
   */
  private async getCount(): Promise<number> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.count();

      request.onerror = () => {
        reject(new Error("Failed to count items in IndexedDB"));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Remove the oldest entry from the cache
   */
  private async removeOldest(): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const index = objectStore.index("timestamp");
      const request = index.openCursor();

      request.onerror = () => {
        reject(new Error("Failed to find oldest item in IndexedDB"));
      };

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          objectStore.delete(cursor.primaryKey);
          resolve();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const db = await this.initDB();

    return new Promise<{ size: number; maxSize: number; entries: string[] }>((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAllKeys();

      request.onerror = () => {
        reject(new Error("Failed to get stats from IndexedDB"));
      };

      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve({
          size: keys.length,
          maxSize: this.options.maxSize,
          entries: keys,
        });
      };
    });
  }
}
