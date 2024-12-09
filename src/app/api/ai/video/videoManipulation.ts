import { execSync } from "child_process";
import { mkdtempSync, writeFileSync, readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export type Subtitle = {
  duration: number;
  text: string;
};

function cleanupFiles(...files: string[]): void {
  for (const file of files) {
    try {
      unlinkSync(file);
    } catch {
      // ignore cleanup errors
    }
  }
}

export function combineVids(vids: Buffer[]): Buffer {
  // 1. Write each video buffer to a temp file
  const dir = mkdtempSync(join(tmpdir(), "ffmpeg-combinevids-"));
  const inputFiles: string[] = [];
  for (let i = 0; i < vids.length; i++) {
    const filePath = join(dir, `part${i}.mp4`);
    writeFileSync(filePath, vids[i]);
    inputFiles.push(filePath);
  }

  // 2. Create a concat list file
  const listFile = join(dir, "concat.txt");
  const listContent = inputFiles.map((file) => `file '${file}'`).join("\n");
  writeFileSync(listFile, listContent);

  // 3. Run ffmpeg concat
  const outputFile = join(dir, "output.mp4");
  // -safe 0 required if absolute paths are used.
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`,
  );

  // 4. Read output into buffer
  const result = readFileSync(outputFile);

  // 5. Cleanup
  cleanupFiles(...inputFiles, listFile, outputFile);

  return result;
}

export function addSubtitles(
  vid: Buffer,
  subs: Subtitle[],
  fontsize: number = 24,
): Buffer {
  // Write video to temp
  const dir = mkdtempSync(join(tmpdir(), "ffmpeg-subtitles-"));
  const inputVideo = join(dir, "video.mp4");
  writeFileSync(inputVideo, vid);

  // Create .srt subtitle file
  // SRT format example:
  // 1
  // 00:00:00,000 --> 00:00:05,000
  // Hello world!
  //
  let srtContent = "";
  let currentTime = 0;
  subs.forEach((sub, i) => {
    const start = currentTime;
    const end = currentTime + sub.duration;
    currentTime = end;

    function msToTime(ms: number): string {
      const hrs = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      const msRemainder = ms % 1000;
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${msRemainder
        .toString()
        .padStart(3, "0")}`;
    }

    // Convert durations from number (assumed ms) to SRT time format
    const startTime = msToTime(start);
    const endTime = msToTime(end);
    srtContent += `${i + 1}\n${startTime} --> ${endTime}\n${sub.text}\n\n`;
  });

  const subtitleFile = join(dir, "subs.srt");
  writeFileSync(subtitleFile, srtContent);

  const outputFile = join(dir, "output.mp4");
  // Burn subtitles into the video
  execSync(
    `ffmpeg -y -i "${inputVideo}" -vf "subtitles='${subtitleFile}':force_style='FontName=Ubuntu Mono,FontSize=${fontsize}'" -c:a copy "${outputFile}"`,
  );

  const result = readFileSync(outputFile);

  // Cleanup
  cleanupFiles(inputVideo, subtitleFile, outputFile);

  return result;
}

export function combineAudio(audio: Buffer[]): Buffer {
  const dir = mkdtempSync(join(tmpdir(), "ffmpeg-combineaudio-"));
  const inputFiles: string[] = [];

  // Save each Buffer as a temporary audio file
  for (let i = 0; i < audio.length; i++) {
    const filePath = join(dir, `audio${i}.mp3`);
    writeFileSync(filePath, audio[i]);
    inputFiles.push(filePath);
  }

  // Create a file list for FFmpeg concatenation
  const listFile = join(dir, "filelist.txt");
  const listContent = inputFiles.map((file) => `file '${file}'`).join("\n");
  writeFileSync(listFile, listContent);

  // Output file path
  const outputFile = join(dir, "combined.mp3");

  // FFmpeg concatenation using the file list
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`,
  );

  const result = readFileSync(outputFile);

  // Cleanup
  cleanupFiles(...inputFiles, listFile, outputFile);

  return result;
}

export function addAudio(vid: Buffer, audio: Buffer): Buffer {
  const dir = mkdtempSync(join(tmpdir(), "ffmpeg-addaudio-"));
  const videoFile = join(dir, "video.mp4");
  const audioFile = join(dir, "audio.mp3");
  writeFileSync(videoFile, vid);
  writeFileSync(audioFile, audio);

  const outputFile = join(dir, "output.mp4");
  // Map video from input 0 and audio from input 1
  // Re-encode audio if needed
  execSync(
    `ffmpeg -y -i "${videoFile}" -i "${audioFile}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputFile}"`,
  );

  const result = readFileSync(outputFile);

  // Cleanup
  cleanupFiles(videoFile, audioFile, outputFile);

  return result;
}
