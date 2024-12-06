import Groq from "groq-sdk";
import "dotenv/config"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message);
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion() {
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
    model: "llama-guard-3-8b",
  });
}

main()