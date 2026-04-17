import { getDb, Env } from '../../_db';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { password } = await request.json() as any;
    const adminPassword = env.VITE_ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb(env);

    // Run simultaneously for performance natively!
    const [visitorsResult, contentsResult] = await Promise.all([
      db.execute('SELECT * FROM visitors ORDER BY last_visited_at DESC LIMIT 1000'),
      db.execute('SELECT * FROM user_contents ORDER BY created_at DESC LIMIT 1000')
    ]);

    const totalVisits = visitorsResult.rows.reduce((sum, row) => sum + Number(row.visit_count), 0);
    const uniqueVisitors = visitorsResult.rows.length;
    const returningUsers = visitorsResult.rows.filter(r => Number(r.visit_count) > 1).length;

    return new Response(JSON.stringify({
      visitors: visitorsResult.rows,
      contents: contentsResult.rows,
      stats: {
        totalVisits,
        uniqueVisitors,
        returningUsers
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Error fetching admin data:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
