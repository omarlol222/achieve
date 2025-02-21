
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      throw new Error('API key not configured');
    }

    const { messages, questionContext } = await req.json();
    console.log('Received request body:', { messages, questionContext });

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Find the latest message with an image
    const messageWithImage = [...messages].reverse().find(msg => msg.imageBase64);
    
    if (!messageWithImage) {
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: "Please upload an image of your GAT question. I'll analyze it and provide a detailed explanation to help you understand it better."
          }
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use gemini-1.5-flash for image analysis
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const systemPrompt = `You are an AI tutor specializing in GAT (General Aptitude Test) preparation. Your role is to help users understand and solve problems by providing clear, structured explanations.

✅ What You Should Do:
- Analyze the text and figures in the uploaded image to extract the question details
- Provide step-by-step explanations in a clear and simple manner
- For math questions, explain the approach and show calculations
- For verbal reasoning, identify key relationships and logic
- For geometric diagrams:
  * Identify shapes, angles, intersections, or given values
  * Apply appropriate formulas or theorems
  * Clearly state reasoning behind each step

❌ What You Should NOT Do:
- Do not provide direct answers without explanations
- Do not assume details not visible in the image
- Do not generate unnecessary information
- Do not engage in casual conversation

Format your response in this structure:
1. Question Analysis: Brief overview of what the question is asking
2. Key Concepts: List the main concepts or formulas needed
3. Step-by-Step Solution: Numbered steps explaining the approach
4. Final Answer: Clear statement of the solution
5. Additional Notes: Any important tips or related concepts (if relevant)

Use clear language and avoid unnecessary complexity.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "user",
        parts: [
          { text: "Please analyze this GAT question and provide a detailed explanation:" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: messageWithImage.imageBase64
            }
          }
        ]
      }
    ];

    // Add any additional context from the chat
    const textMessages = messages
      .filter(msg => !msg.imageBase64 && msg.content.trim())
      .map(msg => msg.content)
      .join('\n');

    if (textMessages || questionContext) {
      contents.push({
        role: "user",
        parts: [{
          text: `Additional context:\n${textMessages}${questionContext ? `\n${questionContext}` : ''}`
        }]
      });
    }

    console.log('Making request to Gemini API:', {
      url: apiUrl,
      contents: contents.map(c => ({
        ...c,
        parts: c.parts.map(p => 'inline_data' in p ? { type: 'image' } : p)
      }))
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2, // Lower temperature for more focused responses
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Format response to match what frontend expects
    const formattedResponse = {
      choices: [{
        message: {
          content: data.candidates[0].content.parts[0].text
        }
      }]
    };

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
