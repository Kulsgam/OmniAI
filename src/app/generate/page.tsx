import { mdiContentCopy, mdiCreation, mdiDownload, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode } from "react";
import Spinner from "@/components/Spinner";

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
    <div className="flex flex-col p-5">
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
    <div className="relative flex w-full flex-col items-center xl:min-h-screen xl:justify-center">
      <div className="left-0 top-0 mb-10 mt-5 flex w-full items-center justify-center gap-3 xl:absolute">
        <div className="aspect-square w-10 rounded-full bg-accent-dark"></div>
        <h1 className="font-title text-xl">Some AI</h1>
      </div>

      <div className="flex w-[293px] flex-col rounded-lg bg-accent-darker sm:w-[500px] xl:grid xl:w-[1000px] xl:grid-cols-2 xl:grid-rows-2">
        <Section title="Text" state="not_generating" retrieve_icon="copy">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s, when an unknown printer took a galley of
            type and scrambled it to make a type specimen book. It has survived
            not only five centuries
          </p>
        </Section>
        <Section title="Image" state="not_generating">
          <div className="aspect-square w-full rounded-lg bg-accent-dark xl:aspect-video"></div>
        </Section>
        <Section title="Video" state="not_generating">
          <div className="aspect-video w-full rounded-lg bg-accent-dark"></div>
        </Section>
        <Section title="Meme" state="not_generating">
          <div className="aspect-square w-full rounded-lg bg-accent-dark xl:aspect-video"></div>
        </Section>
      </div>

      <div className="bottom-0 left-1/2 mb-5 mt-10 text-accent xl:absolute xl:-translate-x-1/2">
        by the Newtrons
      </div>
    </div>
  );
}

export default Generate;
