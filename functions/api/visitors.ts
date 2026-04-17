import { getDb, Env } from '../_db';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { id } = await request.json() as any;
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid visitor ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(env);

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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error recording visitor:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
