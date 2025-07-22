import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { initialMessage } from "@/lib/data";

const openai = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseUrl: "https://openrouter.ai/api/v1", 
  compatibility: "compatible",
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await streamText({
    model: openai("mistralai/mistral-7b-instruct"),
    messages: [initialMessage, ...messages],
    temperature: 0.7,
  });

  return stream.toDataStreamResponse();
}
