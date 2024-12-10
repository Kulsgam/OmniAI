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

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to generate news summary.",
});

const NEWS_QUERY = `
You are a helpful assistant that generates a relevant search query based on the provided text. The search query must only consist of keywords. The search query must be as short as possible. Provide only the search query as your response, with no additional text or formatting.
`.trim();

const SUMMARIZE_QUERY = `
You are a helpful assistant that summarizes the provided news articles.
`.trim();

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

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
  if (NEWS_API_KEY === undefined) throw new Error("No API key for news.");

  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");

  if (inputPrompt === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  const newsQuery = await getGroqChatCompletion(NEWS_QUERY, inputPrompt);
  if (newsQuery === null) return CouldNotGenerate;

  const pageSize = 3;
  const endpoint = new URL(NEWS_API_URL);
  endpoint.searchParams.append("q", newsQuery);
  endpoint.searchParams.append("pageSize", pageSize.toString(10));
  endpoint.searchParams.append("apiKey", NEWS_API_KEY);
  const res = await axios.get(endpoint.toString(), {
    validateStatus: () => true,
  });

  if (res.status !== 200) return CouldNotGenerate;
  const newsData = NewsSchema.safeParse(res.data);
  if (!newsData.success) return CouldNotGenerate;

  newsData.data.articles = newsData.data.articles.filter(
    (article) => !article.url.includes("removed.com"),
  );

  const summary = await getGroqChatCompletion(
    SUMMARIZE_QUERY,
    newsData.data.articles
      .map(
        (x) =>
          `Title: ${x.title}\nDescription: ${x.description}\nContent: ${x.content}`,
      )
      .join("\n\n"),
  );
  if (summary === null) return CouldNotGenerate;

  return Response.json({
    summary,
    news: newsData.data.articles.map((x) => ({ title: x.title, url: x.url })),
  });
}
