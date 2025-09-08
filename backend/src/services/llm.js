import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLLMReply(context, userMessage) {
  try {
    const sys =
      "You are a concise, friendly WhatsApp assistant. " +
      "Keep replies short, helpful, and conversational.";

    const messages = [
      { role: "system", content: sys },
      { role: "user", content: `Chat history:\n${context}\n\nNew message: ${userMessage}` },
    ];

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.5,
      max_tokens: 120,
    });
    

    return resp.choices?.[0]?.message?.content?.trim() || "Got it!";
  } catch (e) {
    console.error("LLM error:", e.message);
    return "Sorry, I couldn’t generate a reply right now.";
  }
}
