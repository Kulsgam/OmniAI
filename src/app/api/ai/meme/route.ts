import { genMemeImg } from "./memeGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const context = searchParams.get("context");

  if (inputPrompt === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  const meme = await genMemeImg(inputPrompt, context ?? undefined);

  if (meme === undefined) {
    return Response.json({ error: "Couldn't generate meme." }, { status: 500 });
  }

  const base64String = btoa(String.fromCharCode(...new Uint8Array(meme[0])));
  return Response.json({ punchline: meme[1], buffer: base64String });
}
