# Dyad Web Application Example

This is a simple web-based interface for Dyad that demonstrates how to use the HTTP REST API.

## Features

- View all applications
- List chats for each application
- Create new chats
- Delete chats
- Real-time connection status
- Auto-refresh functionality

## Running the Web App

### Option 1: Using Python's Built-in HTTP Server

```bash
cd examples/web-app
python3 -m http.server 8080
```

Then open your browser to: http://localhost:8080

### Option 2: Using Node.js http-server

```bash
npm install -g http-server
cd examples/web-app
http-server -p 8080
```

Then open your browser to: http://localhost:8080

### Option 3: Direct File Access

Simply open `index.html` in your web browser. However, due to CORS restrictions, you may need to use one of the server options above for full functionality.

## Prerequisites

1. Dyad Desktop must be running
2. The HTTP API server must be enabled (it's enabled by default on port 3000)

## How It Works

The web application uses the Dyad HTTP REST API to:

1. **Check Connection**: Calls `GET /api/health` to verify Dyad is running
2. **List Applications**: Calls `GET /api/apps` to fetch all applications
3. **List Chats**: Calls `GET /api/apps/:appId/chats` to fetch chats for an app
4. **Create Chat**: Calls `POST /api/apps/:appId/chats` to create a new chat
5. **Delete Chat**: Calls `DELETE /api/chats/:id` to delete a chat

## API Integration Example

Here's a simple example of how the web app interacts with the API:

```javascript
const API_BASE_URL = "http://localhost:3000";

// Check if API is available
async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  const data = await response.json();
  return data.success;
}

// Load all applications
async function loadApps() {
  const response = await fetch(`${API_BASE_URL}/api/apps`);
  const data = await response.json();
  return data.data.apps;
}

// Create a new chat
async function createChat(appId) {
  const response = await fetch(`${API_BASE_URL}/api/apps/${appId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  return data.data;
}
```

## Customization

Feel free to modify this example to:

- Add more features (update app settings, send messages, etc.)
- Improve the UI/UX
- Add authentication
- Integrate with your own tools and workflows

## Troubleshooting

### "Failed to connect to Dyad Desktop"

1. Make sure Dyad Desktop is running
2. Verify the API is accessible: open http://localhost:3000/api/health in your browser
3. Check if there are any firewall restrictions

### CORS Errors

If you're seeing CORS errors, make sure you're running the web app through a local server (Option 1 or 2 above) rather than opening the HTML file directly.

## Next Steps

- Explore the full API documentation in [docs/HTTP_API.md](../../docs/HTTP_API.md)
- Build your own integrations using the HTTP API
- Contribute improvements to this example!

## License

This example is part of Dyad and is licensed under the MIT License.
