"use server";

import Groq from "groq-sdk";
import axios from "axios";
import assert from "assert";

export const portraitDims = {
  height: 768,
  width: 432,
};

export const landscapeDims = {
  height: 432,
  width: 768,
};

export function calculateMaxChars(
  screenWidth: number,
  fontSize: number,
  maxWidthPercentage: number = 0.9,
): number {
  const usableWidth = screenWidth * maxWidthPercentage;
  const charWidthToFontSizeRatio = 0.6;

  return Math.floor(usableWidth / (fontSize * charWidthToFontSizeRatio));
}

export function splitTextIntoChunks(text: string, maxChars: number): string[] {
  const words = text.split(" ");

  assert(maxChars > Math.max(...words.map((word) => word.length)));

  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if (word.length > maxChars) {
      throw new Error(
        `A single word (${word}) exceeds the maximum character limit.`,
      );
    }

    if (currentChunk.length + word.length + 1 <= maxChars) {
      currentChunk += (currentChunk.length > 0 ? " " : "") + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function genVideoPrompt(videoScript: string, totTime: number) {
  const systemPrompt = `You are a world class video prompt generating machine. Given an input video script by the user, you will generate ${Math.ceil(totTime / 6)} video prompts in sequential manner, relevant to the video script. Each of those video prompts are separated by 2 newlines. The generated text should include ONLY the video prompts and NO other filler text.
  eg:-
  \`\`\`
  Gloomy environment

  A dark room

  Door closing
  \`\`\``;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: videoScript },
    ],
    model: "llama3-70b-8192",
    temperature: 1,
    top_p: 1,
    max_tokens: 1024,
  });

  const messageOutput = response.choices[0]?.message?.content;

  if (!messageOutput) {
    return;
  }

  return messageOutput.split("\n\n");
}

export async function genVideoScript(userInput: string, context?: string) {
  const systemPrompt = `You are a world class video script generating machine, and the video scripts you generate are approximately 30 seconds. The output you generate is entirely the video text only and NO other filler text. You use the input given by the user as context to generate the video script. The video script should only be the text spoken by the user and NOT any other text. The output shouldn't include the roles, and it should only be the narrative text spoken by the user.`;

  const finalPrompt = `userInput: ${userInput}\n${context ? `context: ${context}` : ""}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: finalPrompt },
    ],
    model: "llama3-70b-8192",
    temperature: 1,
    top_p: 1,
    max_tokens: 1024,
  });

  const messageOutput = response.choices[0]?.message?.content;

  return messageOutput ?? undefined;
}

export async function genVideoBuffer(prompt: string) {
  try {
    const payload = {
      extra: {
        response_video_type: "mp4",
      },
      model_name: "dreamshaper_8_93211.safetensors",
      height: 512,
      width: 768,
      seed: 20231219,
      steps: 20,
      negative_prompt:
        "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime, mutated hands and fingers:1.4), (deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation",
      prompts: [
        {
          prompt: prompt,
          frames: 16,
        },
      ],
      guidance_scale: 7.5,
      loras: [
        {
          model_name: "add_detail_44319",
          strength: 0.8,
        },
      ],
      closed_loop: false,
      clip_skip: 3,
    };

    console.log("hello");
    const postResponse = await axios.post(
      "https://api.novita.ai/v3/async/txt2video",
      payload,
      {
        headers: {
          Authorization: "Bearer " + process.env.NOVITA_API,
        },
      },
    );

    const taskId = postResponse.data.task_id;
    console.log(taskId);
    let status;
    let videoUrl;

    do {
      const statusResponse = await axios.get(
        `https://api.novita.ai/v3/async/task-result?task_id=${taskId}`,
        {
          headers: {
            Authorization: "Bearer " + process.env.NOVITA_API,
          },
        },
      );

      status = statusResponse.data.task.status;

      if (status === "TASK_STATUS_SUCCEED") {
        videoUrl = statusResponse.data.videos[0]?.video_url;
        console.log(videoUrl);
        break;
      }

      if (
        status !== "TASK_STATUS_PROCESSING" &&
        status !== "TASK_STATUS_QUEUED"
      ) {
        console.error("Task failed with status: " + status);
        return;
      }

      // Delay for polling
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (true);

    if (videoUrl) {
      const videoResponse = await axios.get(videoUrl, {
        responseType: "arraybuffer",
      });

      return Buffer.from(videoResponse.data);
    }
  } catch (error) {
    console.error("Error generating video buffer:", error);
  }
}
