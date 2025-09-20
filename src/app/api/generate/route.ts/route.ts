// src/app/api/generate/route.ts

import { NextResponse } from 'next/server';

// This is the specific model we'll use from Hugging Face.
const AI_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

export async function POST(req: Request) {
  try {
    const { features } = await req.json();

    if (!features) {
      return NextResponse.json({ error: 'Features are required.' }, { status: 400 });
    }

    // This is the "prompt engineering" part. We're telling the AI exactly what we want.
    const prompt = `
      You are an expert real estate agent. Write a compelling, warm, and inviting property listing description.
      The tone should be professional yet appealing to a homebuyer.
      Do not use excessive exclamation points. Highlight the best features naturally.
      Generate a description of around 150-200 words based on these features:
      
      FEATURES: "${features}"
      
      LISTING DESCRIPTION:
    `;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${AI_MODEL}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250, // Controls the length of the output
            temperature: 0.7,   // Controls the creativity (0.2=boring, 1.0=wild)
            repetition_penalty: 1.2,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hugging Face API Error:", errorBody);
      return NextResponse.json({ error: `AI model error: ${response.statusText}` }, { status: response.status });
    }
    
    const data = await response.json();
    // The response is an array, we take the first element's generated_text
    const generatedText = data[0].generated_text;

    // The model often repeats our prompt, so we clean it up.
    const listing = generatedText.split('LISTING DESCRIPTION:')[1]?.trim();
    
    return NextResponse.json({ listing });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}