# Dyad HTTP REST API

The Dyad HTTP REST API provides programmatic access to Dyad's functionality via HTTP endpoints. This enables integration with external tools, command-line interfaces, and web applications.

## Getting Started

### Server Configuration

The HTTP API server automatically starts when Dyad Desktop launches. By default, it listens on:

- **Host:** `localhost`
- **Port:** `3000`
- **Base URL:** `http://localhost:3000`

### Quick Test

Check if the API is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "0.22.0-beta.1",
    "timestamp": "2025-01-12T10:30:00.000Z",
    "uptime": 300
  }
}
```

## API Endpoints

### Health & Status

#### GET /api/health

Health check endpoint.

```bash
curl http://localhost:3000/api/health
```

#### GET /api/version

Get application version information.

```bash
curl http://localhost:3000/api/version
```

#### GET /api/status

Get detailed system status.

```bash
curl http://localhost:3000/api/status
```

### Applications

#### GET /api/apps

List all applications.

```bash
curl http://localhost:3000/api/apps
```

Response:

```json
{
  "success": true,
  "data": {
    "apps": [
      {
        "id": 1,
        "name": "My App",
        "path": "my-app",
        "description": "My first app",
        "createdAt": "2025-01-12T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

#### GET /api/apps/:id

Get a specific application by ID.

```bash
curl http://localhost:3000/api/apps/1
```

#### DELETE /api/apps/:id

Delete an application.

```bash
curl -X DELETE http://localhost:3000/api/apps/1
```

#### GET /api/apps/:id/settings

Get application settings.

```bash
curl http://localhost:3000/api/apps/1/settings
```

#### PUT /api/apps/:id/settings

Update application settings.

```bash
curl -X PUT http://localhost:3000/api/apps/1/settings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated App Name",
    "description": "Updated description"
  }'
```

### Chats

#### GET /api/apps/:appId/chats

List all chats for an application.

```bash
curl http://localhost:3000/api/apps/1/chats
```

Response:

```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": 1,
        "title": "Chat 1",
        "messages": [],
        "initialCommitHash": "abc123"
      }
    ],
    "total": 1
  }
}
```

#### POST /api/apps/:appId/chats

Create a new chat for an application.

```bash
curl -X POST http://localhost:3000/api/apps/1/chats
```

#### GET /api/chats/:id

Get a specific chat by ID.

```bash
curl http://localhost:3000/api/chats/1
```

#### PUT /api/chats/:id

Update a chat (e.g., title).

```bash
curl -X PUT http://localhost:3000/api/chats/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Chat Title"
  }'
```

#### DELETE /api/chats/:id

Delete a chat.

```bash
curl -X DELETE http://localhost:3000/api/chats/1
```

### Messages

#### GET /api/chats/:id/messages

Get all messages for a chat.

```bash
curl http://localhost:3000/api/chats/1/messages
```

Response:

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "chatId": 1,
        "role": "user",
        "content": "Hello!",
        "createdAt": "2025-01-12T10:00:00.000Z"
      },
      {
        "id": 2,
        "chatId": 1,
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "createdAt": "2025-01-12T10:00:05.000Z"
      }
    ],
    "total": 2,
    "chatId": 1
  }
}
```

#### POST /api/chats/:id/messages

Create a new message in a chat.

```bash
curl -X POST http://localhost:3000/api/chats/1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from API!",
    "role": "user"
  }'
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details
    }
  }
}
```

## Error Codes

Common error codes:

- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `INVALID_APP_ID` - Invalid application ID
- `INVALID_CHAT_ID` - Invalid chat ID
- `INTERNAL_ERROR` - Internal server error

## Authentication

### Localhost Access

By default, the API is accessible without authentication when accessed from `localhost`. This is suitable for local development and desktop usage.

### JWT Authentication (Optional)

For remote access or programmatic integration, JWT authentication is available:

```bash
curl http://localhost:3000/api/apps \
  -H "Authorization: Bearer <your-jwt-token>"
```

## CORS

CORS is enabled for localhost origins by default:

- `http://localhost:*`
- `http://127.0.0.1:*`

Additional origins can be configured in the server settings.

## Rate Limiting

Currently, no rate limiting is enforced for localhost connections. This may be added in future versions for production deployments.

## Examples

### Using with curl

List all apps:

```bash
curl http://localhost:3000/api/apps
```

Create a chat:

```bash
curl -X POST http://localhost:3000/api/apps/1/chats
```

### Using with JavaScript/TypeScript

```typescript
const BASE_URL = "http://localhost:3000";

// Fetch all apps
const response = await fetch(`${BASE_URL}/api/apps`);
const data = await response.json();
console.log(data.data.apps);

// Create a chat
const chatResponse = await fetch(`${BASE_URL}/api/apps/1/chats`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});
const chatData = await chatResponse.json();
console.log(chatData.data);
```

### Using with Python

```python
import requests

BASE_URL = 'http://localhost:3000'

# Fetch all apps
response = requests.get(f'{BASE_URL}/api/apps')
data = response.json()
print(data['data']['apps'])

# Create a chat
chat_response = requests.post(f'{BASE_URL}/api/apps/1/chats')
chat_data = chat_response.json()
print(chat_data['data'])
```

## Integration with VS Code Extension

The Dyad VS Code extension uses this HTTP API to communicate with Dyad Desktop. See `vscode-extension/src/dyadApi.ts` for a TypeScript client implementation.

## Future Enhancements

Planned features for future versions:

1. **Streaming Support** - Server-Sent Events (SSE) for real-time message streaming
2. **WebSocket Support** - Real-time updates for chats and messages
3. **OpenAPI/Swagger Documentation** - Interactive API documentation
4. **API Key Management** - Generate and manage API keys for programmatic access
5. **Enhanced Authentication** - OAuth support for third-party integrations
6. **Configuration UI** - Settings panel in Dyad Desktop for API configuration

## Troubleshooting

### Server Not Starting

If the HTTP server fails to start:

1. **Check if port 3000 is already in use:**

   ```bash
   lsof -i :3000  # macOS/Linux
   netstat -ano | findstr :3000  # Windows
   ```

2. **Check Dyad logs:**
   - macOS: `~/Library/Logs/dyad/`
   - Windows: `%USERPROFILE%\AppData\Roaming\dyad\logs\`
   - Linux: `~/.config/dyad/logs/`

### API Not Responding

1. Ensure Dyad Desktop is running
2. Check firewall settings
3. Verify the API is listening on the correct port

### Connection Errors

If you get `ECONNREFUSED` errors:

1. Verify Dyad Desktop is running
2. Check the API server is enabled in settings
3. Try accessing `http://localhost:3000/api/health` in a browser

## Support

For issues, questions, or feature requests related to the HTTP API:

- GitHub Issues: https://github.com/dyad-sh/dyad/issues
- Documentation: https://github.com/dyad-sh/dyad/docs

## License

The Dyad HTTP API is part of Dyad and is licensed under the MIT License.
