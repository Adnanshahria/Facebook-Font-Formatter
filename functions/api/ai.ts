import { getDb, Env } from '../_db';

interface AiRequest {
  mode: 'enhance' | 'compact' | 'highlight';
  text: string;
}

const TOOL_TAGS = `
[bold]...[/bold]
[italic]...[/italic]
[underline]...[/underline]
[strikethrough]...[/strikethrough]
[monospace]...[/monospace]
[script]...[/script]
[double]...[/double]
[fraktur]...[/fraktur]
[bubble]...[/bubble]
[square]...[/square]
`;

const PROMPTS = {
  enhance: "Rewrite the following text to improve engagement, emotional impact, and reach. Make the vocabulary more compelling. Only output the final enhanced text, no conversational filler or intro text.",
  compact: "Summarize and compact the following text into a punchy, shorter version. Maintain the core message. Only output the final text, no conversational filler.",
  highlight: `Identify the most impactful keywords in the following text and style them using special bracket tags.
Available tags:
${TOOL_TAGS}

You can mix different styles for different important words. For example: "This is absolutely [bold]incredible[/bold] and [italic]beautiful[/italic]."
Do NOT change the original words or restructure the sentence. ONLY add the bracket tags around important words. Keep the rest of the text exactly the same. No conversational filler.`
};

async function tryHf(token: string, prompt: string, text: string) {
  const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        { role: 'system', content: 'You are an expert copywriter. Output strictly only the final requested text block. No markdown code blocks, no conversational prefixes.' },
        { role: 'user', content: `${prompt}\n\nHere is the text:\n${text}` }
      ],
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const aiData: any = await response.json();
  return aiData?.choices?.[0]?.message?.content?.trim() || "";
}

async function tryGroq(token: string, prompt: string, text: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: 'system', content: 'You are an expert copywriter. Output strictly only the final requested text block. No markdown code blocks, no intro text.' },
        { role: 'user', content: `${prompt}\n\nHere is the text:\n${text}` }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const aiData: any = await response.json();
  return aiData?.choices?.[0]?.message?.content?.trim() || "";
}

export async function onRequestPost({ request, env }: { request: Request, env: Env }) {
  try {
    const { mode, text } = await request.json() as AiRequest;
    if (!mode || !text) {
      return new Response(JSON.stringify({ error: 'Missing mode or text' }), { status: 400 });
    }

    const systemPrompt = PROMPTS[mode] || PROMPTS.enhance;

    // 1. Fetch settings from DB
    const db = getDb(env);
    let settings: any = {};
    try {
      const result = await db.execute("SELECT data FROM settings WHERE id = 'site_config'");
      if (result.rows.length > 0) {
        settings = JSON.parse(result.rows[0].data as string);
      }
    } catch (e) {
      console.error("DB Error fetching settings:", e);
    }

    const aiConfig = settings.ai_settings || {};
    const hfTokens = [...(aiConfig.hfTokens || [])];
    if (env.HF_API_TOKEN) hfTokens.unshift(env.HF_API_TOKEN); // Primary from ENV
    
    const groqKey = aiConfig.groqKey || env.GROQ_API_KEY;
    const primaryProvider = aiConfig.primaryProvider || 'hf';

    let finalResult = "";
    const errors: string[] = [];

    const attemptHf = async () => {
      for (const token of hfTokens) {
        if (!token) continue;
        try {
          const res = await tryHf(token, systemPrompt, text);
          if (res) return res;
        } catch (err: any) {
          errors.push(`HF Token Error: ${err.message || err}`);
          console.warn("HF Token failed, trying next...", err);
        }
      }
      return "";
    };

    const attemptGroq = async () => {
      if (!groqKey) return "";
      try {
        return await tryGroq(groqKey, systemPrompt, text);
      } catch (err: any) {
        errors.push(`Groq Error: ${err.message || err}`);
        console.warn("Groq failed", err);
        return "";
      }
    };

    // Execute flow based on primary provider
    if (primaryProvider === 'hf') {
      finalResult = await attemptHf();
      if (!finalResult) finalResult = await attemptGroq();
    } else {
      finalResult = await attemptGroq();
      if (!finalResult) finalResult = await attemptHf();
    }

    if (!finalResult) {
      return new Response(JSON.stringify({ 
        error: 'AI generation failed after trying all available providers and fallbacks.',
        details: errors
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ result: finalResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('API Endpoint Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
