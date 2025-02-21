
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchImageAsBase64(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      mimeType,
      data: base64
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

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

    const body = await req.json();
    const { messages, questionContext } = body;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    // Find the latest message with an image
    const messageWithImage = [...messages].reverse().find((msg: any) => msg.content.includes('Image URL:'));
    let contents = [];

    if (messageWithImage) {
      // Extract image URL from the message
      const urlMatch = messageWithImage.content.match(/Image URL: (.*?)(?:\n|$)/);
      if (urlMatch) {
        const imageUrl = urlMatch[1];
        try {
          const imageData = await fetchImageAsBase64(imageUrl);
          
          // Add text prompt first
          contents.push({
            parts: [{
              text: "Please analyze this image of a question and provide a detailed explanation to help understand it."
            }]
          });

          // Add image content
          contents.push({
            parts: [{
              text: messageWithImage.content.replace(/Image URL:.*(\n|$)/, '')
            }, {
              inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.data
              }
            }]
          });
        } catch (error) {
          console.error('Error processing image:', error);
          throw new Error('Failed to process image');
        }
      }
    }

    // Add any additional context
    if (questionContext) {
      contents.push({
        parts: [{
          text: `Additional Context: ${questionContext}`
        }]
      });
    }

    // If no image was found, use regular text prompt
    if (contents.length === 0) {
      contents = [{
        parts: [{
          text: messages.map((msg: any) => msg.content).join('\n')
        }]
      }];
    }

    console.log('Creating Gemini request with contents:', contents);

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
    console.log('Gemini API response data:', data);

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
