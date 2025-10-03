# Dyad

Dyad is a local, open-source AI app builder. It's fast, private, and fully under your control — like Lovable, v0, or Bolt, but running right on your machine.

[![Image](https://github.com/user-attachments/assets/f6c83dfc-6ffd-4d32-93dd-4b9c46d17790)](http://dyad.sh/)

More info at: [http://dyad.sh/](http://dyad.sh/)

## 🚀 Features

- ⚡️ **Local**: Fast, private and no lock-in.
- 🛠 **Bring your own keys**: Use your own AI API keys — no vendor lock-in.
- 🖥️ **Cross-platform**: Easy to run on Mac or Windows.
- 💻 **Built-in CLI**: Interactive command-line interface within the console for direct app interaction.
- 🌐 **HTTP REST API**: Programmatic access via HTTP endpoints for integrations and automation.

## 🌐 HTTP REST API

Dyad includes a built-in HTTP REST API that provides programmatic access to all core functionality. The API enables:

- **External Integrations**: Connect Dyad to other tools and workflows
- **CLI Tools**: Build command-line interfaces for Dyad
- **Automation**: Script complex operations using HTTP endpoints
- **Web Applications**: Access Dyad from web browsers

The API server starts automatically when Dyad launches and listens on `http://localhost:3000` by default.

### Quick Start

Check if the API is running:

```bash
curl http://localhost:3000/api/health
```

List all applications:

```bash
curl http://localhost:3000/api/apps
```

For complete API documentation, see [docs/HTTP_API.md](./docs/HTTP_API.md).

## 🛠️ Development

For developers who want to run Dyad from source:

### Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start Dyad:**

   **Interactive Launcher** (recommended):

   ```bash
   npm run start:interactive
   ```

   This will prompt you to choose:

   - **Desktop App** - Full Electron application
   - **Web App** - Next.js web interface on port 5175
   - **Both** - Run both simultaneously

   **Direct Start:**

   ```bash
   npm start          # Start desktop app
   npm run dev        # Start in development mode
   ```

For detailed setup and contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📦 Download

No sign-up required. Just download and go.

### [👉 Download for your platform](https://www.dyad.sh/#download)

## 🤝 Community

Join our growing community of AI app builders on **Reddit**: [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/) - share your projects and get help from the community!

## 🛠️ Contributing

**Dyad** is open-source (Apache 2.0 licensed).

If you're interested in contributing to dyad, please read our [contributing](./CONTRIBUTING.md) doc.
