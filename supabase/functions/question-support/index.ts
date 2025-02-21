
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

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    console.log('Number of messages received:', messages.length);
    console.log('Message structure:', messages.map(m => ({
      role: m.role,
      hasImage: !!m.imageBase64,
      contentLength: m.content.length
    })));

    // Find the latest message with an image
    const messageWithImage = [...messages].reverse().find(msg => msg.imageBase64);
    
    const systemPrompt = `You are a helpful AI assistant that helps students understand questions and concepts. 
When provided with an image of a question, analyze it carefully and provide a detailed explanation to help the student understand it.
Break down complex concepts, provide examples, and offer step-by-step explanations when relevant.`;

    const contents = [{
      parts: [
        { text: systemPrompt }
      ]
    }];

    if (messageWithImage) {
      console.log('Found message with image, preparing image data');
      contents.push({
        parts: [
          { text: messageWithImage.content },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: messageWithImage.imageBase64
            }
          }
        ]
      });
    }

    // Add text messages and context as a separate content part
    const textMessages = messages
      .filter(msg => !msg.imageBase64)
      .map(msg => msg.content)
      .join('\n');

    if (textMessages || questionContext) {
      contents.push({
        parts: [{
          text: `${textMessages}${questionContext ? `\n\nAdditional Context: ${questionContext}` : ''}`
        }]
      });
    }

    console.log('Request structure:', JSON.stringify({
      contents: contents.map(c => ({
        ...c,
        parts: c.parts.map(p => 'inlineData' in p ? { type: 'image', mimeType: p.inlineData.mimeType } : p)
      }))
    }, null, 2));

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1000,
      },
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${geminiApiKey}`;
    
    console.log('Making request to Gemini API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

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
