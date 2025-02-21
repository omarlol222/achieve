
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment and validate
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      throw new Error('API key not configured');
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      throw new Error('Invalid request body');
    }

    const { messages, questionContext } = body;

    // Validate request data
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Create the prompt
    const prompt = messages.map((msg: any) => msg.content).join('\n') + 
      (questionContext ? `\n\nContext: ${questionContext}` : '');

    console.log('Creating Gemini request with prompt:', prompt);

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a helpful AI assistant that helps students understand questions and concepts. 
Please analyze the question or conversation and provide a clear, helpful response.

${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1000,
      },
    };

    // Make request to Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`;
    
    console.log('Making request to Gemini API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Log response details for debugging
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response headers:', Object.fromEntries(response.headers.entries()));

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse Gemini API response:', e);
      throw new Error('Invalid response from Gemini API');
    }

    console.log('Gemini API response data:', data);

    // Format response to match expected structure
    const aiResponse = {
      choices: [{
        message: {
          content: data.candidates[0].content.parts[0].text
        }
      }]
    };

    return new Response(JSON.stringify(aiResponse), {
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
