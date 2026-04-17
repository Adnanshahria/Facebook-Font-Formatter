import { getDb, Env } from '../_db';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { email, originalText, formattedText } = await request.json() as any;
    
    if (!email || !originalText || !formattedText) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
         headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    
    const db = getDb(env);

    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM user_contents WHERE email = ?',
      args: [cleanEmail]
    });
    const serialNumber = Number(countResult.rows[0].count) + 1;

    await db.execute({
      sql: 'INSERT INTO user_contents (email, original_text, formatted_text, serial_number) VALUES (?, ?, ?, ?)',
      args: [cleanEmail, originalText, formattedText, serialNumber]
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error saving content:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
