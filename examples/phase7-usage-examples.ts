/**
 * Phase 7 Enhancements - Usage Examples
 * 
 * This file demonstrates how to use the new SSE types and cache backends
 * implemented in Phase 7 of the Dyad modular API enhancements.
 */

import { 
  createCache, 
  createHttpClient,
  type SSEMessage,
  type SSEEventHandlers,
} from "@dyad-sh/core";

// ============================================================================
// Example 1: Using Different Cache Backends
// ============================================================================

/**
 * Memory Cache - Default, works everywhere
 */
async function exampleMemoryCache() {
  const cache = createCache({
    storage: "memory",
    ttl: 300000, // 5 minutes
    maxSize: 100,
  });

  // Store data
  await cache.set("user:123", { id: 123, name: "John Doe" });
  
  // Retrieve data
  const user = await cache.get("user:123");
  console.log(user); // { id: 123, name: "John Doe" }
  
  // Check if exists
  const exists = await cache.has("user:123");
  console.log(exists); // true
}

/**
 * LocalStorage Cache - Persistent browser storage
 * Best for: Small amounts of data that need to persist
 */
async function exampleLocalStorageCache() {
  // Only works in browser environment
  if (typeof window === "undefined") {
    console.log("LocalStorage requires browser environment");
    return;
  }

  const cache = createCache({
    storage: "localStorage",
    ttl: 3600000, // 1 hour
    maxSize: 50, // Keep it small due to ~5MB limit
  });

  // Store user preferences
  await cache.set("user:preferences", {
    theme: "dark",
    language: "en",
    notifications: true,
  });

  // Retrieve on page reload - data persists!
  const prefs = await cache.get("user:preferences");
  console.log(prefs);
}

/**
 * IndexedDB Cache - Large capacity persistent storage
 * Best for: Large amounts of data that need to persist
 */
async function exampleIndexedDBCache() {
  // Only works in browser environment
  if (typeof window === "undefined") {
    console.log("IndexedDB requires browser environment");
    return;
  }

  const cache = createCache({
    storage: "indexedDB",
    ttl: 86400000, // 24 hours
    maxSize: 1000, // Can handle much more data
  });

  // Store large dataset
  const apps = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `App ${i}`,
    data: "Large application data...",
  }));

  await cache.set("apps:list", apps);

  // Retrieve large dataset
  const cachedApps = await cache.get("apps:list");
  console.log(`Cached ${cachedApps?.length} apps`);
}

// ============================================================================
// Example 2: Environment-Aware Caching
// ============================================================================

/**
 * Automatically choose the best cache backend based on environment
 */
function createOptimalCache() {
  // Check if we're in a browser
  if (typeof window !== "undefined") {
    // Prefer IndexedDB for its larger capacity
    if (window.indexedDB) {
      return createCache({
        storage: "indexedDB",
        ttl: 3600000, // 1 hour
        maxSize: 500,
      });
    }
    
    // Fallback to localStorage
    if (window.localStorage) {
      return createCache({
        storage: "localStorage",
        ttl: 3600000,
        maxSize: 50,
      });
    }
  }
  
  // Default to memory cache for Node.js or as final fallback
  return createCache({
    storage: "memory",
    ttl: 3600000,
    maxSize: 100,
  });
}

// ============================================================================
// Example 3: Caching with HTTP Client
// ============================================================================

async function exampleCachingWithClient() {
  const client = createHttpClient({
    baseUrl: "http://localhost:3000",
  });

  const cache = createOptimalCache();

  // Fetch apps with caching
  async function getApps() {
    const cacheKey = "apps:list";
    
    // Try to get from cache first
    let apps = await cache.get(cacheKey);
    
    if (apps) {
      console.log("Loaded from cache");
      return apps;
    }
    
    // Not in cache, fetch from API
    console.log("Fetching from API");
    apps = await client.apps.listApps();
    
    // Store in cache for next time
    await cache.set(cacheKey, apps);
    
    return apps;
  }

  const apps = await getApps();
  console.log(`Got ${apps.length} apps`);
}

// ============================================================================
// Example 4: SSE Type Definitions (for future implementation)
// ============================================================================

/**
 * These types are now available for implementing SSE clients
 */
function exampleSSETypes() {
  // Define SSE event handlers
  const handlers: SSEEventHandlers = {
    onOpen: () => {
      console.log("SSE connection opened");
    },
    
    onMessage: (message: SSEMessage) => {
      console.log("Received SSE message:", message.data);
      
      if (message.event === "update") {
        console.log("Received update event");
      }
    },
    
    onError: (error: Error) => {
      console.error("SSE error:", error);
    },
    
    onClose: () => {
      console.log("SSE connection closed");
    },
  };

  // Future SSE client would use these handlers
  // const sseClient = createSSEClient({
  //   url: "http://localhost:3000/events",
  //   handlers,
  //   options: {
  //     withCredentials: true,
  //   },
  // });
}

// ============================================================================
// Example 5: Cache Invalidation Strategies
// ============================================================================

/**
 * Implement cache invalidation patterns
 */
class CacheManager {
  constructor(private cache = createOptimalCache()) {}

  /**
   * Set with custom TTL
   */
  async setWithTTL(key: string, value: any, ttlMs: number) {
    await this.cache.set(key, value, ttlMs);
  }

  /**
   * Invalidate specific cache entry
   */
  async invalidate(key: string) {
    await this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries with a specific prefix
   */
  async invalidateByPrefix(prefix: string) {
    // Note: This is a simple example. Real implementation would need
    // to track keys or use a more sophisticated approach
    await this.cache.clear();
  }

  /**
   * Refresh cache entry
   */
  async refresh(key: string, fetchFn: () => Promise<any>) {
    await this.cache.delete(key);
    const value = await fetchFn();
    await this.cache.set(key, value);
    return value;
  }
}

// ============================================================================
// Example 6: Offline-First Application Pattern
// ============================================================================

/**
 * Build an offline-first application using persistent caching
 */
class OfflineFirstApp {
  private cache = createCache({
    storage: "indexedDB",
    ttl: 86400000, // 24 hours
    maxSize: 1000,
  });

  private client = createHttpClient({
    baseUrl: "http://localhost:3000",
  });

  /**
   * Fetch data with offline fallback
   */
  async fetchWithOfflineSupport(key: string, fetchFn: () => Promise<any>) {
    try {
      // Try to fetch fresh data
      const data = await fetchFn();
      
      // Update cache
      await this.cache.set(key, data);
      
      return data;
    } catch (error) {
      console.warn("Failed to fetch, falling back to cache:", error);
      
      // Fallback to cached data
      const cached = await this.cache.get(key);
      
      if (cached) {
        return cached;
      }
      
      // No cached data available
      throw new Error("No data available offline");
    }
  }

  /**
   * Example: Fetch apps with offline support
   */
  async getApps() {
    return this.fetchWithOfflineSupport(
      "apps:list",
      () => this.client.apps.listApps()
    );
  }
}

// ============================================================================
// Export examples
// ============================================================================

export {
  exampleMemoryCache,
  exampleLocalStorageCache,
  exampleIndexedDBCache,
  createOptimalCache,
  exampleCachingWithClient,
  exampleSSETypes,
  CacheManager,
  OfflineFirstApp,
};
