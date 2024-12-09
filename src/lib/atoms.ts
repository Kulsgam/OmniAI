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

export const generateSettingsAtom = atom<Generate | null>(null);
