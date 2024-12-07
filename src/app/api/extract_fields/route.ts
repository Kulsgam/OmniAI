import Groq from "groq-sdk";
import Queries from "../queries.json" with { type: "json" };

// Assuming Groq is initialized somewhere
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getImagePrompt(inputPrompt: string, context?: string): Promise<string> {
    if (!context) {
        return inputPrompt; // Return the input prompt directly if no context is provided
    }

    try {
        // Call Groq's chat completion API to generate the image prompt
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `You are a helpful assistant generating creative image prompts.` },
                { role: "user", content: `Context: ${context}\nInput Prompt: ${inputPrompt}` }
            ],
            model: "llama3-8b-8192", // Adjust to your model version if needed
        });

        const [
            {
                message: { content: generatedPrompt },
            },
        ] = response.choices;

        return generatedPrompt || inputPrompt; // Return the generated prompt or the input prompt as fallback
    } catch (error) {
        console.error("Error generating image prompt:", error);
        return inputPrompt; // Return the input prompt as fallback in case of an error
    }
}

// interface Field {
//   name: string;
//   subtopics: string[];
// }

// const CouldNotExtract = Response.json({
//   success: false,
//   message: "Was unable to extract fields of study.",
// });

// export async function getGroqChatCompletion(
//   groq: Groq,
//   system: string,
//   user: string,
// ) {
//   return groq.chat.completions.create({
//     messages: [
//       { role: "system", content: system },
//       { role: "user", content: user },
//     ],
//     model: "llama3-8b-8192",
//   });
// }

// export async function GET(request: NextRequest) {
//   // Extracting the user query
//   const searchParams = request.nextUrl.searchParams;
//   const query = searchParams.get("query");

//   if (query === null) {
//     return new Response("Invalid input.", { status: 400 });
//   }

//   const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

//   /*
//   Get all mentioned fields.
//   Example output from the AI:
//   Math
//   Science
//   */
//   const fields = await getGroqChatCompletion(groq, Queries.extraction, query);
//   if (fields.choices.length === 0) return CouldNotExtract;

//   const [
//     {
//       message: { content: fieldsContent },
//     },
//   ] = fields.choices;
//   // If the AI returns nothing
//   if (fieldsContent === null || fieldsContent === "NULL")
//     return CouldNotExtract;

//   const extractedFields = fieldsContent.split("\n", 5);
//   if (extractedFields.length === 0) return CouldNotExtract;

//   const finalFields: Field[] = [];

//   for (const field of extractedFields) {
//     const subtopic = await getGroqChatCompletion(
//       groq,
//       Queries.subtopics,
//       field,
//     );

//     if (subtopic.choices.length === 0) continue;
//     const [
//       {
//         message: { content: subtopicContent },
//       },
//     ] = subtopic.choices;

//     if (subtopicContent === null || subtopicContent === "NULL") continue;
//     const extractedSubtopics = subtopicContent.split("\n");
//     if (extractedSubtopics.length === 0) continue;
//     finalFields.push({ name: field, subtopics: extractedSubtopics });
//   }

//   if (finalFields.length === 0) return CouldNotExtract;

//   return Response.json({ success: true, fields: finalFields });
// }
