import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

class LinkSummarizer {
  links: string[];

  constructor(links: string[]) {
    this.extract = this.extract.bind(this);

    this.links = links;
  }

  async summarize(): Promise<string | undefined> {
    const texts = await this.texts();
    if (texts.length === 0) {
      return;
    }

    const text = texts.join("\n");
  }

  private async texts(): Promise<string[]> {
    const summaries = await Promise.all(this.links.map(this.extract));

    return summaries.filter((summary) => summary !== undefined) as string[];
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
