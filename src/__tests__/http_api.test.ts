/**
 * HTTP API Server Tests
 * 
 * Integration tests for HTTP REST API endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { HttpApiServer } from '../api/http/server';
import { db } from '../db';
import { apps, chats, messages } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('HTTP API Server', () => {
  let server: HttpApiServer;
  let testAppId: number;
  let testChatId: number;

  beforeAll(async () => {
    // Create HTTP server instance for testing
    server = new HttpApiServer({
      enabled: true,
      port: 3001, // Use different port for testing
      host: 'localhost',
    });

    // Start the server
    await server.start();
  });

  afterAll(async () => {
    // Clean up test data
    if (testChatId) {
      await db.delete(chats).where(eq(chats.id, testChatId));
    }
    if (testAppId) {
      await db.delete(apps).where(eq(apps.id, testAppId));
    }

    // Stop the server
    await server.stop();
  });

  describe('Health Endpoints', () => {
    it('GET /api/health should return 200', async () => {
      const response = await request(server.getApp())
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.version).toBeDefined();
    });

    it('GET /api/version should return version info', async () => {
      const response = await request(server.getApp())
        .get('/api/version')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.version).toBeDefined();
      expect(response.body.data.name).toBe('dyad');
    });

    it('GET /api/status should return system status', async () => {
      const response = await request(server.getApp())
        .get('/api/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('running');
      expect(response.body.data.platform).toBeDefined();
    });
  });

  describe('App Endpoints', () => {
    beforeEach(async () => {
      // Create a test app
      const [app] = await db
        .insert(apps)
        .values({
          name: 'Test App for HTTP API',
          path: 'test-http-api-app',
          description: 'Test app for HTTP API testing',
        })
        .returning();
      testAppId = app.id;
    });

    it('GET /api/apps should list all apps', async () => {
      const response = await request(server.getApp())
        .get('/api/apps')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.apps).toBeDefined();
      expect(Array.isArray(response.body.data.apps)).toBe(true);
    });

    it('GET /api/apps/:id should return specific app', async () => {
      const response = await request(server.getApp())
        .get(`/api/apps/${testAppId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAppId);
      expect(response.body.data.name).toBe('Test App for HTTP API');
    });

    it('GET /api/apps/:id with invalid ID should return 404', async () => {
      const response = await request(server.getApp())
        .get('/api/apps/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('GET /api/apps/:id/settings should return app settings', async () => {
      const response = await request(server.getApp())
        .get(`/api/apps/${testAppId}/settings`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Chat Endpoints', () => {
    beforeEach(async () => {
      // Create a test app
      const [app] = await db
        .insert(apps)
        .values({
          name: 'Test App for Chat API',
          path: 'test-chat-api-app',
          description: 'Test app for chat API testing',
        })
        .returning();
      testAppId = app.id;
    });

    it('POST /api/apps/:appId/chats should create a new chat', async () => {
      const response = await request(server.getApp())
        .post(`/api/apps/${testAppId}/chats`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      testChatId = response.body.data.id;
    });

    it('GET /api/apps/:appId/chats should list chats for app', async () => {
      // Create a chat first
      const [chat] = await db
        .insert(chats)
        .values({
          appId: testAppId,
        })
        .returning();
      testChatId = chat.id;

      const response = await request(server.getApp())
        .get(`/api/apps/${testAppId}/chats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chats).toBeDefined();
      expect(Array.isArray(response.body.data.chats)).toBe(true);
    });

    it('GET /api/chats/:id should return specific chat', async () => {
      // Create a chat first
      const [chat] = await db
        .insert(chats)
        .values({
          appId: testAppId,
        })
        .returning();
      testChatId = chat.id;

      const response = await request(server.getApp())
        .get(`/api/chats/${testChatId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testChatId);
    });

    it('PUT /api/chats/:id should update chat title', async () => {
      // Create a chat first
      const [chat] = await db
        .insert(chats)
        .values({
          appId: testAppId,
        })
        .returning();
      testChatId = chat.id;

      const response = await request(server.getApp())
        .put(`/api/chats/${testChatId}`)
        .send({ title: 'Updated Chat Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Chat Title');
    });

    it('POST /api/chats/:id/messages should create a message', async () => {
      // Create a chat first
      const [chat] = await db
        .insert(chats)
        .values({
          appId: testAppId,
        })
        .returning();
      testChatId = chat.id;

      const response = await request(server.getApp())
        .post(`/api/chats/${testChatId}/messages`)
        .send({
          content: 'Test message content',
          role: 'user',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Test message content');
      expect(response.body.data.role).toBe('user');
    });

    it('GET /api/chats/:id/messages should list chat messages', async () => {
      // Create a chat first
      const [chat] = await db
        .insert(chats)
        .values({
          appId: testAppId,
        })
        .returning();
      testChatId = chat.id;

      // Create a message
      await db
        .insert(messages)
        .values({
          chatId: testChatId,
          content: 'Test message',
          role: 'user',
        });

      const response = await request(server.getApp())
        .get(`/api/chats/${testChatId}/messages`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.messages).toBeDefined();
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(server.getApp())
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle validation errors', async () => {
      // Try to update chat with invalid data
      const response = await request(server.getApp())
        .put('/api/chats/1')
        .send({ title: '' }) // Empty title should fail validation
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
