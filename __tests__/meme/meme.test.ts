import genMemeBuffer from "@/app/api/ai/meme/memeGenerator";
import fs from "fs";

describe("MemeGenerator", () => {
  it("generates without context", async () => {
    const memeBuffer = await genMemeBuffer(
      "Generate a 50 word story about stepping on a lego brick",
    );

    expect(memeBuffer).toBeDefined();

    fs.writeFileSync("without_context.png", memeBuffer!);
  });

  it("generates with context", async () => {
    const memeBuffer = await genMemeBuffer(
      "Generate a 50 word story about stepping on a lego brick",
      "On a quiet night, barefoot Sam tiptoed through the dark. Suddenly, agony! A tiny Lego brick embedded in his sole, a cruel surprise. He howled, hopping wildly. His child’s castle masterpiece lay in ruins nearby. Lesson learned: even small things, misplaced, can deliver mighty pain. The brick won the night.",
    );

    expect(memeBuffer).toBeDefined();

    fs.writeFileSync("with_context.png", memeBuffer!);
  });
});
