"use client";

import * as Toggle from "@radix-ui/react-toggle";
import * as Separator from "@radix-ui/react-separator";
import * as Select from "@radix-ui/react-select";
import Icon from "@mdi/react";
import {
  mdiChevronDown,
  mdiCreation,
  mdiEmoticonExcited,
  mdiFormatText,
  mdiHistory,
  mdiImage,
  mdiPaletteSwatchVariant,
  mdiVideo,
} from "@mdi/js";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Generators {
  text: boolean;
  image: boolean;
  video: boolean;
  meme: boolean;
}

function ToggleGenerator({
  value,
  setValue,
  children,
}: {
  value: boolean;
  setValue: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Toggle.Root
      pressed={value}
      onPressedChange={setValue}
      className="flex items-center gap-1 rounded-lg bg-accent px-1.5 py-1 text-sm transition-all duration-200 data-[state=off]:bg-accent-dark data-[state=off]:text-accent sm:hover:bg-accent-light sm:data-[state=off]:hover:bg-accent sm:data-[state=off]:hover:text-accent-light"
    >
      {children}
    </Toggle.Root>
  );
}

function StyleOption({ text }: { text: string }) {
  return (
    <Select.Item
      value={text.toLowerCase()}
      className="flex w-full cursor-pointer items-center justify-center py-2 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg hover:bg-accent data-[highlighted]:outline-none"
    >
      <Select.ItemText>{text}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}

export default function Home() {
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [writingStyle, setWritingStyle] = useState<string | undefined>(
    undefined,
  );
  const [generators, setGenerators] = useState<Generators>({
    text: true,
    image: false,
    video: false,
    meme: false,
  });

  useEffect(() => {
    function isValid(): boolean {
      if (prompt.length === 0) return false;
      if (writingStyle === undefined) return false;
      if (
        generators.text === false &&
        generators.image === false &&
        generators.video === false &&
        generators.meme === false
      )
        return false;
      return true;
    }

    setDisabled(!isValid());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, writingStyle, generators]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div className="absolute left-1/2 top-5 flex w-[293px] -translate-x-1/2 justify-between sm:w-[500px] xl:w-[750px]">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="aspect-square w-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("/logo.png")` }}
          ></div>
          <h1 className="font-title text-xl">Omni</h1>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 rounded-lg bg-accent-dark px-3 py-2"
        >
          <Icon path={mdiHistory} className="aspect-square w-5" />
          History
        </Link>
      </div>

      <div className="flex flex-col items-center rounded-lg sm:bg-accent-darker sm:p-10 xl:w-[750px] xl:flex-row xl:gap-14">
        <div className="flex flex-col items-center justify-center">
          <div
            className="mb-8 aspect-square w-48 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("/logo.png")` }}
          ></div>
          <h1 className="mb-4 font-title text-5xl">Omni</h1>
          <p className="mb-16 w-[248px] text-center text-accent xl:mb-0">
            Generate text, images, and videos from a single prompt.
          </p>
        </div>
        <Separator.Root
          className="hidden h-96 w-px bg-accent-dark xl:block"
          decorative
          orientation="vertical"
        />
        <form
          className="flex w-[293px] flex-col items-center gap-2"
          onSubmit={(evt) => {
            evt.preventDefault();
            router.push("/generate");
          }}
        >
          <textarea
            name="prompt"
            rows={3}
            className="w-full resize-none rounded-lg bg-accent-dark px-4 py-3 placeholder:text-accent"
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(evt) => setPrompt(evt.target.value)}
          />

          <Select.Root value={writingStyle} onValueChange={setWritingStyle}>
            <Select.Trigger className="flex w-full items-center justify-between gap-2 rounded-lg bg-accent-dark px-2.5 py-2 data-[placeholder]:text-accent">
              <Icon
                path={mdiPaletteSwatchVariant}
                className="aspect-square w-5 text-accent"
              />
              <Select.Value placeholder="Select a style" />
              <Select.Icon asChild>
                <Icon
                  path={mdiChevronDown}
                  className="aspect-square w-4 text-accent"
                />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className="w-[293px] rounded-lg bg-accent-dark"
                position="popper"
              >
                <Select.ScrollUpButton />
                <Select.Viewport>
                  <StyleOption text="Narrative" />
                  <StyleOption text="Conversational" />
                  <StyleOption text="Technical" />
                  <StyleOption text="Persuasive" />
                  <StyleOption text="Formal" />
                  <StyleOption text="Humorous" />
                  <StyleOption text="Inspirational" />
                  <StyleOption text="Instructional" />
                  <StyleOption text="Poetic" />
                  <StyleOption text="Minimalist" />
                </Select.Viewport>
                <Select.ScrollDownButton />
                <Select.Arrow className="fill-accent-dark" />
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <div className="flex w-full gap-2">
            <ToggleGenerator
              value={generators.text}
              setValue={(value) =>
                setGenerators({ ...generators, text: value })
              }
            >
              <Icon path={mdiFormatText} className="aspect-square w-4" />
              Text
            </ToggleGenerator>
            <ToggleGenerator
              value={generators.image}
              setValue={(value) =>
                setGenerators({ ...generators, image: value })
              }
            >
              <Icon path={mdiImage} className="aspect-square w-4" />
              Image
            </ToggleGenerator>
            <ToggleGenerator
              value={generators.video}
              setValue={(value) =>
                setGenerators({ ...generators, video: value })
              }
            >
              <Icon path={mdiVideo} className="aspect-square w-4" />
              Video
            </ToggleGenerator>
            <ToggleGenerator
              value={generators.meme}
              setValue={(value) =>
                setGenerators({ ...generators, meme: value })
              }
            >
              <Icon path={mdiEmoticonExcited} className="aspect-square w-4" />
              Meme
            </ToggleGenerator>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
          >
            <Icon path={mdiCreation} className="-ml-3 aspect-square w-5" />
            Generate
          </button>
        </form>
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-accent">
        by the Newtrons
      </div>
    </div>
  );
}
