import { z } from "zod";
import { addText } from "../meme/memeGenerator";

export async function POST(request: Request) {
  const params = z
    .object({ punchline: z.string(), image_buffer: z.string().base64() })
    .safeParse(await request.json());

  if (!params.success) {
    return new Response("Invalid input.", { status: 400 });
  }

  const imageBuffer = Uint8Array.from(atob(params.data.image_buffer), (c) =>
    c.charCodeAt(0),
  );
  const meme = await addText(Buffer.from(imageBuffer), params.data.punchline);

  if (meme === undefined) {
    return Response.json({ error: "Couldn't generate meme." }, { status: 500 });
  }

  const res = new Response(meme);
  res.headers.set("Content-Type", "image/png");
  return res;
}
