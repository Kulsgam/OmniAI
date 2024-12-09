import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to adjust prompt.",
});

const ADJUSTMENT_QUERY = (adjustment: string) =>
  `
You assist the user by modifying a given prompt based on a specified adjustment. For example:

Adjustment: Make it funnier.
Prompt: Write a post about AI replacing jobs for a Twitter audience.
Amended prompt: Write a humorous post about AI replacing jobs for a Twitter audience.

Adjustment: Make it more formal.
Prompt: Explain how plants grow for a school project.
Amended prompt: Provide a formal explanation of how plants grow for an academic audience.

Adjustment: Add a sense of urgency.
Prompt: Write an email about the upcoming project deadline.
Amended prompt: Write an urgent email emphasizing the importance of the upcoming project deadline.

Adjustment: Simplify the language.
Prompt: Discuss the implications of quantum computing on modern encryption methods.
Amended prompt: Explain how quantum computing could affect encryption in simple terms.

Your task is to provide only the amended prompt in response, without any additional explanation or formatting.

Adjustment: ${adjustment}
`.trim();

async function getGroqChatCompletion(system: string, user: string) {
  const res = await groq.chat.completions.create({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: "llama3-70b-8192",
  });

  if (res.choices.length === 0) return null;

  const [
    {
      message: { content: resContent },
    },
  ] = res.choices;

  if (resContent === null) return null;

  return resContent;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("input_prompt");
  const adjustment = searchParams.get("adjustment");

  if (prompt === null || adjustment === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  const adjustedPrompt = await getGroqChatCompletion(
    ADJUSTMENT_QUERY(adjustment),
    prompt,
  );
  if (adjustedPrompt === null) return CouldNotGenerate;

  return Response.json(adjustedPrompt);
}
