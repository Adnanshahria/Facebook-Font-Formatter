import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for Vite in dev, ideally stricter in prod
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.APP_URL || ''] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Stricter limit for admin login attempts
  message: { error: 'Too many admin login attempts. Please try again in an hour.' }
});

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dummy.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Initialize database tables
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS visitors (
        id TEXT PRIMARY KEY,
        visit_count INTEGER DEFAULT 1,
        last_visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        original_text TEXT NOT NULL,
        formatted_text TEXT NOT NULL,
        serial_number INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDb();

// Endpoints
app.post('/api/visitors', async (req, res) => {
  const { id } = req.body;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid visitor ID' });

  try {
    await db.execute({
      sql: `
        INSERT INTO visitors (id, visit_count, last_visited_at, visited_at) 
        VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET 
          visit_count = visit_count + 1, 
          last_visited_at = CURRENT_TIMESTAMP
      `,
      args: [id]
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error recording visitor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/content', async (req, res) => {
  const { email, originalText, formattedText } = req.body;
  
  if (!email || !originalText || !formattedText) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!cleanEmail.includes('@')) return res.status(400).json({ error: 'Invalid email' });

  try {
    // Get serial number for this email
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM user_contents WHERE email = ?',
      args: [cleanEmail]
    });
    const serialNumber = Number(countResult.rows[0].count) + 1;

    await db.execute({
      sql: 'INSERT INTO user_contents (email, original_text, formatted_text, serial_number) VALUES (?, ?, ?, ?)',
      args: [cleanEmail, originalText, formattedText, serialNumber]
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving content:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/data', adminLimiter, async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const visitorsResult = await db.execute('SELECT * FROM visitors ORDER BY last_visited_at DESC LIMIT 1000');
    const contentsResult = await db.execute('SELECT * FROM user_contents ORDER BY created_at DESC LIMIT 1000');

    // Aggregate Stats
    const totalVisits = visitorsResult.rows.reduce((sum, row) => sum + Number(row.visit_count), 0);
    const uniqueVisitors = visitorsResult.rows.length;
    const returningUsers = visitorsResult.rows.filter(r => Number(r.visit_count) > 1).length;

    res.json({
      visitors: visitorsResult.rows,
      contents: contentsResult.rows,
      stats: {
        totalVisits,
        uniqueVisitors,
        returningUsers
      }
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Centralized Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[FATAL ERROR]', err);
  res.status(500).json({ 
    error: 'A server error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
