import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import Groq from "groq-sdk";

export default class LinkSummarizer {
  links: string[];
  groq: Groq;
  summary: string | undefined;

  constructor(links: string[]) {
    this.summarize = this.summarize.bind(this);

    this.links = links;

    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async summarize(): Promise<string | undefined> {
    const texts = await this.texts();
    if (texts.length === 0) {
      return;
    }

    const text = texts.join("\n");

    const summarizedTextCompletion = await this.groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant which helps summarize the text given by the user. Once the user has given the text, you will summarize it",
        },
        { role: "user", content: `Here is the text: ${text}` },
      ],
      model: "llama3-8b-8192",
    });

    this.summary =
      summarizedTextCompletion.choices[0]?.message?.content || undefined;

    return this.summary;
  }

  private async texts(): Promise<string[]> {
    const texts = await Promise.all(this.links.map(this.extract));

    return texts.filter((summary) => summary !== undefined) as string[];
  }

  private async extract(link: string): Promise<string | undefined> {
    try {
      const response = await axios.get(link);
      const html = response.data;

      const dom = new JSDOM(html, { url: link });

      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (article?.textContent) {
        return article.textContent;
      }
    } catch (error) {
      console.error(`Failed to extract text from "${link}":`, error);
    }
  }
}
