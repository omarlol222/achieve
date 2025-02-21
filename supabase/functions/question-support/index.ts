
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
    console.log('Received request:', { messages, questionContext })

    // Check if the latest message contains an image
    const latestMessage = messages[messages.length - 1]
    console.log('Latest message:', latestMessage)

    // Prepare the request for Gemini
    const geminiRequest = {
      contents: [
        {
          role: 'user',
          parts: []
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    }

    // Add text content
    let userPrompt = latestMessage.content || "Please help me understand this question"
    if (questionContext) {
      userPrompt = `${questionContext}\n\n${userPrompt}`
    }

    // Add image if present
    if (latestMessage.imageBase64) {
      geminiRequest.contents[0].parts = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: latestMessage.imageBase64
          }
        },
        {
          text: userPrompt
        }
      ]
    } else {
      geminiRequest.contents[0].parts = [
        {
          text: userPrompt
        }
      ]
    }

    console.log('Gemini request configuration:', JSON.stringify({
      ...geminiRequest,
      contents: [{
        ...geminiRequest.contents[0],
        parts: geminiRequest.contents[0].parts.map(part => 
          'inlineData' in part ? { ...part, inlineData: { mimeType: part.inlineData.mimeType, data: '[BASE64_DATA]' }} : part
        )
      }]
    }))

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(geminiRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Gemini response:', JSON.stringify(data))

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
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
