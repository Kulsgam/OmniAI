"use client";

import { Generate } from "@/lib/atoms";
import { ReactNode, useState } from "react";
import * as Toggle from "@radix-ui/react-toggle";
import * as Select from "@radix-ui/react-select";
import * as Checkbox from "@radix-ui/react-checkbox";
import Icon from "@mdi/react";
import {
  mdiCheckBold,
  mdiChevronDown,
  mdiCreation,
  mdiEmoticonExcited,
  mdiFacebook,
  mdiFormatText,
  mdiImage,
  mdiInstagram,
  mdiLinkedin,
  mdiPaletteSwatchVariant,
  mdiReddit,
  mdiRefresh,
  mdiShare,
  mdiTwitter,
  mdiVideo,
} from "@mdi/js";

function getSettings(
  generators: Generate["generators"],
  prompt: string,
  enableNews: boolean,
  writingStyle?: string,
  platform?: string,
): Generate | null {
  if (prompt.length === 0) return null;
  if (writingStyle === undefined) return null;
  if (platform === undefined) return null;
  if (
    generators.text === false &&
    generators.image === false &&
    generators.video === false &&
    generators.meme === false
  ) {
    return null;
  }

  return {
    prompt,
    style: writingStyle,
    enableNews,
    platform,
    generators: { ...generators },
  };
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

function StyleOption({
  text,
  children,
}: {
  text: string;
  children?: ReactNode;
}) {
  return (
    <Select.Item
      value={text.toLowerCase()}
      className="group flex w-full cursor-pointer items-center justify-center gap-2 py-2 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg hover:bg-accent data-[highlighted]:outline-none"
    >
      {children}
      <Select.ItemText>{text}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}

function Prompt({
  onSubmit,
  regenerate = false,
  initial = {
    prompt: "",
    writingStyle: "neutral",
    platform: "none",
    generators: {
      text: true,
      image: false,
      video: false,
      meme: false,
    },
    enableNews: true,
  },
}: {
  regenerate?: boolean;
  initial?: {
    prompt: string;
    writingStyle?: string;
    platform?: string;
    generators: Generate["generators"];
    enableNews: boolean;
  };
  onSubmit: (settings: Generate) => void;
}) {
  const [prompt, setPrompt] = useState(initial.prompt);
  const [writingStyle, setWritingStyle] = useState<string | undefined>(
    initial.writingStyle,
  );
  const [platform, setPlatform] = useState<string | undefined>(
    initial.platform,
  );
  const [generators, setGenerators] = useState<Generate["generators"]>(
    initial.generators,
  );
  const [enableNews, setEnableNews] = useState(initial.enableNews);

  const settings = getSettings(
    generators,
    prompt,
    enableNews,
    writingStyle,
    platform,
  );

  return (
    <form
      className="flex w-[293px] flex-col items-center gap-2"
      onSubmit={(evt) => {
        evt.preventDefault();
        if (settings !== null) onSubmit(settings);
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
              <StyleOption text="Neutral" />
              <StyleOption text="Conversational" />
              <StyleOption text="Formal" />
              <StyleOption text="Humorous" />
              <StyleOption text="Explanatory" />
              <StyleOption text="Concise" />
            </Select.Viewport>
            <Select.ScrollDownButton />
            <Select.Arrow className="fill-accent-dark" />
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <Select.Root value={platform} onValueChange={setPlatform}>
        <Select.Trigger className="flex w-full items-center justify-between gap-2 rounded-lg bg-accent-dark px-2.5 py-2 data-[placeholder]:text-accent">
          <Icon path={mdiShare} className="aspect-square w-5 text-accent" />
          <Select.Value placeholder="Select a platform" />
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
              <StyleOption text="None" />
              <StyleOption text="Twitter">
                <Icon
                  path={mdiTwitter}
                  className="aspect-square w-5 text-accent transition-colors duration-200 group-hover:text-white"
                />
              </StyleOption>
              <StyleOption text="Facebook">
                <Icon
                  path={mdiFacebook}
                  className="aspect-square w-5 text-accent transition-colors duration-200 group-hover:text-white"
                />
              </StyleOption>
              <StyleOption text="LinkedIn">
                <Icon
                  path={mdiLinkedin}
                  className="aspect-square w-5 text-accent transition-colors duration-200 group-hover:text-white"
                />
              </StyleOption>
              <StyleOption text="Instagram">
                <Icon
                  path={mdiInstagram}
                  className="aspect-square w-5 text-accent transition-colors duration-200 group-hover:text-white"
                />
              </StyleOption>
              <StyleOption text="Reddit">
                <Icon
                  path={mdiReddit}
                  className="aspect-square w-5 text-accent transition-colors duration-200 group-hover:text-white"
                />
              </StyleOption>
            </Select.Viewport>
            <Select.ScrollDownButton />
            <Select.Arrow className="fill-accent-dark" />
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <div className="flex w-full gap-2">
        <ToggleGenerator
          value={generators.text}
          setValue={(value) => setGenerators({ ...generators, text: value })}
        >
          <Icon path={mdiFormatText} className="aspect-square w-4" />
          Text
        </ToggleGenerator>
        <ToggleGenerator
          value={generators.image}
          setValue={(value) => setGenerators({ ...generators, image: value })}
        >
          <Icon path={mdiImage} className="aspect-square w-4" />
          Image
        </ToggleGenerator>
        <ToggleGenerator
          value={generators.video}
          setValue={(value) => setGenerators({ ...generators, video: value })}
        >
          <Icon path={mdiVideo} className="aspect-square w-4" />
          Video
        </ToggleGenerator>
        <ToggleGenerator
          value={generators.meme}
          setValue={(value) => setGenerators({ ...generators, meme: value })}
        >
          <Icon path={mdiEmoticonExcited} className="aspect-square w-4" />
          Meme
        </ToggleGenerator>
      </div>

      <div className="flex w-full items-center justify-start gap-2">
        <Checkbox.Root
          checked={enableNews}
          onCheckedChange={(value) => setEnableNews(value === true)}
          className="flex aspect-square w-6 items-center justify-center rounded-lg bg-accent-dark"
          id="enableNews"
        >
          <Checkbox.Indicator asChild>
            <Icon path={mdiCheckBold} className="aspect-square w-4" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label htmlFor="enableNews" className="text-accent">
          Query news sources
        </label>
      </div>

      <button
        type="submit"
        disabled={settings === null}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-solid border-accent bg-accent py-2 transition-all duration-200 hover:border-accent-light hover:bg-accent-light disabled:border-accent-dark disabled:bg-black/0 disabled:text-accent"
      >
        {regenerate ? (
          <>
            <Icon path={mdiRefresh} className="-ml-3 aspect-square w-5" />
            Regenerate All
          </>
        ) : (
          <>
            <Icon path={mdiCreation} className="-ml-3 aspect-square w-5" />
            Generate
          </>
        )}
      </button>
    </form>
  );
}

export default Prompt;
