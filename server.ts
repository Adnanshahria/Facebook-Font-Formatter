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
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL
      )
    `);
    
    // Seed default if empty
    try {
      const checkSettings = await db.execute("SELECT COUNT(*) as count FROM site_settings");
      if (Number(checkSettings.rows[0].count) === 0) {
        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['hero_features', JSON.stringify([
            { icon: 'Zap', title: "Instant Format", desc: "20+ Cinematic Unicode styles." },
            { icon: 'Languages', title: "Global Support", desc: "Bengali, Arabic & Cyrillic fallback." },
            { icon: 'Check', title: "Copy & Deploy", desc: "Works on FB, IG, X & Threads." }
          ])]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['partner_banner', JSON.stringify({
            enabled: true,
            url: "https://orbitsaas.cloud",
            title: "OrbitSaaS.cloud",
            desc: "Scaling next-gen software solutions. Turn your ideas into powerful cloud applications.",
            badge: "Partner",
            cta: "Explore Services"
          })]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['footer_settings', JSON.stringify({
            orbitUrl: 'https://orbitsaas.cloud',
            facebookUrl: '',
            instagramUrl: '',
            whatsappUrl: ''
          })]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['footer_credits', JSON.stringify({
            copyright: "© 2026 OrbitSaaS. All rights reserved.",
            tagline1: "SocialFont Engine • Engineered for Quality",
            tagline2: "Pure Unicode • No External Fonts Required"
          })]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['privacy_content', "At SocialFont, we prioritize your privacy. The text you format using our tool is processed entirely within your browser (client-side) unless you explicitly use our premium cloud-sync features by providing your email address.\n\n### 1. Information We Collect\nIf you choose to provide your email address for cloud synchronization, we use it solely to securely associate your formatted content with your account across devices. We do not sell, rent, or share your personal information or formatted text with third parties.\n\n### 2. Third-Party Advertisements\nWe use Google AdSense to serve ads on our site. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings."]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['terms_content', "### 1. Acceptance of Terms\nBy accessing and using SocialFont, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.\n\n### 2. Description of Service\nSocialFont provides a free online tool for converting standard text into formatted Unicode characters intended for use on social media platforms.\n\n### 3. User Conduct\nYou agree to use the service only for lawful purposes. You are solely responsible for the content you generate and paste onto other platforms."]
        });

        await db.execute({
          sql: "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
          args: ['contact_content', "### General Inquiries & Support\nFor questions, feedback, or technical support regarding the formatting engine, please reach out to us at: support@socialfont.space\n\n### Business & Partnerships\nInterested in advertising or integrating our engine? Contact our partnership team: partners@orbitsaas.cloud"]
        });
      }
    } catch(e) {
      console.log('Error seeding settings:', e);
    }

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
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM site_settings');
    const settings = result.rows.reduce((acc: any, row) => {
      try {
        acc[String(row.setting_key)] = JSON.parse(String(row.setting_value));
      } catch (e) {
        acc[String(row.setting_key)] = String(row.setting_value);
      }
      return acc;
    }, {});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
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

app.post('/api/admin/settings', adminLimiter, async (req, res) => {
  const { password, settings } = req.body;
  const adminPassword = process.env.VITE_ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    for (const key of Object.keys(settings)) {
      await db.execute({
        sql: 'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value',
        args: [key, JSON.stringify(settings[key])]
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving admin settings:', err);
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
