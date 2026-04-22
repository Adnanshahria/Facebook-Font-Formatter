import { Env } from '../_db';

interface AiRequest {
  mode: 'enhance' | 'compact' | 'highlight';
  text: string;
}

// Map the tool names so the AI knows what tags to emit
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

export async function onRequestPost({ request, env }: { request: Request, env: Env }) {
  try {
    const { mode, text } = await request.json() as AiRequest;

    if (!mode || !text) {
      return new Response(JSON.stringify({ error: 'Missing mode or text' }), { status: 400 });
    }

    const systemPrompt = PROMPTS[mode] || PROMPTS.enhance;

    // Keys are pulled from ENV bindings
    // Example: process.env.HF_API_TOKEN equivalent in Cloudflare is env.HF_API_TOKEN
    const hfKey = env.HF_API_TOKEN;
    const groqKey = env.GROQ_API_KEY;

    if (!hfKey && !groqKey) {
      return new Response(JSON.stringify({ error: 'AI Integrations are missing ENV Secrets (HF_API_TOKEN or GROQ_API_KEY).' }), { status: 400 });
    }

    let finalResult = "";
    let hfError = null;

    // 1. Try HuggingFace (Primary)
    if (hfKey) {
      try {
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hfKey}`
          },
          body: JSON.stringify({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
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
        } else {
          hfError = await hfResponse.text();
          console.warn("HuggingFace failed, falling back...", hfError);
        }
      } catch (err) {
        hfError = String(err);
        console.warn("HuggingFace fetch error, falling back...", hfError);
      }
    }

    // 2. Fallback to Groq if HF fails or is not provided
    if (!finalResult && groqKey) {
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
      } else {
        const errText = await groqResponse.text();
        return new Response(JSON.stringify({ error: `HuggingFace Error: ${hfError}. Fallback Groq Error: ${errText}` }), { status: groqResponse.status });
      }
    }

    if (!finalResult) {
      return new Response(JSON.stringify({ error: `Failed to generate response. HuggingFace Error: ${hfError || 'No HF Key'}` }), { status: 500 });
    }

    return new Response(JSON.stringify({ result: finalResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('API / API Endpoint Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
