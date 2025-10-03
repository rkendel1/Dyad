require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'dyad-auth-service',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoints (placeholder)
app.post('/auth/register', (req, res) => {
  res.json({ message: 'Registration endpoint - implement as needed' });
});

app.post('/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint - implement as needed' });
});

app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - implement as needed' });
});

app.get('/auth/verify', (req, res) => {
  res.json({ message: 'Token verification endpoint - implement as needed' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 Auth service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
