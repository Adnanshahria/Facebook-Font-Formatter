import { getDb, Env } from '../../_db';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { password, settings } = await request.json() as any;
    const adminPassword = env.VITE_ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(env);

    await db.execute({
      sql: "INSERT INTO settings (id, data) VALUES ('site_config', ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
      args: [JSON.stringify(settings)]
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error saving settings:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
