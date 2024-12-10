import { portraitDims, landscapeDims, genVideoScript, calculateMaxChars } from "./videoGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputPrompt = searchParams.get("input_prompt");
  const aspectRatio = searchParams.get("aspect_ratio");
  const context = searchParams.get("context");

  if (
    inputPrompt === null ||
    aspectRatio !== "portrait" &&
    aspectRatio !== "landscape"
  ) {
    return new Response("Invalid input.", { status: 400 });
  }

  const dims = aspectRatio === "portrait" ? portraitDims : landscapeDims;
  const script = genVideoScript(inputPrompt, context ?? undefined);
  const maxChars = calculateMaxChars(dims.width, 24, 0.9);
  const 

  if (!script) {
    return new Response("Video script is undefined", { status: 500 });
  }

  return Response.json(text);
}
