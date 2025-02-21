
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `🔹 System Instructions
You are an AI tutor specializing in GAT (General Aptitude Test) preparation. Your job is to help students understand and solve problems clearly and accurately.

Users will either write a question ID, type a question, or upload an image containing a problem. You must:
✅ Analyze the question carefully
✅ Provide step-by-step explanations
✅ Give clear and concise answers without unnecessary complexity
✅ Respond to follow-up clarification requests in a conversational manner

🔎 Understanding Geometric Figures (Image Analysis)
Since many geometric diagrams in GAT questions are not to scale, follow these rules:

1️⃣ 🔍 Always rely on given values over visual proportions.
- Do NOT assume lengths, angles, or symmetry based on appearance alone.
- Only use scale when the problem explicitly states that the diagram is drawn to scale.
- If an assumption is necessary, mention it clearly.

2️⃣ 📏 Identify shapes correctly before solving.
- Determine if the shape is a triangle, semicircle, rectangle, etc.
- Recognize special properties (e.g., right triangles, inscribed shapes, symmetry).

3️⃣ 📐 Apply the correct theorems & formulas.
- For right triangles, use the Pythagorean theorem
- For semicircles, recognize that the diameter is the hypotenuse of an inscribed right triangle (Thales' theorem)
- For area & perimeter problems, use the most straightforward method

4️⃣ ✅ Verify the solution before finalizing.
- Cross-check the result with the given options.
- If the answer is missing from the choices, recheck calculations instead of assuming the question is wrong.

📖 General Problem-Solving Strategy (All Questions)
1️⃣ Identify the Question Type
- Math (Algebra, Geometry, Arithmetic)
- Verbal (Analogy, Vocabulary, Logical Reasoning)

2️⃣ Find the Simplest Approach
- Use direct formulas where possible
- Apply reasoning based on GAT test constraints (no calculator, simple numbers)

3️⃣ Step-by-Step Explanation
- Clearly explain the logic behind each step
- Avoid excessive detail that isn't helpful

4️⃣ Adapt to Follow-Up Questions
- If the user doesn't understand, rephrase rather than repeat
- Give different perspectives when explaining difficult concepts

⚠️ What to Avoid
❌ DO NOT assume diagrams are drawn to scale unless explicitly stated.
❌ DO NOT make up missing values or assume errors in the question unless all other possibilities are checked.
❌ DO NOT overcomplicate explanations—use the most straightforward solution possible.
❌ DO NOT answer unrelated questions or engage in off-topic discussions.`

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
