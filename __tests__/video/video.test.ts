import { genVideoBuffer } from "@/pages/api/videoGenerator";
import assert from "assert";
import fs from "fs";
jest.setTimeout(120000);

describe("Video Generator", () => {
  it("generates long prompt videos", async () => {
    const buffer = await genVideoBuffer(
      "Create a 10-second animated video with a humorous tone, featuring a robotic arm replacing a human in a coffee shop scenario. Incorporate bright colors, upbeat background music, and minimal text overlays. The video should be fast-paced and attention-grabbing, with a mix of physical comedy and witty one-liners. The style should be reminiscent of a popular social media animation.",
    );

    expect(buffer).toBeDefined();

    assert(buffer);

    fs.writeFileSync("output_video.mp4", buffer);
  });
});
