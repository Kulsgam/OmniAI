import { genMemeIdea } from "./memeGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const context = searchParams.get("context");

  if (inputPrompt === null) {
    return new Response("Invalid input.", { status: 400 });
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
