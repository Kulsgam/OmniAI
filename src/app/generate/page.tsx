"use client";

import {
  mdiClose,
  mdiContentCopy,
  mdiCreation,
  mdiDownload,
  mdiEmoticonExcited,
  mdiFormatText,
  mdiImage,
  mdiPencil,
  mdiRefresh,
  mdiVideo,
} from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode, useEffect, useRef, useState } from "react";
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
import * as Separator from "@radix-ui/react-separator";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import Prompt from "@/components/Prompt";

interface State {
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function Section({
  title,
  state,
  retrieve_icon = "download",
  onGenerate = () => {},
  onRefresh = () => {},
  onRetrieve = () => {},
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
    <div className="flex flex-col rounded-lg border-2 border-solid border-accent-dark bg-accent-darker p-5 sm:border-none">
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

function TabTrigger({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Tabs.Trigger
      className="flex flex-1 items-center justify-center gap-1 bg-accent-dark py-2 text-sm transition-colors duration-200 first:rounded-l-lg last:rounded-r-lg hover:bg-accent data-[state=active]:bg-accent"
      value={name.toLowerCase()}
    >
      {children}
    </Tabs.Trigger>
  );
}

function Generate() {
  const router = useRouter();
  const [state, setState] = useState<State | null>(null);
  const [generateSettings, setGenerateSettings] = useAtom(generateSettingsAtom);
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [memeSrc, setMemeSrc] = useState<string | undefined>();
  const [vidSrc, setVidSrc] = useState<string | undefined>();
  // const [punchline, setPunchline] = useState<string | null>(null);
  // const [adjusted, setAdjusted] = useState(false);
  const [adjustments, setAdjustments] = useState({
    text: "",
    image: "",
    video: "",
    meme: "",
  });
  const applyAdjustmentsRef = useRef({
    text: false,
    image: false,
    video: false,
    meme: false,
  });
  const adjustedPrompts = useRef({
    text: null as string | null,
    image: null as string | null,
    video: null as string | null,
    meme: null as string | null,
  });
  const queryClient = useQueryClient();

  const newsQuery = useQuery({
    queryKey: ["news_summary"],
    enabled: state !== null && state.enableNews,
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      const endpoint = new URL("/api/ai/news", document.location.toString());
      endpoint.searchParams.append("input_prompt", state.prompt);

      const res = await axios.get(endpoint.toString());
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get text");
      }

      const data = z
        .object({
          summary: z.string(),
          news: z.array(z.object({ title: z.string(), url: z.string().url() })),
        })
        .parse(res.data);

      return data;
    },
  });

  const textQuery = useQuery({
    queryKey: ["text"],
    enabled:
      state !== null &&
      state.generators.text &&
      (!state.enableNews || newsQuery.isSuccess),
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      if (applyAdjustmentsRef.current.text) {
        const adjustment = adjustments.text;
        applyAdjustmentsRef.current.text = false;
        setAdjustments({ ...adjustments, text: "" });

        const endpoint = new URL(
          "/api/ai/adjust",
          document.location.toString(),
        );
        endpoint.searchParams.append(
          "input_prompt",
          adjustedPrompts.current.text ?? state.prompt,
        );
        endpoint.searchParams.append("adjustment", adjustment);

        const res = await axios.get(endpoint.toString());
        if (res.status !== 200) {
          console.error(res.data);
          throw new Error("Could not get text");
        }

        const data = z.string().parse(res.data);
        adjustedPrompts.current.text = data;
      }

      const endpoint = new URL("/api/ai/text", document.location.toString());
      endpoint.searchParams.append(
        "input_prompt",
        adjustedPrompts.current.text ?? state.prompt,
      );
      endpoint.searchParams.append("style", state.style);
      endpoint.searchParams.append("platform", state.platform);
      if (state.enableNews && newsQuery.isSuccess) {
        endpoint.searchParams.append("news_summary", newsQuery.data.summary);
      }

      const res = await axios.get(endpoint.toString());
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get text");
      }

      const data = z.string().parse(res.data);

      return data;
    },
  });

  const imageQuery = useQuery({
    queryKey: ["image"],
    enabled:
      state !== null &&
      state.generators.image &&
      (!state.enableNews || newsQuery.isSuccess) &&
      (!state.generators.text || textQuery.isSuccess),
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      if (applyAdjustmentsRef.current.image) {
        const adjustment = adjustments.image;
        applyAdjustmentsRef.current.image = false;
        setAdjustments({ ...adjustments, image: "" });

        const endpoint = new URL(
          "/api/ai/adjust",
          document.location.toString(),
        );
        endpoint.searchParams.append(
          "input_prompt",
          adjustedPrompts.current.image ?? state.prompt,
        );
        endpoint.searchParams.append("adjustment", adjustment);

        const res = await axios.get(endpoint.toString());
        if (res.status !== 200) {
          console.error(res.data);
          throw new Error("Could not get text");
        }

        const data = z.string().parse(res.data);
        adjustedPrompts.current.image = data;
      }

      const endpoint = new URL("/api/ai/image", document.location.toString());
      endpoint.searchParams.append(
        "input_prompt",
        adjustedPrompts.current.image ?? state.prompt,
      );
      endpoint.searchParams.append("aspect_ratio", "landscape");

      let context: string | null = null;
      if (state.enableNews && newsQuery.isSuccess) {
        context = newsQuery.data.summary;
      }

      if (state.generators.text && textQuery.isSuccess) {
        context = (context === null ? "" : context + "\n\n") + textQuery.data;
      }

      if (context !== null) {
        endpoint.searchParams.append("context", context);
      }

      const res = await axios.get(endpoint.toString());
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get text");
      }

      const data = z
        .object({
          image_prompt: z.string().nullable(),
          image_buffer: z.string().base64(),
        })
        .parse(res.data);

      setImageSrc(undefined);

      return data;
    },
  });

  const videoQuery = useQuery({
    queryKey: ["video"],
    enabled:
      state !== null &&
      state.generators.video &&
      (!state.enableNews || newsQuery.isSuccess) &&
      (!state.generators.text || textQuery.isSuccess),
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      // if (applyAdjustmentsRef.current.image) {
      //   const adjustment = adjustments.image;
      //   applyAdjustmentsRef.current.image = false;
      //   setAdjustments({ ...adjustments, image: "" });

      //   const endpoint = new URL(
      //     "/api/ai/adjust",
      //     document.location.toString(),
      //   );
      //   endpoint.searchParams.append(
      //     "input_prompt",
      //     adjustedPrompts.current.image ?? state.prompt,
      //   );
      //   endpoint.searchParams.append("adjustment", adjustment);

      //   const res = await axios.get(endpoint.toString());
      //   if (res.status !== 200) {
      //     console.error(res.data);
      //     throw new Error("Could not get text");
      //   }

      //   const data = z.string().parse(res.data);
      //   adjustedPrompts.current.image = data;
      // }

      const endpoint = new URL("/api/ai/video", document.location.toString());
      endpoint.searchParams.append("input_prompt", state.prompt);
      endpoint.searchParams.append("aspect_ratio", "landscape");

      let context: string | null = null;
      if (state.enableNews && newsQuery.isSuccess) {
        context = newsQuery.data.summary;
      }

      if (state.generators.text && textQuery.isSuccess) {
        context = (context === null ? "" : context + "\n\n") + textQuery.data;
      }

      if (context !== null) {
        endpoint.searchParams.append("context", context);
      }

      const res = await axios.get(endpoint.toString(), {
        responseType: "blob",
      });

      const data = res.data;
      if (res.status !== 200 || !(data instanceof Blob)) {
        console.error(data);
        throw new Error("Could not get video");
      }

      setVidSrc(undefined);

      return data;
    },
  });

  const memeQuery = useQuery({
    queryKey: ["meme", "first"],
    enabled:
      state !== null &&
      state.generators.meme &&
      (!state.enableNews || newsQuery.isSuccess) &&
      (!state.generators.text || textQuery.isSuccess),
    queryFn: async () => {
      if (state === null) throw new Error("Invalid state.");

      if (applyAdjustmentsRef.current.meme) {
        const adjustment = adjustments.meme;
        applyAdjustmentsRef.current.meme = false;
        setAdjustments({ ...adjustments, meme: "" });

        const endpoint = new URL(
          "/api/ai/adjust",
          document.location.toString(),
        );
        endpoint.searchParams.append(
          "input_prompt",
          adjustedPrompts.current.meme ?? state.prompt,
        );
        endpoint.searchParams.append("adjustment", adjustment);

        const res = await axios.get(endpoint.toString());
        if (res.status !== 200) {
          console.error(res.data);
          throw new Error("Could not get text");
        }

        const data = z.string().parse(res.data);
        adjustedPrompts.current.meme = data;
      }

      const endpoint = new URL("/api/ai/meme", document.location.toString());
      endpoint.searchParams.append(
        "input_prompt",
        adjustedPrompts.current.meme ?? state.prompt,
      );

      let context: string | null = null;
      if (state.enableNews && newsQuery.isSuccess) {
        context = newsQuery.data.summary;
      }

      if (state.generators.text && textQuery.isSuccess) {
        context = (context === null ? "" : context + "\n\n") + textQuery.data;
      }

      if (context !== null) {
        endpoint.searchParams.append("context", context);
      }

      const res = await axios.get(endpoint.toString());
      if (res.status !== 200) {
        console.error(res.data);
        throw new Error("Could not get meme");
      }

      const data = z
        .object({
          punchline: z.string(),
          imageGenPrompt: z.string(),
        })
        .parse(res.data);

      return { ...data, key: Math.random() };
    },
  });

  const finalMemeQuery = useQuery({
    queryKey: ["meme", "last", memeQuery.data?.key],
    enabled: state !== null && memeQuery.isSuccess,
    queryFn: async () => {
      if (state === null || !memeQuery.isSuccess)
        throw new Error("Invalid state.");

      let imageBuffer: string;
      {
        const endpoint = new URL("/api/ai/image", document.location.toString());
        endpoint.searchParams.append(
          "image_prompt",
          memeQuery.data.imageGenPrompt,
        );
        endpoint.searchParams.append("aspect_ratio", "landscape");

        const res = await axios.get(endpoint.toString());
        if (res.status !== 200) {
          console.error(res.data);
          throw new Error("Could not get text");
        }

        const data = z
          .object({
            image_prompt: z.string().nullable(),
            image_buffer: z.string().base64(),
          })
          .parse(res.data);

        imageBuffer = data.image_buffer;
      }

      const endpoint = new URL(
        "/api/ai/meme-edit",
        document.location.toString(),
      );

      const res = await axios.post(
        endpoint.toString(),
        {
          punchline: memeQuery.data.punchline,
          image_buffer: imageBuffer,
        },
        { responseType: "blob" },
      );
      const data = res.data;
      if (res.status !== 200 || !(data instanceof Blob)) {
        console.error(data);
        throw new Error("Could not get meme");
      }

      setMemeSrc(undefined);

      return data;
    },
  });

  useEffect(() => {
    if (!videoQuery.isSuccess || vidSrc !== undefined) return;
    const data = videoQuery.data;
    const url = URL.createObjectURL(data);
    setVidSrc(url);
  }, [videoQuery, vidSrc]);

  useEffect(() => {
    if (!imageQuery.isSuccess || imageSrc !== undefined) return;
    const data = imageQuery.data;
    const imageBuffer = Uint8Array.from(atob(data.image_buffer), (c) =>
      c.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([imageBuffer], { type: "image/png" }),
    );
    setImageSrc(url);
  }, [imageQuery, imageSrc]);

  useEffect(() => {
    if (!finalMemeQuery.isSuccess || memeSrc !== undefined) return;
    const data = finalMemeQuery.data;
    const url = URL.createObjectURL(data);
    setMemeSrc(url);
  }, [finalMemeQuery, memeSrc]);

  useEffect(() => {
    if (generateSettings === null) {
      router.push("/");
    } else {
      setState({
        ...generateSettings,
        generators: { ...generateSettings.generators },
      });
      setGenerateSettings(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === null) {
    return <></>;
  }

  return (
    <div className="relative flex flex-col items-center">
      <div className="mb-16 mt-5 flex w-[293px] justify-between sm:w-[500px] xl:w-[750px]">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="aspect-square w-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("/logo.png")` }}
          ></div>
          <h1 className="font-title text-xl">OmniAI</h1>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 rounded-lg bg-accent-dark px-3 py-2"
        >
          <Icon path={mdiCreation} className="aspect-square w-5" />
          New
        </Link>
      </div>

      <Dialog.Root>
        <Dialog.Trigger className="mb-16 flex w-[293px] items-center justify-center gap-2 rounded-lg bg-accent-dark py-3 transition-all duration-200 hover:bg-accent sm:w-[500px]">
          <Icon path={mdiPencil} className="aspect-square w-5" />
          Edit Your Prompt
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed left-0 top-0 h-screen w-screen bg-black/25 backdrop-blur-lg" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[333px] rounded-lg border-2 border-solid border-accent-dark bg-accent-darker p-5">
              <Dialog.Title className="mb-3 text-2xl">
                Edit Your Prompt
              </Dialog.Title>
              <Dialog.Description className="mb-8 w-4/5 text-sm text-accent">
                Update the prompt to align the generated content to your needs.
              </Dialog.Description>
              <Dialog.Close className="absolute right-0 top-0 m-5 flex items-center justify-center rounded-lg bg-accent-dark p-2 transition-all duration-200 hover:bg-accent">
                <Icon path={mdiClose} className="aspect-square w-4" />
              </Dialog.Close>
              <Prompt
                regenerate
                initial={{
                  prompt: state.prompt,
                  writingStyle: state.style,
                  platform: state.platform,
                  generators: { ...state.generators },
                  enableNews: state.enableNews,
                }}
                onSubmit={(settings) => {
                  setState({
                    ...settings,
                    generators: { ...settings.generators },
                  });
                  setImageSrc(undefined);
                  setMemeSrc(undefined);
                  setAdjustments({
                    text: "",
                    image: "",
                    video: "",
                    meme: "",
                  });
                  applyAdjustmentsRef.current = {
                    text: false,
                    image: false,
                    video: false,
                    meme: false,
                  };
                  adjustedPrompts.current = {
                    text: null,
                    image: null,
                    video: null,
                    meme: null,
                  };
                  queryClient.invalidateQueries();
                }}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Tabs.Root
        className="flex w-[293px] flex-col gap-2 sm:w-[500px] xl:w-[750px]"
        defaultValue="text"
      >
        <Tabs.List className="flex w-full py-2">
          <TabTrigger name="Text">
            <Icon path={mdiFormatText} className="aspect-square w-4" />
            Text
          </TabTrigger>
          <TabTrigger name="Image">
            <Icon path={mdiImage} className="aspect-square w-4" />
            Image
          </TabTrigger>
          <TabTrigger name="Video">
            <Icon path={mdiVideo} className="aspect-square w-4" />
            Video
          </TabTrigger>
          <TabTrigger name="Meme">
            <Icon path={mdiEmoticonExcited} className="aspect-square w-4" />
            Meme
          </TabTrigger>
        </Tabs.List>
        <Tabs.Content value="text">
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
              navigator.clipboard.writeText(textQuery.data ?? "")
            }
          >
            {textQuery.data !== undefined && (
              <>
                <div className="rounded-lg border-dashed border-accent-dark xl:flex xl:h-full xl:w-full xl:items-center xl:justify-center xl:border-2 xl:p-10 xl:text-xl">
                  <p>{textQuery.data}</p>
                </div>
                {state.enableNews && newsQuery.isSuccess && (
                  <>
                    <h2 className="mt-5 font-title text-xl">Sources</h2>
                    <div className="mt-2 flex flex-col gap-2">
                      {newsQuery.data.news.map((news, idx) => (
                        <a
                          className="flex-1 overflow-hidden text-ellipsis text-nowrap rounded-lg bg-accent-dark px-2.5 py-1 text-sm transition-colors duration-200 hover:bg-accent"
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
                <Separator.Root
                  className="my-5 h-[2px] w-full bg-accent-dark"
                  decorative
                  orientation="horizontal"
                />
                <h2 className="mb-3 mt-5 font-title text-xl">Edit Content</h2>
                <form
                  className="flex max-w-96 gap-2"
                  onSubmit={(evt) => {
                    evt.preventDefault();
                    applyAdjustmentsRef.current.text = true;
                    queryClient.invalidateQueries({ queryKey: ["text"] });
                  }}
                >
                  <input
                    className="w-full flex-grow rounded-lg bg-accent-dark px-3 py-2 placeholder:text-accent"
                    type="text"
                    placeholder="Enter your adjustments"
                    value={adjustments.text}
                    onChange={(evt) =>
                      setAdjustments({ ...adjustments, text: evt.target.value })
                    }
                  />
                  <button
                    disabled={adjustments.text.trim().length === 0}
                    className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
                    type="submit"
                  >
                    <Icon path={mdiPencil} className="aspect-square w-4" />
                    Edit
                  </button>
                </form>
              </>
            )}
          </Section>
        </Tabs.Content>
        <Tabs.Content value="image">
          <Section
            title="Image"
            state={
              !state.generators.image
                ? "not_generating"
                : imageQuery.isPending || imageQuery.isFetching
                  ? "generating"
                  : textQuery.isError
                    ? "error"
                    : "generated"
            }
            onGenerate={() => {
              setState({
                ...state,
                generators: { ...state.generators, image: true },
              });
            }}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["image"] })
            }
            onRetrieve={() => {
              if (!imageSrc) return;
              downloadURI(imageSrc, "Image.png");
            }}
          >
            <>
              <div className="w-full rounded-lg bg-accent-dark">
                <img src={imageSrc} alt="Image" />
              </div>
              <Separator.Root
                className="my-5 h-[2px] w-full bg-accent-dark"
                decorative
                orientation="horizontal"
              />
              <h2 className="mb-3 mt-5 font-title text-xl">Edit Content</h2>
              <form
                className="flex max-w-96 gap-2"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  applyAdjustmentsRef.current.image = true;
                  queryClient.invalidateQueries({ queryKey: ["image"] });
                }}
              >
                <input
                  className="w-full flex-grow rounded-lg bg-accent-dark px-3 py-2 placeholder:text-accent"
                  type="text"
                  placeholder="Enter your adjustments"
                  value={adjustments.image}
                  onChange={(evt) =>
                    setAdjustments({ ...adjustments, image: evt.target.value })
                  }
                />
                <button
                  disabled={adjustments.image.trim().length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
                  type="submit"
                >
                  <Icon path={mdiPencil} className="aspect-square w-4" />
                  Edit
                </button>
              </form>
            </>
          </Section>
        </Tabs.Content>
        <Tabs.Content value="video">
          <Section
            title="Video"
            state={
              !state.generators.video
                ? "not_generating"
                : videoQuery.isPending || videoQuery.isFetching
                  ? "generating"
                  : videoQuery.isError
                    ? "error"
                    : "generated"
            }
            onGenerate={() => {
              setState({
                ...state,
                generators: { ...state.generators, video: true },
              });
            }}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["video"] })
            }
            onRetrieve={() => {
              if (!memeSrc) return;
              downloadURI(memeSrc, "Video.mp4");
            }}
          >
            <div className="w-full rounded-lg bg-accent-dark">
              <video width="768" height="432" autoPlay>
                <source src={vidSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </Section>
        </Tabs.Content>
        <Tabs.Content value="meme">
          <Section
            title="Meme"
            state={
              !state.generators.meme
                ? "not_generating"
                : finalMemeQuery.isPending || finalMemeQuery.isFetching
                  ? "generating"
                  : memeQuery.isError || finalMemeQuery.isError
                    ? "error"
                    : "generated"
            }
            onGenerate={() => {
              setState({
                ...state,
                generators: { ...state.generators, meme: true },
              });
            }}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["meme", "first"] })
            }
            onRetrieve={() => {
              if (!memeSrc) return;
              downloadURI(memeSrc, "Meme.png");
            }}
          >
            <>
              <div className="w-full rounded-lg bg-accent-dark">
                <img src={memeSrc} alt="Meme" />
              </div>
              <Separator.Root
                className="my-5 h-[2px] w-full bg-accent-dark"
                decorative
                orientation="horizontal"
              />
              <h2 className="mb-3 mt-5 font-title text-xl">Edit Content</h2>
              <form
                className="flex max-w-96 gap-2"
                onSubmit={(evt) => {
                  evt.preventDefault();
                  applyAdjustmentsRef.current.meme = true;
                  queryClient.invalidateQueries({
                    queryKey: ["meme", "first"],
                  });
                }}
              >
                <input
                  className="w-full flex-grow rounded-lg bg-accent-dark px-3 py-2 placeholder:text-accent"
                  type="text"
                  placeholder="Enter your adjustments"
                  value={adjustments.meme}
                  onChange={(evt) =>
                    setAdjustments({ ...adjustments, meme: evt.target.value })
                  }
                />
                <button
                  disabled={adjustments.meme.trim().length === 0}
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 transition-all duration-200 hover:bg-accent-light disabled:bg-accent-dark disabled:text-accent"
                  type="submit"
                >
                  <Icon path={mdiPencil} className="aspect-square w-4" />
                  Edit
                </button>
              </form>
            </>
          </Section>
        </Tabs.Content>
      </Tabs.Root>

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
