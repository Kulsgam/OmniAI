import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

import { genImageBuffer } from "../meme/memeGenerator";

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to generate image.",
});

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

const IMAGE_PROMPT_QUERY = `
You are a helpful assistant who generates an image generation prompt for the provided text.
`.trim();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const aspectRatio = searchParams.get("aspect_ratio");
  const inputPrompt = searchParams.get("input_prompt");
  const context = searchParams.get("context");
  const imagePrompt = searchParams.get("image_prompt");

  if ((inputPrompt === null) === (imagePrompt === null)) {
    return new Response("Invalid input.", { status: 400 });
  }

  if (aspectRatio !== "portrait" && aspectRatio !== "landscape") {
    return new Response("Invalid input.", { status: 400 });
  }

  if (imagePrompt) {
    const imageBuffer = await genImageBuffer(imagePrompt, aspectRatio);
    if (imageBuffer === undefined) return CouldNotGenerate;
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer)),
    );
    return Response.json({ image_prompt: null, image_buffer: base64String });
  }

  const newImagePrompt = await getGroqChatCompletion(
    IMAGE_PROMPT_QUERY,
    `userInput: ${inputPrompt}\n${context ? `context: ${context}` : ""}`,
  );

  if (newImagePrompt === null) return CouldNotGenerate;

  const imageBuffer = await genImageBuffer(newImagePrompt, aspectRatio);
  if (imageBuffer === undefined) return CouldNotGenerate;
  const base64String = btoa(
    String.fromCharCode(...new Uint8Array(imageBuffer)),
  );
  return Response.json({
    image_prompt: newImagePrompt,
    image_buffer: base64String,
  });
}
