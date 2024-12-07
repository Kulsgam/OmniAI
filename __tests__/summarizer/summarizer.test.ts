import LinkSummarizer from "@/app/api/ai/link/LinkSummarizer";

const links = [
  "https://stackoverflow.com/questions/77439058/how-to-get-text-from-webpage-by-url-js",
  "https://www.msn.com/en-au/news/other/labor-may-have-shot-itself-in-the-foot-with-nuclear-energy-inquiry/ar-AA1vqrVd",
  "https://geeksforgeeks.org/python-functools-lru_cache/",
];

describe("LinkSummarizer", () => {
  it("summarizes non-articles", async () => {
    const linkSummarizer = new LinkSummarizer([links[0]]);

    const summary = await linkSummarizer.summarize();

    // console.log(summary);

    expect(summary).toBeDefined();
  });

  it("summarizes articles", async () => {
    const linkSummarizer = new LinkSummarizer([links[1]]);

    const summary = await linkSummarizer.summarize();

    // console.log(summary);

    expect(summary).toBeDefined();
  });

  it("summarizes blogs", async () => {
    const linkSummarizer = new LinkSummarizer([links[2]]);

    const summary = await linkSummarizer.summarize();

    // console.log(summary);

    expect(summary).toBeDefined();
  });

  //   it("summarizes all articles", async () => {
  //     const linkSummarizer = new LinkSummarizer(links);

  //     const summary = await linkSummarizer.summarize();

  //     console.log(summary);

  //     expect(summary).toBeDefined();
  //   });
});
