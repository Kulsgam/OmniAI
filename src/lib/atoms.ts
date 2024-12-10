import { atom } from "jotai";

export interface Generate {
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
