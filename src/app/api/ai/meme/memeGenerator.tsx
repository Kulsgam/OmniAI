// Context, and userInputPrompt -> punchline for the meme in addition to an image generation prompt
import Groq from "groq-sdk";
import axios from "axios";
import sharp from "sharp";

const systemPrompt = `You are a helpful assistant which helps generating meme ideas. Given the context and a userInput, you will generate a meme punchline and also an image generation prompt for the meme.
The punchline and image generation prompt should be separated by 2 newlines. DO NOT GIVE ANY OUTPUT OTHER THAN THE PUNCHLINE AND IMAGE GENERATION PROMPT. So, it should be in the following format:
\`\`\`
<punchline>

<image_gen_prompt>
\`\`\`

eg:-
\`\`\`
That face you give when you see your ex

A face with a strong expression of disgust
\`\`\``;

export type MemeIdea = {
  punchline: string;
  imageGenPrompt: string;
};

export async function genMemeBuffer(userInputPrompt: string, context?: string) {
  const memeIdea = await genMemeIdea(userInputPrompt, context);

  if (!memeIdea) {
    return;
  }

  const imgBuffer = await genImageBuffer(memeIdea.imageGenPrompt);

  if (!imgBuffer) {
    return;
  }

  return addText(imgBuffer, memeIdea.punchline);
}

async function genMemeIdea(
  userInputPrompt: string,
  context?: string,
): Promise<MemeIdea | undefined> {
  const finalPrompt = `userInput: ${userInputPrompt}\n${context ? `context: ${context}` : ""}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: finalPrompt },
    ],
    model: "llama3-8b-8192",
  });

  const messageOutput = response.choices[0]?.message?.content;

  if (!messageOutput) {
    return;
  }

  const parts = messageOutput.split("\n\n");

  if (parts.length !== 2) {
    console.error(
      "Meme AI didn't format output properly. Output is: " + messageOutput,
    );
    return;
  }

  return {
    punchline: parts[0],
    imageGenPrompt: parts[1],
  };
}

async function addText(buffer: Buffer, text: string) {
  try {
    // Get the metadata of the original image to match dimensions
    const imageMetadata = await sharp(buffer).metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      throw new Error("Invalid image dimensions");
    }

    const width = imageMetadata.width;
    const fontSize = 24; // Adjust the font size if needed
    const padding = 20; // Padding above and below the text
    const lineHeight = fontSize * 1.2; // Line height multiplier

    // Estimate height based on text length and width
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      const testLineWidth = testLine.length * (fontSize * 0.6); // Approx. width of each character
      if (testLineWidth < width) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const textHeight = lines.length * lineHeight + padding * 2;

    // Create a text overlay image
    const textOverlay = await sharp({
      create: {
        width: width,
        height: Math.ceil(textHeight), // Dynamic height based on text
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${width}" height="${Math.ceil(textHeight)}">
              <style>
                .text {
                  fill: white;
                  font-size: ${fontSize}px;
                  dominant-baseline: middle;
                  text-anchor: middle;
                }
              </style>
              ${lines
                .map(
                  (line, index) =>
                    `<text x="50%" y="${
                      padding + lineHeight * (index + 0.5)
                    }" class="text">${line}</text>`,
                )
                .join("")}
            </svg>`,
          ),
        },
      ])
      .toBuffer();

    // Combine the text overlay and the original image
    const finalImage = await sharp({
      create: {
        width: width,
        height: imageMetadata.height + Math.ceil(textHeight), // Add space for the text overlay
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      },
    })
      .composite([
        { input: textOverlay, top: 0, left: 0 }, // Add text overlay at the top
        { input: buffer, top: Math.ceil(textHeight), left: 0 }, // Add the original image below the text
      ])
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error("Error adding text to image:", error);
  }
}

async function genImageBuffer(prompt: string) {
  const imgURL = `https://pollinations.ai/p/${encodeURIComponent(prompt)}`;

  try {
    const response = await axios.get(imgURL, {
      responseType: "arraybuffer", // Ensure the response is returned as a buffer
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error fetching image buffer:", error);
  }
}
