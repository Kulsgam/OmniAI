import { atom } from "jotai";

interface Generate {
  prompt: string;
  style: string;
  platform: string;
  enableNews: boolean;
  generators: {
    text: boolean;
    image: boolean;
    video: boolean;
    meme: boolean;
  };
}

// export const generateSettingsAtom = atom<Generate | null>(null);
export const generateSettingsAtom = atom<Generate | null>({
  prompt: "Generate a tweet about how AI struggles to understand sarcasm.",
  style: "humorous",
  platform: "LinkedIn",
  enableNews: true,
  generators: { text: false, image: false, video: false, meme: false },
});
