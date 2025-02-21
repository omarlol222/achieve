
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, questionContext } = await req.json()

    // Check if the latest message contains an image
    const latestMessage = messages[messages.length - 1]
    let systemPrompt = "You are a helpful AI tutor that explains GAT questions clearly and concisely."
    let userPrompt = latestMessage.content

    // Prepare the messages array for Gemini
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    // If there's an image in the latest message, add it
    if (latestMessage.imageBase64) {
      geminiMessages[geminiMessages.length - 1].parts.unshift({
        inlineData: {
          mimeType: "image/jpeg",
          data: latestMessage.imageBase64
        }
      })
    }

    // Add context if available
    if (questionContext) {
      geminiMessages[geminiMessages.length - 1].parts[0].text = 
        `${questionContext}\n\n${geminiMessages[geminiMessages.length - 1].parts[0].text}`
    }

    console.log('Sending to Gemini:', JSON.stringify(geminiMessages))

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GOOGLE_API_KEY')!,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: geminiMessages[geminiMessages.length - 1].parts
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()
    console.log('Gemini Response:', JSON.stringify(data))

    // Format response to match expected structure
    const formattedResponse = {
      choices: [{
        message: {
          content: data.candidates[0].content.parts[0].text
        }
      }]
    }

    return new Response(
      JSON.stringify(formattedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
