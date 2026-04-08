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
import matter from "gray-matter";
import dynamic from "next/dynamic";
import type { GetStaticPaths, GetStaticProps } from "next";
import { titleCase } from "title-case";

const DrawerTOC = dynamic(
  () =>
    import("@/components/reader-page/DrawerTOC").then(
      (module) => module.DrawerTOC,
    ),
  { ssr: false },
);

type ReaderPageProps = {
  source: string;
  tocList: TPostTOCItem[];
  frontMatter: TPostFrontmatter;
  postId: string;
  nextPostListItem: TPostListItem | null;
  prevPostListItem: TPostListItem | null;
};

type PostRenderCacheValue = {
  rawSource: string;
  source: string;
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
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 py-5 lg:grid-cols-[190px_minmax(0,50rem)_190px] lg:gap-x-6">
          <div className="hidden lg:block" />
          <div className="mx-auto min-w-0 w-full max-w-[50rem] flex flex-col justify-center lg:mx-0">
            {props.frontMatter.coverURL && (
              <PostCover coverURL={props.frontMatter.coverURL} />
            )}
            <PostRender
              source={props.source}
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
          <aside className="hidden w-[190px] lg:block">
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

  const markdownContent = matter(source).content;

  const normalizedSource = markdownContent.replace(
    /!\[([^\]]*)\]\((assets\/.+?\.(?:png|jpe?g|gif|webp|svg|avif))\)/gi,
    "![$1](<$2>)",
  );

  let sourceForRender: string;
  let tocList: TPostTOCItem[];

  const cached = !isProduction ? postRenderCache.get(postId) : null;

  if (cached != null && cached.rawSource === normalizedSource) {
    sourceForRender = cached.source;
    tocList = cached.tocList;
  } else {
    sourceForRender = normalizedSource;

    tocList = makeTOCTree(normalizedSource);

    if (!isProduction) {
      postRenderCache.set(postId, {
        rawSource: normalizedSource,
        source: sourceForRender,
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
      source: sourceForRender,
      tocList: tocList,
      frontMatter: frontMatter,
      postId: postId,
      nextPostListItem: nextPostListItem,
      prevPostListItem: prevPostListItem,
    },
  };
};

export default ReaderPage;
