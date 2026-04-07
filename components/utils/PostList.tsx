import type { TPostListItem } from "@/types/docs.type";
import Link from "next/link";
import { PostDate } from "./PostDate";

const estimateReadingMinutes = (postItem: TPostListItem) => {
  const sourceText = `${postItem.frontMatter.title} ${postItem.frontMatter.summary ?? ""}`;
  const roughWordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(roughWordCount / 180));
};

type PostListProps = {
  data: TPostListItem[];
  variant?: "default" | "posts";
};

export const PostList = (props: PostListProps) => {
  const isPostsVariant = props.variant === "posts";

  return (
    <ul
      className={`posts-list ${isPostsVariant ? "" : "posts-list--default"}`.trim()}
      role="list"
    >
      {props.data.map((postItem) => (
        <li className="post-card-item is-visible" key={postItem.id}>
          <Link className="post-card" href={`/blog/${postItem.id}`}>
            <div className="post-card-body">
              <div className="post-card-meta">
                <PostDate
                  className="post-date"
                  date={postItem.frontMatter.time}
                />
                <span aria-hidden="true" className="post-separator">
                  ·
                </span>
                <span className="post-reading-time">{`约 ${estimateReadingMinutes(postItem)} 分钟`}</span>
              </div>

              <h2 className="post-title">
                <span className="post-link">{postItem.frontMatter.title}</span>
              </h2>

              {postItem.frontMatter.subtitle && (
                <p className="post-subtitle">{postItem.frontMatter.subtitle}</p>
              )}

              {postItem.frontMatter.summary && (
                <p className="post-desc">{postItem.frontMatter.summary}</p>
              )}

              {postItem.frontMatter.tags && (
                <ul aria-label="标签列表" className="post-tags" role="list">
                  {postItem.frontMatter.tags.map((tagName: string) => (
                    <li key={`tags-${postItem.id}-${tagName}`}>
                      <span className="tag">{tagName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span aria-hidden="true" className="post-arrow">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
