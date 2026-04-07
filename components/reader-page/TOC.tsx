import { useActiveHeading } from "@/hooks/useActiveHeading";
import type { TPostTOCItem } from "@/types/docs.type";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export const TOC = (props: { data: TPostTOCItem[] }) => {
  const tocScrollRef = useRef<HTMLDivElement>(null);
  const tocItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [domTOC, setDomTOC] = useState<TPostTOCItem[]>([]);
  const tocData = props.data.length > 0 ? props.data : domTOC;
  const activeId = useActiveHeading(
    tocData.map((item) => `#${item.anchorId}`),
    {
      rootMargin: "-120px 0px -62% 0px",
      threshold: [0, 1],
    },
  );
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (props.data.length > 0) {
      return;
    }

    const headingElements = Array.from(
      document.querySelectorAll(
        ".typesetting h1, .typesetting h2, .typesetting h3, .typesetting h4, .typesetting h5, .typesetting h6",
      ),
    ) as HTMLHeadingElement[];

    const extracted = headingElements
      .map((heading) => ({
        level: Number.parseInt(heading.tagName.slice(1), 10),
        anchorId: heading.id,
        title: heading.textContent?.trim() ?? "",
      }))
      .filter((item) => item.anchorId.length > 0 && item.title.length > 0);

    setDomTOC(extracted);
  }, [props.data]);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setReadingProgress(100);
        return;
      }

      const progress = Math.min(
        100,
        Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)),
      );
      setReadingProgress(progress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const activeAnchorId = activeId.replace(/^#/, "");
    const activeEl = tocItemRefs.current[activeAnchorId];
    const containerEl = tocScrollRef.current;

    if (!activeEl || !containerEl) {
      return;
    }

    activeEl.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId]);

  return (
    <div className="h-[450px]">
      <div className="fixed top-[120px] z-40 flex h-[450px] w-[190px] flex-col rounded-2xl border border-gray-300 bg-[rgb(250,250,249)] p-4 shadow-sm dark:border-[#2b3a49] dark:bg-[rgb(17,24,32)]">
        <div className="border-gray-300 border-b pb-3 text-base font-bold dark:border-[#2b3a49]">
          {"目录"}
        </div>
        <div
          className="mt-1.5 flex-1 overflow-y-auto px-1 py-1 pb-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={tocScrollRef}
        >
          <div>
            {tocData?.map((item) => (
              <Link href={`#${item.anchorId}`} key={`toc-${item.anchorId}`}>
                <div
                  className={twMerge(
                    "relative overflow-hidden rounded-lg py-1.5 text-sm text-[#5a6b78] transition-colors duration-300 hover:text-sky-700 dark:text-[#9fb0bf] dark:hover:text-sky-300",
                    activeId === `#${item.anchorId}`
                      ? "text-sky-700 dark:text-sky-300"
                      : "",
                  )}
                  ref={(el) => {
                    tocItemRefs.current[item.anchorId] = el;
                  }}
                  style={{ paddingLeft: `${item.level - 1}em` }}
                >
                  <span
                    className={twMerge(
                      "pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-[#eef5fb] to-[#dfeef8] opacity-0 transition-opacity duration-300 dark:from-[#2a4358] dark:to-[#243a4d]",
                      activeId === `#${item.anchorId}` ? "opacity-100" : "",
                    )}
                  />
                  <span className="relative">{`${item.title}`}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute right-4 bottom-2 left-4">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-[#dde8f1] dark:bg-[#233445]">
            <div
              className="h-full rounded-full bg-[#4f8fb9] transition-[width] duration-200 dark:bg-[#6caed8]"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
