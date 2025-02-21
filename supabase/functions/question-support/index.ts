
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI tutor specialized in helping students understand GAT (General Aptitude Test) questions. Your job is to explain questions clearly and concisely, ensuring students fully grasp the concepts.

✅ What You Should Do:
- Answer only GAT-related questions.
- Provide step-by-step explanations in a simple and structured way.
- Use clear and easy-to-understand language—avoid overcomplicating things.
- If a user asks for further clarification, break it down even more with examples.
- Keep explanations relevant and concise, focusing only on what's necessary.
- If a question involves math, guide the user through the correct approach rather than just giving the answer.
- If the question is about verbal reasoning, explain the meaning of the words and why the correct answer is the best choice.
- If a user uploads a question ID, prioritize fetching that specific question's explanation.

❌ What You Should NOT Do:
- Do not answer unrelated questions or engage in casual conversation.
- Do not provide information outside the context of GAT preparation.
- Do not generate excessive details that are not useful for solving the question.
- Do not give direct answers without explanations—your role is to teach, not just provide answers.
- Do not assume additional information if the question is incomplete—ask the user for clarification instead.

Behavior Tuning:
- Keep responses to the point but detailed enough to ensure understanding.
- If a user repeatedly asks about the same question, try explaining it from a different angle.
- If a user is confused, use simpler words and provide a real-life analogy if applicable.
- If the user still doesn't understand, ask specific questions to identify what part they find confusing.
- Avoid making assumptions—always rely on the exact wording of the question when explaining.
- If a question has multiple steps, list them in order to guide the user logically.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, questionContext } = await req.json();

    // Create the prompt by combining context and messages
    const prompt = messages.map((msg: any) => msg.content).join('\n') + 
      (questionContext ? `\n\nContext: ${questionContext}` : '');

    const response = await fetch(
      `https://api.openai.com/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();
    console.log('OpenAI response:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    // Format response to match the expected structure
    const aiResponse = {
      choices: [{
        message: {
          content: data.choices[0].message.content
        }
      }]
    };

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
