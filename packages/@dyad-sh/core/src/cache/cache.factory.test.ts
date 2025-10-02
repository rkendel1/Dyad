/**
 * Tests for Cache Factory
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createCache } from "./index";
import { MemoryCache } from "./index";
import { LocalStorageCache } from "./localStorage.cache";
import { IndexedDBCache } from "./indexedDB.cache";

// Mock localStorage
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  get length(): number {
    return this.store.size;
  }
}

// Mock IndexedDB
import "fake-indexeddb/auto";

describe("createCache Factory", () => {
  beforeEach(() => {
    // Setup mock localStorage
    const localStorageMock = new LocalStorageMock();
    global.window = {
      localStorage: localStorageMock as Storage,
      indexedDB: indexedDB,
    } as any;
  });

  describe("default behavior", () => {
    it("should create a MemoryCache by default", () => {
      const cache = createCache();
      expect(cache).toBeInstanceOf(MemoryCache);
    });

    it("should create a MemoryCache when storage is 'memory'", () => {
      const cache = createCache({ storage: "memory" });
      expect(cache).toBeInstanceOf(MemoryCache);
    });
  });

  describe("storage types", () => {
    it("should create a LocalStorageCache when storage is 'localStorage'", () => {
      const cache = createCache({ storage: "localStorage" });
      expect(cache).toBeInstanceOf(LocalStorageCache);
    });

    it("should create an IndexedDBCache when storage is 'indexedDB'", () => {
      const cache = createCache({ storage: "indexedDB" });
      expect(cache).toBeInstanceOf(IndexedDBCache);
    });
  });

  describe("options propagation", () => {
    it("should pass options to MemoryCache", async () => {
      const cache = createCache({ storage: "memory", ttl: 2000, maxSize: 50 });
      await cache.set("key1", "value1");
      const has = await cache.has("key1");
      expect(has).toBe(true);
    });

    it("should pass options to LocalStorageCache", async () => {
      const cache = createCache({ storage: "localStorage", ttl: 2000, maxSize: 50 });
      await cache.set("key1", "value1");
      const has = await cache.has("key1");
      expect(has).toBe(true);
    });

    it("should pass options to IndexedDBCache", async () => {
      const cache = createCache({ storage: "indexedDB", ttl: 2000, maxSize: 50 });
      await cache.set("key1", "value1");
      const has = await cache.has("key1");
      expect(has).toBe(true);
    });
  });

  describe("unified interface", () => {
    it("should work with MemoryCache through the Cache interface", async () => {
      const cache = createCache({ storage: "memory" });
      
      await cache.set("key1", "value1");
      expect(await cache.get("key1")).toBe("value1");
      expect(await cache.has("key1")).toBe(true);
      
      await cache.delete("key1");
      expect(await cache.has("key1")).toBe(false);
    });

    it("should work with LocalStorageCache through the Cache interface", async () => {
      const cache = createCache({ storage: "localStorage" });
      
      await cache.set("key1", "value1");
      expect(await cache.get("key1")).toBe("value1");
      expect(await cache.has("key1")).toBe(true);
      
      await cache.delete("key1");
      expect(await cache.has("key1")).toBe(false);
    });

    it("should work with IndexedDBCache through the Cache interface", async () => {
      const cache = createCache({ storage: "indexedDB" });
      
      await cache.set("key1", "value1");
      expect(await cache.get("key1")).toBe("value1");
      expect(await cache.has("key1")).toBe(true);
      
      await cache.delete("key1");
      expect(await cache.has("key1")).toBe(false);
    });
  });
});
