import { MorePostLinks } from "@/components/reader-page/MorePostLinks";
import { PostCover } from "@/components/reader-page/PostCover";
import { PostRender } from "@/components/reader-page/PostRender";
import { TOC } from "@/components/reader-page/TOC";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/utils/Footer";
import { ContentContainer, Page } from "@/components/utils/Layout";
import { NavBar } from "@/components/utils/NavBar";
import { SEO } from "@/components/utils/SEO";
import { getPostFileContent, sortedPosts } from "@/lib/post-process";
import { makeTOCTree } from "@/lib/toc";
import type {
  TPostFrontmatter,
  TPostListItem,
  TPostTOCItem,
} from "@/types/docs.type";
import dynamic from "next/dynamic";
import type { GetStaticPaths, GetStaticProps } from "next";
import { type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypePresetMinify from "rehype-preset-minify";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { titleCase } from "title-case";
import type { PluggableList } from "unified";

const DrawerTOC = dynamic(
  () =>
    import("@/components/reader-page/DrawerTOC").then(
      (module) => module.DrawerTOC,
    ),
  { ssr: false },
);

type ReaderPageProps = {
  compiledSource: MDXRemoteSerializeResult;
  tocList: TPostTOCItem[];
  frontMatter: TPostFrontmatter;
  postId: string;
  nextPostListItem: TPostListItem | null;
  prevPostListItem: TPostListItem | null;
};

type PostRenderCacheValue = {
  rawSource: string;
  compiledSource: MDXRemoteSerializeResult;
  tocList: TPostTOCItem[];
};

const globalCache = globalThis as typeof globalThis & {
  __postRenderCache?: Map<string, PostRenderCacheValue>;
};

if (globalCache.__postRenderCache == null) {
  globalCache.__postRenderCache = new Map<string, PostRenderCacheValue>();
}

const postRenderCache = globalCache.__postRenderCache;

const ReaderPage = (props: ReaderPageProps) => {
  const hasServerTOCData = props.tocList.length > 0;
  // const handleLeftSwipe = useSwipeable({
  //   onSwipedLeft: () => isTOCLongEnough && setIsTOCOpen(true),
  //   delta: 150,
  // });

  return (
    <Page>
      <SEO
        coverURL={props.frontMatter.coverURL}
        description={props.frontMatter.summary}
        disableTitlePrefix
        title={titleCase(props.frontMatter.title)}
      />
      <Toaster />
      <NavBar />
      <ContentContainer>
        <div className="mx-auto flex w-full max-w-[1180px] items-start gap-6 py-5">
          <div className="mx-auto min-w-0 w-full max-w-[50rem] flex flex-col justify-center">
            {props.frontMatter.coverURL && (
              <PostCover coverURL={props.frontMatter.coverURL} />
            )}
            <PostRender
              compiledSource={props.compiledSource}
              tocList={props.tocList}
              frontMatter={props.frontMatter}
              postId={props.postId}
              nextPostListItem={props.nextPostListItem}
              prevPostListItem={props.prevPostListItem}
            />
            <Separator />
            <MorePostLinks
              prevPostListItem={props.prevPostListItem}
              nextPostListItem={props.nextPostListItem}
            />
          </div>
          <aside className="hidden w-[190px] shrink-0 lg:block">
            <TOC data={props.tocList} />
          </aside>
        </div>
        {hasServerTOCData && (
          <div className="lg:hidden">
            <DrawerTOC data={props.tocList} />
          </div>
        )}
      </ContentContainer>
      <Footer />
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  const allPaths = sortedPosts.allPostList.map((item) => ({
    params: { id: item.id },
  }));
  return {
    paths: allPaths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ReaderPageProps> = async (
  context,
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const postId = context.params?.id;

  if (postId == null || Array.isArray(postId)) {
    return { notFound: true };
  }

  const source = getPostFileContent(postId);

  if (source == null) {
    return { notFound: true };
  }

  const normalizedSource = source.replace(
    /!\[([^\]]*)\]\((assets\/.+?\.(?:png|jpe?g|gif|webp|svg|avif))\)/gi,
    "![$1](<$2>)",
  );

  let mdxSource: MDXRemoteSerializeResult;
  let tocList: TPostTOCItem[];

  const cached = !isProduction ? postRenderCache.get(postId) : null;

  if (cached != null && cached.rawSource === normalizedSource) {
    mdxSource = cached.compiledSource;
    tocList = cached.tocList;
  } else {
    const rehypePlugins: PluggableList = [
      rehypeRaw,
      [
        rehypeExternalLinks,
        { rel: ["noopener", "noreferrer"], target: "_blank" },
      ],
      rehypeKatex,
      rehypeAutolinkHeadings,
      rehypeSlug,
      ...(isProduction ? (rehypePresetMinify.plugins ?? []) : []),
      () => rehypeHighlight({ detect: isProduction }),
    ];

    mdxSource = await serialize(normalizedSource, {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins,
        format: "md",
      },
    });

    tocList = makeTOCTree(normalizedSource);

    if (!isProduction) {
      postRenderCache.set(postId, {
        rawSource: normalizedSource,
        compiledSource: mdxSource,
        tocList,
      });
    }
  }

  const postIndexInAllPosts = sortedPosts.allPostList.findIndex(
    (item) => item.id === postId,
  );

  const frontMatter: TPostFrontmatter =
    sortedPosts.allPostList[postIndexInAllPosts].frontMatter;

  const nextPostListItem =
    postIndexInAllPosts !== sortedPosts.allPostList.length - 1
      ? sortedPosts.allPostList[postIndexInAllPosts + 1]
      : null;

  const prevPostListItem =
    postIndexInAllPosts !== 0
      ? sortedPosts.allPostList[postIndexInAllPosts - 1]
      : null;

  return {
    props: {
      compiledSource: mdxSource,
      tocList: tocList,
      frontMatter: frontMatter,
      postId: postId,
      nextPostListItem: nextPostListItem,
      prevPostListItem: prevPostListItem,
    },
  };
};

export default ReaderPage;
