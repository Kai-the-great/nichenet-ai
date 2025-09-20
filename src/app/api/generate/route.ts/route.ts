import { NextResponse } from 'next/server';

const AI_MODEL = "mistralai/Mistral-7B-Instruct-v0.1";

export async function POST(req: Request) {
  try {
    const { features } = await req.json();

    if (!features) {
      return NextResponse.json({ error: 'Features are required.' }, { status: 400 });
    }

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
            max_new_tokens: 250,
            temperature: 0.7,
            repetition_penalty: 1.2,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json({ error: `AI model error: ${response.statusText}` }, { status: response.status });
    }
    
    const data = await response.json();
    const generatedText = data[0].generated_text;
    const listing = generatedText.split('LISTING DESCRIPTION:')[1]?.trim();
    
    return NextResponse.json({ listing });

  } catch (error) {
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}