// Context, and userInputPrompt -> punchline for the meme in addition to an image generation prompt
import Groq from "groq-sdk";

const systemPrompt = `You are a helpful assistant which helps generating meme ideas. Given the context and a userInput, you will generate a meme punchline and also an image generation prompt for the meme.
The punchline and image generation prompt should be separated by 2 newlines. DO NOT GIVE ANY OUTPUT OTHER THAN THE PUNCHLINE AND IMAGE GENERATION PROMPT. So, it should be in the following format:
\`\`\`
<punchline>

<image_gen_prompt>
\`\`\`

eg:-
\`\`\`
That face you give when you see your ex

A face with a strong expression of disgust
\`\`\``;

export type MemeIdea = {
  punchline: string;
  imageGenPrompt: string;
};

export async function genMemeIdea(
  userInputPrompt: string,
  context?: string,
): Promise<MemeIdea | undefined> {
  const finalPrompt = `userInput: ${userInputPrompt}\n${context ? `context: ${context}` : ""}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: finalPrompt },
    ],
    model: "llama3-8b-8192",
  });

  const messageOutput = response.choices[0]?.message?.content;

  if (!messageOutput) {
    return;
  }

  const parts = messageOutput.split("\n\n");

  if (parts.length !== 2) {
    console.error(
      "Meme AI didn't format output properly. Output is: " + messageOutput,
    );
    return;
  }

  return {
    punchline: parts[0],
    imageGenPrompt: parts[1],
  };
}
