import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();

// Security Middleware (Helmet is fine for Serverless)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

app.use(cors({
  origin: '*', // Vercel handles origins better, but we allow all for API
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://dummy.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

// Initialize database tables (Runs on function cold start)
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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Ensure tables exist
initDb();

// Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.execute("SELECT data FROM settings WHERE id = 'site_config'");
    if (result.rows.length > 0) {
      res.json(JSON.parse(result.rows[0].data as string));
    } else {
      res.json({});
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  const { password, settings } = req.body;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await db.execute({
      sql: `
        INSERT INTO settings (id, data) 
        VALUES ('site_config', ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data
      `,
      args: [JSON.stringify(settings)]
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
  if (!email || !originalText || !formattedText) return res.status(400).json({ error: 'Missing required fields' });

  const cleanEmail = String(email).trim().toLowerCase();
  try {
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

app.post('/api/admin/data', async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const visitorsResult = await db.execute('SELECT * FROM visitors ORDER BY last_visited_at DESC LIMIT 1000');
    const contentsResult = await db.execute('SELECT * FROM user_contents ORDER BY created_at DESC LIMIT 1000');

    const totalVisits = visitorsResult.rows.reduce((sum, row) => sum + Number(row.visit_count), 0);
    const uniqueVisitors = visitorsResult.rows.length;
    const returningUsers = visitorsResult.rows.filter(r => Number(r.visit_count) > 1).length;

    res.json({
      visitors: visitorsResult.rows,
      contents: contentsResult.rows,
      stats: { totalVisits, uniqueVisitors, returningUsers }
    });
  } catch (err) {
    console.error('Error fetching admin data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the app for Vercel
export default app;

// Local development listener
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Development API server running at http://localhost:${port}`);
  });
}
