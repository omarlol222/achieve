
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
    
    const contents = [];

    // Add system prompt
    contents.push({
      role: "user",
      parts: [{
        text: `You are a helpful AI assistant that helps students understand questions and concepts. 
When provided with an image of a question, analyze it carefully and provide a detailed explanation to help the student understand it.
Break down complex concepts, provide examples, and offer step-by-step explanations when relevant.`
      }]
    });

    // Add image message if present
    if (messageWithImage) {
      contents.push({
        role: "user",
        parts: [
          { text: messageWithImage.content || "Please analyze this image" },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: messageWithImage.imageBase64
            }
          }
        ]
      });
    }

    // Add all text messages
    const textMessage = messages
      .filter(msg => !msg.imageBase64)
      .map(msg => msg.content)
      .join('\n');

    if (textMessage || questionContext) {
      contents.push({
        role: "user",
        parts: [{
          text: `${textMessage}${questionContext ? `\n\nAdditional Context: ${questionContext}` : ''}`
        }]
      });
    }

    console.log('Making request to Gemini API with contents:', 
      JSON.stringify(contents.map(c => ({
        ...c,
        parts: c.parts.map(p => 'inline_data' in p ? { type: 'image' } : p)
      })), null, 2)
    );

    // Updated to use gemini-1.5-flash model
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
      }),
    });

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('Gemini API response headers:', JSON.stringify(responseHeaders, null, 2));

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
