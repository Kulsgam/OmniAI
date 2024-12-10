"use client";

import * as Separator from "@radix-ui/react-separator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSetAtom } from "jotai";
import { generateSettingsAtom } from "@/lib/atoms";
import Prompt from "@/components/Prompt";

export default function Home() {
  const router = useRouter();
  const setGenerateSettings = useSetAtom(generateSettingsAtom);

  return (
    <div className="fullscreen relative flex flex-col items-center">
      <div className="mb-10 mt-5 flex w-[293px] justify-between sm:w-[500px] xl:w-[750px]">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="aspect-square w-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("/logo.png")` }}
          ></div>
          <h1 className="font-title text-xl">OmniAI</h1>
        </Link>
      </div>

      <div className="flex flex-col items-center rounded-lg sm:bg-accent-darker sm:p-10 xl:w-[750px] xl:flex-row xl:gap-14">
        <div className="flex flex-col items-center justify-center">
          <div
            className="mb-8 aspect-square w-48 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("/logo.png")` }}
          ></div>
          <h1 className="mb-4 font-title text-5xl">OmniAI</h1>
          <p className="mb-8 w-[248px] text-center text-accent xl:mb-0">
            Turn Headlines into Highlights.
          </p>
        </div>

        <Separator.Root
          className="hidden h-96 w-[2px] bg-accent-dark xl:block"
          decorative
          orientation="vertical"
        />

        <Prompt
          onSubmit={(settings) => {
            setGenerateSettings({
              ...settings,
              generators: { ...settings.generators },
            });
            router.push("/generate");
          }}
        />
      </div>
      <div className="mb-5 mt-10 text-accent">by the Newtrons</div>
    </div>
  );
}
