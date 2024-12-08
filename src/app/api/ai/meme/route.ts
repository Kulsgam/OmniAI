import genMemeBuffer from "./memeGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const context = searchParams.get("context");

  if (inputPrompt === null) {
    return Response.json(
      { error: "Missing query parameters." },
      { status: 400 },
    );
  }

  const meme = await genMemeBuffer(inputPrompt, context ?? undefined);

  if (meme === undefined) {
    return Response.json({ error: "Couldn't generate meme." }, { status: 500 });
  }

  const res = new Response(meme);
  res.headers.set("Content-Type", "image/png");
  return res;
}
