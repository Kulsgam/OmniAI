import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to generate text.",
});

function PLATFORM(platform?: string) {
  return platform ? `You will also generate the text for ${platform}.` : "";
}

const TEXT_QUERY = (style: string, platform?: string) =>
  `
You are a helpful assistant that generates text for the provided prompt using a ${style} style. ${PLATFORM(platform)}Please attempt to use less than 100 words.
`.trim();

const TEXT_QUERY_WITH_NEWS = (style: string, news: string, platform?: string) =>
  `
Potentially useful news summaries that can be referenced:

${news}

You are a helpful assistant that generates text for the provided prompt using a ${style} style. ${PLATFORM(platform)}Please attempt to use less than 100 words.
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
  const inputPrompt = searchParams.get("input_prompt");
  const style = searchParams.get("style");
  const news = searchParams.get("news_summary");
  const platform = searchParams.get("platform");

  if (inputPrompt === null || style === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  const textQuery =
    news === null
      ? TEXT_QUERY(style, platform ?? undefined)
      : TEXT_QUERY_WITH_NEWS(style, news, platform ?? undefined);

  const text = await getGroqChatCompletion(textQuery, inputPrompt);
  if (text === null) return CouldNotGenerate;

  return Response.json(text);
}
