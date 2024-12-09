import { genImageBuffer } from "../meme/memeGenerator";

const CouldNotGenerate = Response.json({
  success: false,
  message: "Was unable to generate image.",
});

const IMAGE_PROMPT_QUERY = `
You are a helpful assistant who generates an image generation prompt for the provided text.
`.trim();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const context = searchParams.get("context");
  const imagePrompt = searchParams.get("image_prompt");

  if ((inputPrompt === null) === (imagePrompt === null)) {
    return new Response("Invalid input.", { status: 400 });
  }

  if (imagePrompt) {
    const imageBuffer = await genImageBuffer(imagePrompt);
    if (imageBuffer === undefined) return CouldNotGenerate;
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer)),
    );
    return Response.json({ image_prompt: null, image_buffer: base64String });
  }

  const memeIdea = await genMemeIdea(inputPrompt, context ?? undefined);

  if (memeIdea === undefined) {
    return Response.json({ error: "Couldn't generate meme." }, { status: 500 });
  }

  return Response.json({
    punchline: memeIdea.punchline,
    imageGenPrompt: memeIdea.imageGenPrompt,
  });
}
