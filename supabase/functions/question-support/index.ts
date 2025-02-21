
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are an AI tutor specializing in GAT (General Aptitude Test) preparation. Your primary goal is to help students understand and solve questions clearly and accurately. Users will upload images of questions, and you will analyze, interpret, and provide step-by-step explanations while ensuring solutions are correct and logically structured.

Key Capabilities:
1. General Explanation Guidelines
- Always provide structured, step-by-step explanations
- Keep responses clear, simple, and to the point
- If a user asks for clarification, rephrase or explain differently
- Do not assume missing values unless explicitly stated

2. Geometric Problem Analysis
Step 1: Identify the Figure Correctly
- Recognize and confirm the type of shape
- If multiple shapes overlap, determine relationships

Step 2: Recognize Key Given Values
- Identify labeled sides, angles, and relationships
- Pay attention to which side corresponds to which shape

Step 3: Apply the Right Theorems
- Use appropriate mathematical theorems
- Use basic area, perimeter, or angle rules when relevant

Step 4: Cross-Check the Answer
- Verify solution matches problem statement
- Re-evaluate calculations if answer doesn't match choices

What to Avoid:
- Do not misinterpret how values relate to different parts
- Do not overcomplicate solutions
- Do not dismiss answer sets without full verification
- Do not assume incorrect drawings unless stated

Remember to:
- Break down complex concepts into simpler parts
- Provide visual representations when helpful
- Use clear mathematical notation
- Explain your reasoning at each step`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, questionContext } = await req.json()
    console.log('Received request:', { messages, questionContext })

    // Find the message with the image
    const messageWithImage = messages.find(msg => msg.imageBase64)
    console.log('Message with image:', messageWithImage ? 'Found' : 'Not found')

    // Prepare the request for Gemini
    const geminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: SYSTEM_PROMPT
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    }

    // Add user message with image if present
    if (messageWithImage?.imageBase64) {
      geminiRequest.contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: messageWithImage.imageBase64
            }
          },
          {
            text: messageWithImage.content || "Please analyze this question and provide a clear, step-by-step explanation."
          }
        ]
      })
    } else {
      // Handle text-only questions
      const userPrompt = questionContext ? 
        `${questionContext}\n\n${messages[messages.length - 1].content}` :
        messages[messages.length - 1].content

      geminiRequest.contents.push({
        role: 'user',
        parts: [
          {
            text: userPrompt
          }
        ]
      })
    }

    console.log('Gemini request configuration:', JSON.stringify({
      ...geminiRequest,
      contents: geminiRequest.contents.map(content => ({
        ...content,
        parts: content.parts.map(part => 
          'inlineData' in part ? { ...part, inlineData: { mimeType: part.inlineData.mimeType, data: '[BASE64_DATA]' }} : part
        )
      }))
    }))

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
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
