import fs from "fs";
import {
  CopyrightAnnouncement,
  LatestPostCountInHomePage,
  WebsiteURL,
} from "@/consts/consts";
import { Config } from "@/data/config";
import { Feed } from "feed";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeMathJax from "rehype-mathjax/svg";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import matter from "gray-matter";
import { getPostFileContent, sortedPosts } from "./post-process";

const NoticeForRSSReaders = (postId: string) => `
---
**NOTE:** Different RSS reader may have deficient even no support for svg formulations rendering. 
If it happens, [please read the origin web page](https://${Config.SiteDomain}/blog/${postId}) to have better experience
`;

function minifyHTMLCode(htmlString: string): string {
  // Keep RSS HTML small and safe without relying on heavy DOM parsers.
  return htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\sclass=("[^"]*"|'[^']*')/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate the RSS Feed File in `./public` so it could be visited by https://domain/rss.xml
 */
export const generateRSSFeed = async () => {
  const feed = new Feed({
    title: Config.SiteTitle,
    description: Config.Sentence,
    id: Config.SiteDomain,
    link: WebsiteURL,
    image: Config.PageCovers.websiteCoverURL,
    favicon: `https://${Config.SiteDomain}/favcion.ico`,
    copyright: CopyrightAnnouncement,
    generator: "Node.js Feed",
    author: {
      name: Config.AuthorName,
      email: Config.SocialLinks.email,
      link: WebsiteURL,
    },
  });

  for (
    let i = 0;
    i < Math.min(LatestPostCountInHomePage, sortedPosts.allPostList.length);
    i++
  ) {
    const post = sortedPosts.allPostList[i];
    const rawPostFileContent = getPostFileContent(post.id) ?? "";
    const postFileContent = `${matter(rawPostFileContent).content}${NoticeForRSSReaders(post.id)}`;
    const dateNumber = post.frontMatter.time
      .split("-")
      .map((num: string) => Number.parseInt(num));
    const htmlContent = minifyHTMLCode(
      String(
        await unified()
          .use(remarkParse)
          .use(remarkMath)
          .use(remarkGfm)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypeExternalLinks, {
            rel: ["noopener", "noreferrer"],
            target: "_blank",
          })
          .use(rehypeMathJax)
          .use(rehypeAutolinkHeadings)
          .use(rehypeSlug)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(postFileContent),
      ),
    );

    feed.addItem({
      title: post.frontMatter.title,
      id: post.id,
      link: `https://${Config.SiteDomain}/blog/${post.id}`,
      description: post.frontMatter.summary ?? undefined,
      content: htmlContent,
      author: [
        {
          name: Config.AuthorName,
          email: Config.SocialLinks.email,
          link: `https://${Config.SiteDomain}/about`,
        },
      ],
      category: post.frontMatter.tags?.map((tagname: string) => ({
        name: tagname,
      })),
      date: new Date(dateNumber[0], dateNumber[1] - 1, dateNumber[2]),
      image: post.frontMatter.coverURL ?? undefined,
    });
  }
  fs.writeFile("./public/rss.xml", feed.rss2(), "utf-8", (err) => {});
};
