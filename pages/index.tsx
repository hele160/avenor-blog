import { HomeCover } from "@/components/home-page/HomeCover";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/utils/Footer";
import { ContentContainer, Page } from "@/components/utils/Layout";
import { NavBar } from "@/components/utils/NavBar";
import { PostList } from "@/components/utils/PostList";
import { SEO } from "@/components/utils/SEO";
import { LatestPostCountInHomePage } from "@/consts/consts";
import { Config } from "@/data/config";
import { sortedPosts } from "@/lib/post-process";
import { generateRSSFeed } from "@/lib/rss";
import type { TPostListItem } from "@/types/docs.type";
import type { GetStaticProps } from "next";
import Link from "next/link";

type HomePageProps = {
  latestPostList: TPostListItem[];
};

export default function Home(props: HomePageProps) {
  return (
    <Page>
      <SEO
        coverURL={Config.PageCovers.websiteCoverURL}
        description={`Welcome to the ${Config.Nickname}'s blog website. It's the website for recording thoughts for technology, life experience and so on.`}
        title="首页"
      />
      <NavBar />
      <ContentContainer>
        <HomeCover />
        {props.latestPostList.length !== 0 && (
          <div>
            <div className="mx-auto w-full max-w-[880px]">
              <div className="my-5 flex items-center justify-between px-5">
                <h2 className="font-bold text-[18px] text-[#1c2a35] dark:text-white">
                  {"最新文章"}
                </h2>
                <Link
                  className="text-[14px] font-medium text-[#5a6a75] transition-colors hover:text-[#43535f] dark:text-white dark:hover:text-slate-200"
                  href="/posts"
                >
                  {"全部文章 ->"}
                </Link>
              </div>
              <Separator className="mb-4" />
            </div>
            <PostList data={props.latestPostList} />
          </div>
        )}
      </ContentContainer>
      <Footer />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const latestPostList = [];

  for (
    let i = 0, j = 0;
    j < LatestPostCountInHomePage && i < sortedPosts.allPostList.length;
    i++
  ) {
    const postListItem = sortedPosts.allPostList[i];
    if (!postListItem.frontMatter.noPrompt) {
      latestPostList.push(postListItem);
      j++;
    }
  }

  // RSS generation is expensive and in dev it runs on each request,
  // which makes client-side navigation feel very slow.
  if (Config.RSSFeed?.enabled && isProduction) {
    await generateRSSFeed();
  }

  return {
    props: {
      latestPostList: latestPostList,
    },
  };
};
