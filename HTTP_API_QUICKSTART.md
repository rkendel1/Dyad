# Dyad HTTP REST API - Quick Start Guide

## 🚀 What is this?

The Dyad HTTP REST API allows you to access and control Dyad's functionality through standard HTTP requests. This means you can:

- Build web applications that use Dyad
- Create command-line tools
- Integrate Dyad with other software
- Access Dyad from any programming language

## 📋 Prerequisites

1. **Dyad Desktop must be running**
   - Download from: https://dyad.sh
   - The HTTP API starts automatically when Dyad launches

2. **API is accessible at:**
   ```
   http://localhost:3000
   ```

## ✅ Quick Test

Check if the API is working:

### Using curl (Terminal/Command Prompt)

```bash
curl http://localhost:3000/api/health
```

### Using browser

Open in your web browser:

```
http://localhost:3000/api/health
```

### Expected response

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

If you see this, the API is working! 🎉

## 🎯 Common Use Cases

### 1. List All Applications

**Request:**

```bash
curl http://localhost:3000/api/apps
```

**Response:**

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

### 2. Get Specific Application

**Request:**

```bash
curl http://localhost:3000/api/apps/1
```

### 3. Create a New Chat

**Request:**

```bash
curl -X POST http://localhost:3000/api/apps/1/chats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "",
    "messages": [],
    "initialCommitHash": null
  }
}
```

### 4. Send a Message

**Request:**

```bash
curl -X POST http://localhost:3000/api/chats/5/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Create a todo list component",
    "role": "user"
  }'
```

### 5. List Chat Messages

**Request:**

```bash
curl http://localhost:3000/api/chats/5/messages
```

## 🌐 Example Web Application

We've included a fully functional web interface!

### How to Run It

#### Option 1: Python (Recommended)

```bash
cd examples/web-app
python3 -m http.server 8080
```

Then open: http://localhost:8080

#### Option 2: Node.js

```bash
npm install -g http-server
cd examples/web-app
http-server -p 8080
```

Then open: http://localhost:8080

### What It Does

- ✅ Lists all your applications
- ✅ Shows chats for each app
- ✅ Creates new chats
- ✅ Deletes chats
- ✅ Shows connection status
- ✅ Auto-refreshes every 10 seconds

### Screenshot

The web app has a beautiful gradient interface with:

- Purple gradient header
- Application cards in a grid layout
- Chat list with management buttons
- Real-time status indicator
- Responsive design

## 🧪 Testing the API

We've included a test script that exercises all endpoints:

```bash
node examples/test-api.js
```

This will:

1. Check API health
2. List all applications
3. Create a test chat
4. Add a message
5. Delete the test chat
6. Test error handling

## 💻 Code Examples

### JavaScript/TypeScript

```javascript
const BASE_URL = "http://localhost:3000";

// Fetch all apps
async function getApps() {
  const response = await fetch(`${BASE_URL}/api/apps`);
  const data = await response.json();
  return data.data.apps;
}

// Create a chat
async function createChat(appId) {
  const response = await fetch(`${BASE_URL}/api/apps/${appId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  return data.data;
}

// Usage
const apps = await getApps();
console.log("Apps:", apps);

const chat = await createChat(1);
console.log("Created chat:", chat);
```

### Python

```python
import requests
import json

BASE_URL = 'http://localhost:3000'

# Fetch all apps
def get_apps():
    response = requests.get(f'{BASE_URL}/api/apps')
    data = response.json()
    return data['data']['apps']

# Create a chat
def create_chat(app_id):
    response = requests.post(f'{BASE_URL}/api/apps/{app_id}/chats')
    data = response.json()
    return data['data']

# Usage
apps = get_apps()
print('Apps:', apps)

chat = create_chat(1)
print('Created chat:', chat)
```

### curl

```bash
# Get all apps
curl http://localhost:3000/api/apps

# Create a chat
curl -X POST http://localhost:3000/api/apps/1/chats

# Send a message
curl -X POST http://localhost:3000/api/chats/1/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!", "role": "user"}'

# Get chat messages
curl http://localhost:3000/api/chats/1/messages

# Delete a chat
curl -X DELETE http://localhost:3000/api/chats/1
```

## 📚 Complete API Reference

For the complete list of all endpoints, request/response formats, and error handling, see:

👉 **[docs/HTTP_API.md](docs/HTTP_API.md)**

This includes:

- All 15 API endpoints
- Request/response examples
- Error codes and handling
- Authentication options
- CORS configuration
- Troubleshooting guide

## ❓ Troubleshooting

### "Connection refused" or "Cannot connect"

**Problem:** Can't reach the API at http://localhost:3000

**Solution:**

1. Make sure Dyad Desktop is running
2. Check if another application is using port 3000
3. Look at Dyad logs for errors

### "No apps found"

**Problem:** API returns empty app list

**Solution:**

- Create at least one app in Dyad Desktop first
- The API accesses the same data as the desktop app

### Web app shows "Disconnected"

**Problem:** Web interface can't connect to API

**Solution:**

1. Check if Dyad Desktop is running
2. Try accessing http://localhost:3000/api/health directly
3. Make sure you're running the web app through a local server (not opening HTML directly)

### CORS errors in browser

**Problem:** Browser blocks API requests

**Solution:**

- Run the web app through a local server (python or http-server)
- Don't open the HTML file directly in the browser

## 🔐 Security Note

By default:

- API only accepts connections from `localhost`
- No authentication required for localhost
- CORS enabled for localhost origins only

For production deployments:

- Enable JWT authentication
- Configure allowed origins
- Use HTTPS
- Add rate limiting

See `docs/HTTP_API.md` for security configuration.

## 🎓 Next Steps

1. **Read the full documentation:**
   - [docs/HTTP_API.md](docs/HTTP_API.md) - Complete API reference

2. **Try the examples:**
   - `examples/web-app/` - Web interface
   - `examples/test-api.js` - Test script

3. **Build something!**
   - Create a CLI tool
   - Build a web dashboard
   - Integrate with your workflow

## 📞 Support

- **Documentation:** `docs/HTTP_API.md`
- **GitHub Issues:** https://github.com/dyad-sh/dyad/issues
- **Website:** https://dyad.sh

## 📝 Summary

✅ API runs automatically on http://localhost:3000  
✅ 15 endpoints for apps, chats, and messages  
✅ RESTful design with JSON responses  
✅ Works with any programming language  
✅ Example web app included  
✅ Comprehensive documentation

**Start building with Dyad today!** 🚀
