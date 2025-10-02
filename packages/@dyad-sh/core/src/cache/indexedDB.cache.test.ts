/**
 * Tests for IndexedDB Cache Implementation
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { IndexedDBCache } from "./indexedDB.cache";

// Mock IndexedDB using fake-indexeddb
import "fake-indexeddb/auto";

describe("IndexedDBCache", () => {
  let cache: IndexedDBCache;

  beforeEach(() => {
    cache = new IndexedDBCache({ ttl: 1000, maxSize: 3 });
  });

  afterEach(async () => {
    await cache.clear();
  });

  describe("set and get", () => {
    it("should store and retrieve values", async () => {
      await cache.set("key1", "value1");
      const value = await cache.get<string>("key1");
      expect(value).toBe("value1");
    });

    it("should store and retrieve complex objects", async () => {
      const obj = { name: "test", value: 123, nested: { data: true } };
      await cache.set("key1", obj);
      const value = await cache.get<typeof obj>("key1");
      expect(value).toEqual(obj);
    });

    it("should return null for non-existent keys", async () => {
      const value = await cache.get("nonexistent");
      expect(value).toBeNull();
    });
  });

  describe("TTL expiration", () => {
    it("should expire entries after TTL", async () => {
      await cache.set("key1", "value1", 100);
      
      // Should exist immediately
      let value = await cache.get<string>("key1");
      expect(value).toBe("value1");

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      value = await cache.get<string>("key1");
      expect(value).toBeNull();
    });

    it("should use default TTL when not specified", async () => {
      await cache.set("key1", "value1");
      const has = await cache.has("key1");
      expect(has).toBe(true);
    });
  });

  describe("maxSize enforcement", () => {
    it("should remove oldest entries when max size is reached", async () => {
      await cache.set("key1", "value1");
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await cache.set("key2", "value2");
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await cache.set("key3", "value3");
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // All should exist
      expect(await cache.has("key1")).toBe(true);
      expect(await cache.has("key2")).toBe(true);
      expect(await cache.has("key3")).toBe(true);

      // Adding a 4th should remove the oldest (key1)
      await cache.set("key4", "value4");
      
      expect(await cache.has("key1")).toBe(false);
      expect(await cache.has("key2")).toBe(true);
      expect(await cache.has("key3")).toBe(true);
      expect(await cache.has("key4")).toBe(true);
    });
  });

  describe("delete", () => {
    it("should delete entries", async () => {
      await cache.set("key1", "value1");
      expect(await cache.has("key1")).toBe(true);

      await cache.delete("key1");
      expect(await cache.has("key1")).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all entries", async () => {
      await cache.set("key1", "value1");
      await cache.set("key2", "value2");
      await cache.set("key3", "value3");

      expect(await cache.has("key1")).toBe(true);
      expect(await cache.has("key2")).toBe(true);
      expect(await cache.has("key3")).toBe(true);

      await cache.clear();

      expect(await cache.has("key1")).toBe(false);
      expect(await cache.has("key2")).toBe(false);
      expect(await cache.has("key3")).toBe(false);
    });
  });

  describe("has", () => {
    it("should return true for existing keys", async () => {
      await cache.set("key1", "value1");
      expect(await cache.has("key1")).toBe(true);
    });

    it("should return false for non-existent keys", async () => {
      expect(await cache.has("nonexistent")).toBe(false);
    });

    it("should return false for expired keys", async () => {
      await cache.set("key1", "value1", 100);
      expect(await cache.has("key1")).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cache.has("key1")).toBe(false);
    });
  });

  describe("getStats", () => {
    it("should return cache statistics", async () => {
      await cache.set("key1", "value1");
      await cache.set("key2", "value2");

      const stats = await cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(stats.entries).toContain("key1");
      expect(stats.entries).toContain("key2");
    });
  });
});
