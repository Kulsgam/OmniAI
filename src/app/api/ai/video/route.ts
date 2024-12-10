import {
  portraitDims,
  landscapeDims,
  genVideoScript,
  calculateMaxChars,
  splitTextIntoChunks,
  TTS,
  genVideoPrompts,
  genVideoBuffer,
} from "./videoGenerator";
import {
  type Subtitle,
  addSubtitles,
  combineAudio,
  combineVids,
  addAudio,
} from "./videoManipulation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const aspectRatio = searchParams.get("aspect_ratio");
  const context = searchParams.get("context");

  if (
    inputPrompt === null ||
    (aspectRatio !== "portrait" && aspectRatio !== "landscape")
  ) {
    return new Response("Invalid input.", { status: 400 });
  }

  const dims = aspectRatio === "portrait" ? portraitDims : landscapeDims;
  const script = await genVideoScript(inputPrompt, context ?? undefined);

  if (script === undefined) {
    return new Response("Video script is undefined", { status: 500 });
  }

  const maxChars = await calculateMaxChars(dims.width, 24, 0.9);
  const subtitleTxts = await splitTextIntoChunks(script, maxChars);
  const audioBuffersWithBuffers = await Promise.all(
    subtitleTxts.map((subtitle) => TTS(subtitle)),
  );
  const normalBuffers = audioBuffersWithBuffers.map(
    ([normalBuffer]) => normalBuffer,
  );
  const audioBuffers = audioBuffersWithBuffers.map(
    ([, audioBuffer]) => audioBuffer,
  );
  const totTime = audioBuffers.reduce(
    (sum, audioBuffer) => sum + audioBuffer.duration,
    0,
  );
  const videoPrompts = await genVideoPrompts(script, totTime);
  if (videoPrompts === undefined) {
    return new Response("Video prompts is undefined", { status: 500 });
  }

  const videoBuffersPromises = videoPrompts.map((videoPrompt) =>
    genVideoBuffer(videoPrompt),
  );
  const audioDurations = audioBuffers.map(
    (audioBuffer) => audioBuffer.duration,
  );
  const subtitles: Subtitle[] = subtitleTxts.map((text, index) => ({
    duration: audioDurations[index], // Get the corresponding duration
    text, // The current text chunk
  }));
  const videoBuffers = await Promise.all(videoBuffersPromises);
  const anyUndefined = videoBuffers.some(
    (videoBuffer) => videoBuffer === undefined,
  );
  if (!anyUndefined) {
    return new Response("Video prompts is undefined", { status: 500 });
  }

  const combinedVid = combineVids(videoBuffers as Buffer[]);
  const combinedAudio = combineAudio(normalBuffers);

  const subtitledVid = addSubtitles(combinedVid, subtitles);

  const finalVid = addAudio(subtitledVid, combinedAudio);

  const response = new Response(finalVid);

  response.headers.set("Content-Type", "video/mp4");

  return response;
}
