# Dyad Web App

A Next.js-based web interface for managing Dyad AI applications.

## Features

- 🚀 **Modern Next.js Architecture**: Built with Next.js 15+ App Router
- 🎨 **Beautiful UI**: Styled with Tailwind CSS and Shadcn/UI components
- 🔌 **Desktop Integration**: Seamlessly connects to Dyad Desktop API
- 💬 **Chat Interface**: Interact with your apps through a chat-based interface
- 📊 **App Management**: View, manage, and delete applications
- 🗨️ **Real-time Messaging**: Send and receive messages with automatic polling
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Fast & Efficient**: Optimized for performance
- 🌐 **Scalable**: Ready for future web tool integrations

## Prerequisites

- Node.js 20 or higher
- Dyad Desktop application running on `localhost:3000`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5175](http://localhost:5175) in your browser.

## Environment Variables

You can customize the API URL by creating a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Building for Production

```bash
npm run build
npm start
```

## Architecture

The web app follows Next.js 15 best practices:

- **App Router**: Modern file-system-based routing in `src/app/`
- **Server Components**: Used by default for better performance
- **Client Components**: Used only where necessary (`"use client"` directive)
- **API Integration**: Axios-based client for Dyad Desktop API
- **State Management**: React Query for server state
- **Styling**: Tailwind CSS with custom design tokens matching desktop app

## Design Consistency

The web app maintains design consistency with the Dyad Desktop application:

- Same color palette and design tokens
- Matching UI components (Shadcn/UI)
- Consistent typography (Geist font family)
- Similar layout patterns and interactions

## API Endpoints

The web app connects to these Dyad Desktop API endpoints:

- `GET /api/health` - Health check
- `GET /api/apps` - List all applications
- `GET /api/apps/:id` - Get specific application details
- `DELETE /api/apps/:id` - Delete an application
- `GET /api/apps/:appId/chats` - List chats for an application
- `POST /api/apps/:appId/chats` - Create a new chat for an application
- `GET /api/chats/:id` - Get chat details
- `GET /api/chats/:id/messages` - Get messages for a chat
- `POST /api/chats/:id/messages` - Send a message in a chat
- `DELETE /api/chats/:id` - Delete a chat

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Connection Issues

If the web app can't connect to Dyad Desktop:

1. Ensure Dyad Desktop is running
2. Check that the API server is running on port 3000
3. Verify CORS is properly configured

### Header Size Errors

The Express server has been configured with an increased `maxHeaderSize` (16KB) to prevent header size errors. If you still encounter issues, check the server configuration in `src/api/http/server.ts`.

## Contributing

This is part of the main Dyad project. Please see the main repository for contribution guidelines.

## License

See the main Dyad repository for license information.
