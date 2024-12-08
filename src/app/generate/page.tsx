import {
  mdiContentCopy,
  mdiCreation,
  mdiDownload,
  mdiPencil,
  mdiRefresh,
} from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode } from "react";
import Spinner from "@/components/Spinner";
import Link from "next/link";

function Section({
  title,
  state,
  retrieve_icon = "download",
  children,
}: {
  title: string;
  state: "not_generating" | "generating" | "generated";
  retrieve_icon?: "download" | "copy";
  children: ReactNode;
}) {
  const generating = state === "generating";

  return (
    <div className="flex flex-col rounded-lg bg-accent-darker sm:p-5">
      <div className="flex w-full items-end justify-between">
        <h1 className="font-title text-3xl">{title}</h1>
        <div className="flex gap-2">
          {state === "not_generating" ? (
            <>
              <button
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent p-2 text-sm transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
              >
                <Icon path={mdiCreation} className="aspect-square w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent p-2 text-sm transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
              >
                <Icon path={mdiRefresh} className="aspect-square w-5" />
              </button>
              <button
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent p-2 text-sm transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
              >
                <Icon
                  path={retrieve_icon === "copy" ? mdiContentCopy : mdiDownload}
                  className="aspect-square w-5"
                />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-5 h-full w-full">
        {state === "not_generating" ? (
          <div className="flex h-12 items-center justify-center xl:aspect-video xl:h-auto">
            <span className="text-2xl text-accent-dark">Not Generated</span>
          </div>
        ) : state === "generating" ? (
          <div className="flex h-12 items-center justify-center xl:aspect-video xl:h-auto">
            <div className="h-5 w-5 xl:h-7 xl:w-7">
              <Spinner />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function Generate() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-16 mt-5 flex w-[293px] justify-between sm:w-[500px] xl:w-[750px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="aspect-square w-10 rounded-full bg-accent-dark"></div>
          <h1 className="font-title text-xl">Some AI</h1>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 rounded-lg bg-accent-dark px-3 py-2"
        >
          <Icon path={mdiCreation} className="aspect-square w-5" />
          New
        </Link>
      </div>

      <form className="mb-16 flex w-[293px] gap-2 sm:w-[500px]">
        <input
          className="w-full flex-grow rounded-lg bg-accent-dark px-4 py-3 placeholder:text-accent"
          type="text"
          placeholder="Enter your adjustments"
        />
        <button
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-3 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
          type="submit"
        >
          <Icon path={mdiPencil} className="aspect-square w-5" />
        </button>
      </form>

      <div className="flex w-[293px] flex-col gap-10 rounded-lg sm:w-[500px] sm:gap-5 xl:w-[750px]">
        <Section title="Text" state="generated" retrieve_icon="copy">
          <div className="rounded-lg border-dashed border-accent-dark xl:flex xl:h-full xl:w-full xl:items-center xl:justify-center xl:border-2 xl:p-10 xl:text-center xl:text-xl">
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book. It has
              survived not only five centuries
            </p>
          </div>
        </Section>
        <Section title="Image" state="generated">
          <div className="aspect-square w-full rounded-lg bg-accent-dark"></div>
        </Section>
        <Section title="Video" state="generated">
          <div className="aspect-video w-full rounded-lg bg-accent-dark"></div>
        </Section>
        <Section title="Meme" state="generated">
          <div className="aspect-square w-full rounded-lg bg-accent-dark"></div>
        </Section>
      </div>

      <div className="bottom-0 left-1/2 mb-5 mt-10 text-accent">
        by the Newtrons
      </div>
    </div>
  );
}

export default Generate;
