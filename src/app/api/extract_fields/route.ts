import Groq from "groq-sdk";
import { type NextRequest } from "next/server";
import Queries from "../queries.json" with { type: "json" };

interface Field {
  name: string;
  subtopics: string[];
}

const CouldNotExtract = Response.json({
  success: false,
  message: "Was unable to extract fields of study.",
});

export async function getGroqChatCompletion(
  groq: Groq,
  system: string,
  user: string,
) {
  return groq.chat.completions.create({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    model: "llama3-8b-8192",
  });
}

export async function GET(request: NextRequest) {
  // Extracting the user query
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (query === null) {
    return new Response("Invalid input.", { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  /*
  Get all mentioned fields.
  Example output from the AI:
  Math
  Science
  */
  const fields = await getGroqChatCompletion(groq, Queries.extraction, query);
  if (fields.choices.length === 0) return CouldNotExtract;

  const [
    {
      message: { content: fieldsContent },
    },
  ] = fields.choices;
  // If the AI returns nothing
  if (fieldsContent === null || fieldsContent === "NULL")
    return CouldNotExtract;

  const extractedFields = fieldsContent.split("\n", 5);
  if (extractedFields.length === 0) return CouldNotExtract;

  const finalFields: Field[] = [];

  for (const field of extractedFields) {
    const subtopic = await getGroqChatCompletion(
      groq,
      Queries.subtopics,
      field,
    );

    if (subtopic.choices.length === 0) break;
    const [
      {
        message: { content: subtopicContent },
      },
    ] = subtopic.choices;

    if (subtopicContent === null || subtopicContent === "NULL") break;
    const extractedSubtopics = subtopicContent.split("\n");
    if (extractedSubtopics.length === 0) break;
    finalFields.push({ name: field, subtopics: extractedSubtopics });
  }

  // TODO: What if `finalFields` is empty?

  return Response.json({ success: true, fields: finalFields });
}
