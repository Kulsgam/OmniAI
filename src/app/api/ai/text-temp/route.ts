import Groq from "groq-sdk";
import axios from "axios";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const NewsSchema = z.object({
  status: z.literal("ok"),
  totalResults: z.number().int().gt(0),
  articles: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().url(),
      content: z.string(),
    }),
  ),
});

type NewsSchema = z.infer<typeof NewsSchema>;

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to generate text.",
});

const NEWS_QUERY = `
You are a helpful assistant that generates a relevant search query based on the provided text. The search query must only consist of keywords. The search query must be as short as possible. Provide only the search query as your response, with no additional text or formatting.
`.trim();

const TEXT_QUERY = (style: string) =>
  `
You are a helpful assistant that generates text for the provided prompt using a ${style} style. Please attempt to use less than 100 words.
  `.trim();

const TEXT_QUERY_WITH_NEWS = (
  style: string,
  news: Array<[string, string, string]>,
) =>
  `
Potentially useful news articles that can be referenced:

${news.map(([title, desc, content]) => `Title: ${title}\nDescription: ${desc}\nContent: ${content}`).join("\n\n")}

You are a helpful assistant that generates text for the provided prompt using a ${style} style. Please attempt to use less than 100 words.
`.trim();

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function getGroqChatCompletion(system: string, user: string) {
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
  if (NEWS_API_KEY === undefined) throw new Error("No API key for news.");

  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const style = searchParams.get("style");
  const enableNews = searchParams.get("enable_news") === "true";

  if (inputPrompt === null || style === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 1000));
  return Response.json({
    text: `
AI Trends Alert!

Hey LinkedIn friends! Want to stay ahead of the AI curve? From personalized pricing to cyber-physical futures, the latest trends are changing the game! 

Did you know that B2C companies are leveraging AI marketing to boost their sales and customer experience? Or that SEO and social media are merging into a new, powerful beast?

Stay informed, stay ahead! Share with me: what's the most exciting AI trend you're seeing in your industry right now? Let's connect and explore the future together! #AI #FutureOfWork #InnovationNation`.trim(),
    news: enableNews
      ? [
          { title: "abcd", url: "https://google.com" },
          { title: "xyz", url: "https://reddit.com" },
          { title: "ghj", url: "https://yahoo.com" },
        ]
      : null,
  });

  let newsData: NewsSchema | null = null;

  if (enableNews) {
    const newsQuery = await getGroqChatCompletion(NEWS_QUERY, inputPrompt);
    if (newsQuery === null) return CouldNotGenerate;

    const pageSize = 3;
    const endpoint = new URL(NEWS_API_URL);
    endpoint.searchParams.append("q", newsQuery);
    endpoint.searchParams.append("excludeDomains", "removed.com");
    endpoint.searchParams.append("pageSize", pageSize.toString(10));
    endpoint.searchParams.append("apiKey", NEWS_API_KEY);
    const res = await axios.get(endpoint.toString(), {
      validateStatus: () => true,
    });

    if (res.status !== 200) return CouldNotGenerate;
    newsData =
      z
        .object({
          status: z.literal("ok"),
          totalResults: z.number().int().gt(0),
          articles: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              url: z.string().url(),
              content: z.string(),
            }),
          ),
        })
        .safeParse(res.data).data ?? null;
  }

  if (newsData === null || newsData?.articles.length === 0) {
    const text = await getGroqChatCompletion(TEXT_QUERY(style), inputPrompt);
    if (text === null) return CouldNotGenerate;
    return Response.json({ text: text, news: null });
  } else {
    const textQuery = TEXT_QUERY_WITH_NEWS(
      style,
      newsData.articles.map((x) => [x.title, x.description, x.content]),
    );
    const text = await getGroqChatCompletion(textQuery, inputPrompt);
    if (text === null) return CouldNotGenerate;

    return Response.json({
      text: text,
      news: newsData.articles.map((x) => ({ title: x.title, url: x.url })),
    });
  }
}
