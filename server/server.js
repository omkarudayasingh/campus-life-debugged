const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initSchema } = require('./db');
initSchema();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'Campus Life, Debugged - BPUT Hackathon 2026 PS07',
    database: 'SQLite Relational WAL'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/gate-pass', require('./routes/gatePass'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/hostel', require('./routes/hostel'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/kiosk', require('./routes/kiosk'));

// Serve Frontend Build if present (Production deployment mode)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback route for SPA in Express 5
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Campus Life, Debugged API Server</title></head>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 600px; margin: auto;">
          <h2>Campus Life, Debugged — Backend API Server Online</h2>
          <p>The Express backend is running on port ${PORT}.</p>
          <p>For development with Vite, open <a href="http://localhost:3000">http://localhost:3000</a>.</p>
          <p>Healthcheck: <a href="/api/health">/api/health</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Campus Life, Debugged — BPUT Hackathon 2026 PS07`);
  console.log(` Server active on: http://localhost:${PORT}`);
  console.log(` Accessible over local network for mobile/tablet testing`);
  console.log(`=======================================================`);
});
