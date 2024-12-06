import Groq from "groq-sdk";

export async function main(groq: Groq) {
  const chatCompletion = await getGroqChatCompletion(groq);
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message);
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion(groq: Groq) {
  return groq.chat.completions.create({
    messages: [
      // Set an optional system message. This sets the behavior of the
      // assistant and can be used to provide specific instructions for
      // how it should behave throughout the conversation.
      {
        role: "system",
        content: "you are a helpful assistant.",
      },
      // Set a user message for the assistant to respond to.
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ],
    model: "llama3-8b-8192",
  });
}

export async function GET() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  await main(groq);
  return Response.json({ test: "Hello there!" });
}
