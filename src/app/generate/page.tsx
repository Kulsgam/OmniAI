"use client";

import {
  mdiContentCopy,
  mdiCreation,
  mdiDownload,
  mdiPencil,
  mdiRefresh,
} from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode, useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { useAtom } from "jotai";
import { generateSettingsAtom } from "@/lib/atoms";
import { useRouter } from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import genVideo, { FinalVideoObject } from "../api/ai/video/videoGenerator";
import genMemeBuffer from "../api/ai/meme/memeGenerator";

interface State {
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function Section({
  title,
  state,
  retrieve_icon = "download",
  onGenerate = () => { },
  onRefresh = () => { },
  onRetrieve = () => { },
  children,
}: {
  title: string;
  state: "not_generating" | "generating" | "generated" | "error";
  retrieve_icon?: "download" | "copy";
  onGenerate?: () => void;
  onRefresh?: () => void;
  onRetrieve?: () => void;
  children: ReactNode;
}) {
  const generating = state === "generating" || state === "error";

  return (
    <div className="flex flex-col rounded-lg bg-accent-darker sm:p-5">
      <div className="flex w-full items-end justify-between">
        <h1 className="font-title text-3xl">{title}</h1>
        <div className="flex gap-2">
          {state === "not_generating" ? (
            <>
              <button
                onClick={onGenerate}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent p-2 text-sm transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
              >
                <Icon path={mdiCreation} className="aspect-square w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onRefresh}
                disabled={generating}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent p-2 text-sm transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
              >
                <Icon path={mdiRefresh} className="aspect-square w-5" />
              </button>
              <button
                onClick={onRetrieve}
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
        {state === "not_generating" || state === "error" ? (
          <div className="flex h-12 items-center justify-center xl:aspect-video xl:h-auto">
            <span className="text-2xl text-accent-dark">
              {state === "error" ? "Error" : "Disabled"}
            </span>
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
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);
  const [generateSettings, setGenerateSettings] = useAtom(generateSettingsAtom);
  const [adjusted, setAdjusted] = useState(false);
  const [adjustments, setAdjustments] = useState("");
  const [useAdjustments, setUseAdjustments] = useState(false);
  // const [videoObject, setVideoObject] = useState<FinalVideoObject>({
  //   punchline: "",
  //   comment: "",
  //   videoBuffer: undefined
  // });
  const [meme, setMeme] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    // async function getVideoObject(name: string, text: string) {
    //   const video = await genVideo(name, text);
    //   return video;
    // }

    // getVideoObject("Peter", "Peter").then((video) => {
    //   if (video) {
    //     console.log(video);
    //     setVideoObject(video);
    //   }
    // });

    async function getMemeObject(input_prompt: string, context: string) {
      // const meme = await genMemeBuffer(input_prompt, context);
      // return meme;
      const response = await axios.get("/api/ai/meme", {
        params: {
          input_prompt: input_prompt,
          context: context
        },
        responseType: "arraybuffer"
      });

      const memeBase64 = Buffer.from(response.data, 'binary').toString('base64');

      return memeBase64;
    }

    const DEFAULT_INPUT_PROMPT = "Generate a 50 word story about stepping on a lego brick";
    const DEFAULT_CONTEXT = "On a quiet night, barefoot Sam tiptoed through the dark. Suddenly, agony! A tiny Lego brick embedded in his sole, a cruel surprise. He howled, hopping wildly. His child’s castle masterpiece lay in ruins nearby. Lesson learned: even small things, misplaced, can deliver mighty pain. The brick won the night.";

    getMemeObject(DEFAULT_INPUT_PROMPT, DEFAULT_CONTEXT).then((memeBase64) => {
      if (memeBase64) {
        console.log(memeBase64);
        setMeme(memeBase64);
      }
    });
    // getMemeObject(DEFAULT_INPUT_PROMPT, DEFAULT_CONTEXT).then((memeBuffer) => {
    //   if (memeBuffer) {
    //     const memeBase64 = memeBuffer.toString("base64");
    //     console.log(memeBase64);
    //     setMeme(memeBase64);
    //   }
    // });
    // setMeme(memeBase64);

  }, [])
  const textQuery = useQuery({
    queryKey: ["text"],
    enabled: state !== null && state.generators.text,
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      const endpoint = new URL(
        "/api/ai/text-temp",
        document.location.toString(),
      );
      endpoint.searchParams.append("input_prompt", state.prompt);
      endpoint.searchParams.append("enable_news", state.enableNews.toString());
      if (useAdjustments) {
        endpoint.searchParams.append("adjustments", adjustments);
      } else if (!adjusted) {
        endpoint.searchParams.append("style", state.style);
      }

      const res = await axios.get(endpoint.toString());
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get text");
      }

      const data = z
        .object({
          text: z.string(),
          prompt: z.string().nullable(),
          news: z
            .array(z.object({ title: z.string(), url: z.string().url() }))
            .nullable(),
        })
        .parse(res.data);

      if (useAdjustments) {
        setUseAdjustments(false);
        setAdjustments("");
        setState({ ...state, prompt: data.prompt ?? state.prompt });
        setAdjusted(true);
      }

      return data;
    },
  });

  const memeQuery = useQuery({
    queryKey: ["meme"],
    enabled: state !== null && state.generators.meme,
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      const endpoint = new URL(
        "/api/ai/meme",
        document.location.toString(),
      );
      endpoint.searchParams.append("input_prompt", state.prompt);
      endpoint.searchParams.append("context", state.style);

      const res = await axios.get(endpoint.toString(), {
        responseType: "arraybuffer",
      });
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get meme");
      }

      return res.data;
    },
  })

  useEffect(() => {
    if (generateSettings === null) {
      router.push("/");
    } else {
      setState({
        ...generateSettings,
        generators: { ...generateSettings.generators },
      });
      // setGenerateSettings(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (useAdjustments) {
      queryClient.invalidateQueries({ queryKey: ["text"] });
    }
  }, [useAdjustments, queryClient]);

  if (state === null) {
    return <></>;
  }

  if (textQuery.error) {
    console.log(textQuery.error);
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-16 mt-5 flex w-[293px] justify-between sm:w-[500px] xl:w-[750px]">
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
          <Icon path={mdiCreation} className="aspect-square w-5" />
          New
        </Link>
      </div>

      <form
        className="mb-16 flex w-[293px] gap-2 sm:w-[500px]"
        onSubmit={(evt) => {
          evt.preventDefault();
          setUseAdjustments(true);
        }}
      >
        <input
          className="w-full flex-grow rounded-lg bg-accent-dark px-4 py-3 placeholder:text-accent"
          type="text"
          placeholder="Enter your adjustments"
          value={adjustments}
          onChange={(evt) => setAdjustments(evt.target.value)}
        />
        <button
          disabled={adjustments.trim().length === 0 || !state.generators.text}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3.5 py-3 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
          type="submit"
        >
          <Icon path={mdiPencil} className="aspect-square w-5" />
        </button>
      </form>

      <div className="flex w-[293px] flex-col gap-10 rounded-lg sm:w-[500px] sm:gap-5 xl:w-[750px]">
        <Section
          title="Text"
          state={
            !state.generators.text
              ? "not_generating"
              : textQuery.isPending || textQuery.isFetching
                ? "generating"
                : textQuery.isError
                  ? "error"
                  : "generated"
          }
          retrieve_icon="copy"
          onGenerate={() => {
            setState({
              ...state,
              generators: { ...state.generators, text: true },
            });
          }}
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ["text"] })
          }
          onRetrieve={() =>
            navigator.clipboard.writeText(textQuery.data?.text ?? "")
          }
        >
          {textQuery.data !== undefined && (
            <>
              <div className="rounded-lg border-dashed border-accent-dark xl:flex xl:h-full xl:w-full xl:items-center xl:justify-center xl:border-2 xl:p-10 xl:text-xl">
                <p>{textQuery.data.text}</p>
              </div>
              {textQuery.data.news !== null && (
                <>
                  <h2 className="mt-5 font-title text-xl">Sources</h2>
                  <div className="mt-2 flex flex-col gap-2">
                    {textQuery.data.news.map((news, idx) => (
                      <a
                        className="flex-1 overflow-hidden text-ellipsis text-nowrap rounded-lg bg-accent-dark px-2.5 py-1 text-sm transition-colors duration-300 hover:bg-accent"
                        target="_blank"
                        key={idx}
                        href={news.url}
                      >
                        {news.title}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Section>
        <Section
          title="Image"
          state={state.generators.image ? "generating" : "not_generating"}
        >
          <div className="aspect-square w-full rounded-lg bg-accent-dark"></div>
        </Section>
        <Section
          title="Video"
          state={state.generators.video ? "generating" : "not_generating"}
        >
          <div className="aspect-video w-full rounded-lg bg-accent-dark"></div>
        </Section>
        <Section
          title="Meme"
          state={
            !state.generators.meme
              ? "not_generating"
              : memeQuery.isPending || memeQuery.isFetching
                ? "generating"
                : memeQuery.isError
                  ? "error"
                  : "generated"
          }
        >
          <div className="aspect-square w-full rounded-lg bg-accent-dark">
            <img src={`data:image/png;base64,${meme}`}></img>
          </div>
        </Section>
      </div>

      <div className="mb-5 mt-10 text-accent">by the Newtrons</div>
    </div>
  );
}

function GenerateWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <Generate />
    </QueryClientProvider>
  );
}

export default GenerateWrapper;
