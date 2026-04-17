import { getDb, Env } from '../_db';

export async function onRequestGet({ env }: { env: Env }) {
  try {
    const db = getDb(env);
    // Make sure 'settings' table exists. Fall back to site_settings if 'settings' fails.
    let result;
    try {
      result = await db.execute("SELECT data FROM settings WHERE id = 'site_config'");
    } catch (e: any) {
      if (e.message && e.message.includes('no such table')) {
        // Fallback for older site_settings table definition
        const fallbackResult = await db.execute('SELECT * FROM site_settings');
        const settings = fallbackResult.rows.reduce((acc: any, row: any) => {
          try { acc[String(row.setting_key)] = JSON.parse(String(row.setting_value)); } 
          catch { acc[String(row.setting_key)] = String(row.setting_value); }
          return acc;
        }, {});
        return new Response(JSON.stringify(settings), {
          status: 200,
           headers: { 'Content-Type': 'application/json' }
        });
      }
      throw e;
    }

    if (result.rows.length > 0) {
      return new Response(result.rows[0].data as string, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
