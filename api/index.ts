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

const AI_PROMPTS = {
  enhance: "Rewrite the following text to improve engagement, emotional impact, and reach. Make the vocabulary more compelling. Only output the final enhanced text, no conversational filler or intro text.",
  compact: "Summarize and compact the following text into a punchy, shorter version. Maintain the core message. Only output the final text, no conversational filler.",
  highlight: `Identify the most impactful keywords in the following text and style them using special bracket tags.
Available tags:
[bold]...[/bold], [italic]...[/italic], [underline]...[/underline], [strikethrough]...[/strikethrough], [monospace]...[/monospace], [script]...[/script], [double]...[/double], [fraktur]...[/fraktur], [bubble]...[/bubble], [square]...[/square]

You can mix different styles for different important words. For example: "This is absolutely [bold]incredible[/bold] and [italic]beautiful[/italic]."
Do NOT change the original words or restructure the sentence. ONLY add the bracket tags around important words. Keep the rest of the text exactly the same. No conversational filler.`
};

app.post('/api/ai', async (req, res) => {
  const { mode, text } = req.body;
  if (!mode || !text) return res.status(400).json({ error: 'Missing mode or text' });

  const hfKey = process.env.HF_API_TOKEN;
  const groqKey = process.env.GROQ_API_KEY;

  if (!hfKey && !groqKey) {
    return res.status(400).json({ error: 'AI Integrations are missing ENV Secrets (HF_API_TOKEN or GROQ_API_KEY).' });
  }

  const systemPrompt = AI_PROMPTS[mode as keyof typeof AI_PROMPTS] || AI_PROMPTS.enhance;
  let finalResult = "";
  let hfError = null;

  // 1. Try HuggingFace (Primary)
  if (hfKey) {
    console.log(`[AI] Attempting HuggingFace request for mode: ${mode}`);
    try {
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfKey}`
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.3",
          messages: [
            { role: 'system', content: 'You are an expert copywriter. Output strictly only the final requested text block. No markdown code blocks, no conversational prefixes.' },
            { role: 'user', content: `${systemPrompt}\n\nHere is the text:\n${text}` }
          ],
          max_tokens: 500
        })
      });

      if (hfResponse.ok) {
        const aiData: any = await hfResponse.json();
        finalResult = aiData?.choices?.[0]?.message?.content?.trim() || "";
        console.log(`[AI] HuggingFace success`);
      } else {
        hfError = await hfResponse.text();
        console.error(`[AI] HuggingFace Error (${hfResponse.status}):`, hfError);
      }
    } catch (err) {
      hfError = String(err);
      console.error(`[AI] HuggingFace Fetch Exception:`, hfError);
    }
  }

  // 2. Fallback to Groq
  if (!finalResult && groqKey) {
    console.log(`[AI] Attempting Groq fallback for mode: ${mode}`);
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: 'system', content: 'You are an expert copywriter. Output strictly only the final requested text block. No markdown code blocks, no intro text.' },
            { role: 'user', content: `${systemPrompt}\n\nHere is the text:\n${text}` }
          ]
        })
      });

      if (groqResponse.ok) {
        const aiData: any = await groqResponse.json();
        finalResult = aiData?.choices?.[0]?.message?.content?.trim() || "";
        console.log(`[AI] Groq success`);
      } else {
        const errText = await groqResponse.text();
        console.error(`[AI] Groq Error (${groqResponse.status}):`, errText);
      }
    } catch (err) {
      console.error("[AI] Groq fallback error:", err);
    }
  }

  if (!finalResult) {
    return res.status(500).json({ error: `AI generation failed. ${hfError ? 'HF Error: ' + hfError : ''}` });
  }

  res.json({ result: finalResult });
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
