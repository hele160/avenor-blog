import { TagsList } from "@/components/post-list-page/TagsList";
import { Footer } from "@/components/utils/Footer";
import { ContentContainer, Page } from "@/components/utils/Layout";
import { NavBar } from "@/components/utils/NavBar";
import { PaginationSection } from "@/components/utils/PaginationSection";
import { PostList } from "@/components/utils/PostList";
import { SEO } from "@/components/utils/SEO";
import { PostCountPerPagination } from "@/consts/consts";
import { Config } from "@/data/config";
import { sortedPosts } from "@/lib/post-process";
import { paginateArray } from "@/lib/utils";
import type { TPostListItem } from "@/types/docs.type";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

type PostsPageProps = {
  pageAmount: number;
  pageNumber: number;
  postList: TPostListItem[];
  tagList: { name: string; count: number }[];
  totalPostCount: number;
};

export default function PostsPage(props: PostsPageProps) {
  const router = useRouter();

  const handleChangePage = (pageNumber: number) => {
    router.push(`/posts/${pageNumber}`);
  };

  return (
    <Page>
      <SEO
        coverURL={Config.PageCovers.websiteCoverURL}
        description={
          "Here is the list page for all published posts. Click here for more details."
        }
        title="文章"
      />
      <NavBar />
      <ContentContainer>
        <div className="posts-page-container">
          <div className="blog-header w-full">
            <h1 className="page-title caption-font">文章</h1>
            <p className="page-subtitle">{`共 ${props.totalPostCount} 篇，持续更新中`}</p>
          </div>
          <TagsList tagsList={props.tagList} />
          <PostList data={props.postList} variant="posts" />
        </div>
        <PaginationSection
          onGotoNextPage={(nextPage) => handleChangePage(nextPage)}
          onGotoPrevPage={(prevPage) => handleChangePage(prevPage)}
          onJumpToSpecPage={(pageNum) => handleChangePage(pageNum)}
          pageNumber={props.pageNumber}
          pageAmount={props.pageAmount}
        />
      </ContentContainer>
      <Footer />
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = () => {
  const allPaths: { params: { slug?: string[] } }[] = [
    { params: { slug: [] } },
  ];

  const pageAmount = Math.ceil(
    sortedPosts.allPostList.length / PostCountPerPagination,
  );

  for (let i = 0; i < pageAmount; i++) {
    allPaths.push({ params: { slug: [(i + 1).toString()] } });
  }

  return { paths: allPaths, fallback: false };
};

export const getStaticProps: GetStaticProps<PostsPageProps> = async (
  context,
) => {
  const params = (context.params?.slug as string[]) ?? [];

  const pageNumber = params[0] ? Number.parseInt(params[0]) : 1;

  const postList: TPostListItem[] = paginateArray(
    sortedPosts.allPostList,
    PostCountPerPagination,
    pageNumber,
  );

  const pageAmount = Math.ceil(
    sortedPosts.allPostList.length / PostCountPerPagination,
  );

  const tagList: {
    name: string;
    count: number;
  }[] = Object.keys(sortedPosts.postsByTag)
    .map((tagName) => ({
      name: tagName,
      count: sortedPosts.postsByTag[tagName].length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    props: {
      pageAmount: pageAmount,
      pageNumber: pageNumber,
      postList: postList,
      tagList: tagList,
      totalPostCount: sortedPosts.allPostList.length,
    },
  };
};
