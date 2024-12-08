import Groq from "groq-sdk";
import axios from "axios";

const systemPrompt = `You are a helpful assistant that generates video ideas. Given the context and a userInput, you will generate an appropriate description of the video and also a video prompt for the other AI. Additionally, provide a suitable comment to be added under the video. The punchline, video generation prompt, and comment should be separated by 2 newlines. DO NOT GIVE ANY OUTPUT OTHER THAN THE FOLLOWING FORMAT:
\`\`\`
<punchline>

<video_gen_prompt>

<comment>
\`\`\``;

export type VideoIdea = {
  punchline: string;
  videoGenPrompt: string;
  comment: string;
};

export default async function genVideo(userInputPrompt, context) {
  console.log("initiating");
  const videoIdea = await genVideoIdea(userInputPrompt, context);

  if (!videoIdea) {
    return;
  }

  const videoBuffer = await genVideoBuffer(videoIdea.videoGenPrompt);

  if (!videoBuffer) {
    return;
  }

  const finalVideo = await addTextToVideo(videoBuffer, videoIdea.punchline);

  return {
    punchline: videoIdea.punchline,
    comment: videoIdea.comment,
    videoBuffer: finalVideo,
  };
}

async function genVideoIdea(userInputPrompt, context) {
  const finalPrompt = `userInput: ${userInputPrompt}\n${context ? `context: ${context}` : ""}`;

  console.log("calling groq");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, dangerouslyAllowBrowser: true});

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: finalPrompt },
    ],
    model: "llama3-8b-8192",
    temperature: 1,
    top_p: 1,
    max_tokens: 1024,
  });

  const messageOutput = response.choices[0]?.message?.content;
  console.log(messageOutput);

  if (!messageOutput) {
    return;
  }

  const parts = messageOutput.split("\n\n");

  if (parts.length > 99) {
    console.error(
      "Video AI didn't format output properly. Output is: " + messageOutput
    );
    return;
  }

  return {
    punchline: parts[0],
    videoGenPrompt: parts[1],
    comment: parts[2],
  };
}

async function genVideoBuffer(prompt) {
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
          Authorization: "Bearer 82cbc360-fce7-4914-a7fe-6fb3ee792647",
        },
      }
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
            Authorization: "Bearer 82cbc360-fce7-4914-a7fe-6fb3ee792647",
          },
        }
      );

      status = statusResponse.data.task.status;

      if (status === "TASK_STATUS_SUCCEED") {
        videoUrl = statusResponse.data.videos[0]?.video_url;
        console.log(videoUrl);
        break;
      }

      if (status !== "TASK_STATUS_PROCESSING" && status !== "TASK_STATUS_QUEUED") {
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

async function addTextToVideo(buffer, text) {
  try {
    console.log("Adding text to video...");
    return buffer;
  } catch (error) {
    console.error("Error adding text to video:", error);
  }
}
