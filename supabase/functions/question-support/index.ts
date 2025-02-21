
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

    // If there's an image, modify the prompts
    if (latestMessage.image) {
      systemPrompt = "You are a helpful AI tutor that analyzes and explains GAT questions, including those presented in images. When analyzing an image, describe what you see and provide a detailed explanation."
      userPrompt = `This is a GAT question presented in an image. ${latestMessage.content}`
    }

    // Add context if available
    if (questionContext) {
      userPrompt = `${questionContext}\n\n${userPrompt}`
    }

    const messages_for_ai = [
      {
        role: "system",
        content: systemPrompt
      },
      ...messages.slice(0, -1), // Previous conversation
      {
        role: "user",
        content: userPrompt
      }
    ]

    // If there's an image in the latest message, add it to the messages
    if (latestMessage.image) {
      messages_for_ai[messages_for_ai.length - 1].content = [
        {
          type: "text",
          text: userPrompt
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${latestMessage.image.data}`
          }
        }
      ]
    }

    console.log('Sending to AI:', JSON.stringify(messages_for_ai))

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: messages_for_ai,
        temperature: 0.2,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('AI API error:', error)
      throw new Error(`AI API error: ${error}`)
    }

    const data = await response.json()
    console.log('AI Response:', JSON.stringify(data))

    return new Response(
      JSON.stringify(data),
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
