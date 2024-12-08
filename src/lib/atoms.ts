import { atom } from "jotai";

interface Generate {
  prompt: string;
  style: string;
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
  prompt:
    "Generate a witty tweet about how AI struggles to understand sarcasm.",
  style: "humorous",
  enableNews: false,
  generators: { text: false, image: false, video: false, meme: false },
});
