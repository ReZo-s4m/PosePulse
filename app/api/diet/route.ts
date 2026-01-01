import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { age, height, weight } = await req.json();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that provides diet plans.",
      },
      {
        role: "user",
        content: `Generate a JSON diet plan for 7 days, containing meals for breakfast, lunch, and dinner.
        
        - User Age: ${age}
        - Height: ${height} cm
        - Weight: ${weight} kg
        
        Return ONLY valid JSON. Do NOT include markdown formatting like '''json. 
        
        Example output format:
        {
          "monday": {
            "breakfast": "Oatmeal with fruits",
            "lunch": "Grilled chicken with quinoa",
            "dinner": "Salmon with steamed vegetables"
          },
          "tuesday": { ... },
          ...
          "sunday": { ... }
        }`
      },
    ],
  });

  try {
    // Ensure response is parsed as JSON
    const mealPlan = JSON.parse(response.choices[0].message.content || "{}");
    console.log( mealPlan);
    return new Response(JSON.stringify(mealPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return new Response(
      JSON.stringify({ error: "Invalid JSON response from OpenAI" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
