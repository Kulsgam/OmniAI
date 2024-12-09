import {
  type Subtitle,
  combineVids,
  addSubtitles,
  combineAudio,
  addAudio,
} from "@/app/api/ai/video/videoManipulation";
import * as fs from "fs";
import * as path from "path";
jest.setTimeout(12000);

describe("Media Processing API Tests", () => {
  const outputDir = path.join(__dirname, "out");
  const dataDir = path.join(__dirname, "data");

  beforeAll(() => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  });

  afterAll(() => {
    // Cleanup output files
    fs.rmSync(outputDir, { recursive: true, force: true });
  });

  test("combineVids - combines two MP4 files", () => {
    const vid1 = fs.readFileSync(path.join(dataDir, "1.mp4"));
    const vid2 = fs.readFileSync(path.join(dataDir, "2.mp4"));

    const combined = combineVids([vid1, vid2]);
    const outputPath = path.join(outputDir, "combined.mp4");
    fs.writeFileSync(outputPath, combined);

    expect(fs.existsSync(outputPath)).toBe(true);
  });

  test("addSubtitles - adds subtitles to a video file", () => {
    const vid = fs.readFileSync(path.join(dataDir, "1.mp4"));
    const subtitles: Subtitle[] = [
      { duration: 2000, text: "Hello, world!" },
      { duration: 3000, text: "This is a test of subtitles." },
    ];

    const subtitled = addSubtitles(vid, subtitles, 24);
    const outputPath = path.join(outputDir, "subtitled.mp4");
    fs.writeFileSync(outputPath, subtitled);

    expect(fs.existsSync(outputPath)).toBe(true);
  });

  test("combineAudio - combines two MP3 files", () => {
    const aud1 = fs.readFileSync(path.join(dataDir, "1.mp3"));
    const aud2 = fs.readFileSync(path.join(dataDir, "2.mp3"));

    const combinedAudioBuffer = combineAudio([aud1, aud2]);
    const outputPath = path.join(outputDir, "combined.mp3");
    fs.writeFileSync(outputPath, combinedAudioBuffer);

    expect(fs.existsSync(outputPath)).toBe(true);
  });

  test("addAudio - adds audio track to a video file", () => {
    const vid = fs.readFileSync(path.join(dataDir, "1.mp4"));
    const aud = fs.readFileSync(path.join(dataDir, "1.mp3"));

    const videoWithAudio = addAudio(vid, aud);
    const outputPath = path.join(outputDir, "video_with_audio.mp4");
    fs.writeFileSync(outputPath, videoWithAudio);

    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
