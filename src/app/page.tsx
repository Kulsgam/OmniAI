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
  mdiImage,
  mdiVideo,
} from "@mdi/js";
import { ReactNode } from "react";

function ToggleGenerator({
  children,
  defaultChecked = false,
}: {
  children: ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <Toggle.Root
      defaultPressed={defaultChecked}
      className="flex items-center gap-1 rounded-lg bg-accent px-1.5 py-1 text-sm transition-all duration-200 hover:bg-accent-light data-[state=off]:bg-accent-dark data-[state=off]:text-accent data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-light"
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
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center rounded-lg sm:bg-black/25 sm:p-10 xl:flex-row xl:gap-16 xl:px-16">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8 aspect-square w-48 rounded-full bg-accent-dark"></div>
          <h1 className="mb-4 font-title text-5xl">Some AI</h1>
          <p className="mb-16 w-64 text-center text-accent xl:mb-0">
            Generate text, images and more with just a simple prompt!
          </p>
        </div>
        <Separator.Root
          className="hidden h-96 w-px bg-accent-dark xl:block"
          decorative
          orientation="vertical"
        />
        <form className="flex w-[293px] flex-col items-center gap-2">
          <textarea
            name="prompt"
            rows={3}
            className="w-full resize-none rounded-lg bg-accent-dark px-4 py-3 placeholder:text-accent"
            placeholder="Enter your prompt"
          />

          <Select.Root>
            <Select.Trigger className="flex w-full items-center justify-between gap-2 rounded-lg bg-accent-dark px-4 py-2 data-[placeholder]:text-accent">
              <div />
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
            <ToggleGenerator defaultChecked>
              <Icon path={mdiFormatText} className="aspect-square w-4" />
              Text
            </ToggleGenerator>
            <ToggleGenerator>
              <Icon path={mdiImage} className="aspect-square w-4" />
              Image
            </ToggleGenerator>
            <ToggleGenerator>
              <Icon path={mdiVideo} className="aspect-square w-4" />
              Video
            </ToggleGenerator>
            <ToggleGenerator>
              <Icon path={mdiEmoticonExcited} className="aspect-square w-4" />
              Meme
            </ToggleGenerator>
          </div>

          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 transition-all duration-200 hover:bg-accent-light"
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
