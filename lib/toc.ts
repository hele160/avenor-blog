import type { TPostTOCItem } from "@/types/docs.type";

const decodeHtml = (text: string) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

/**
 * Generate the Table Of Content List by html code.
 * It supports h1-h6 level headings at most.
 * @param htmlCode
 * @returns
 */
export const makeTOCTree = (htmlCode: string) => {
  const result: TPostTOCItem[] = [];

  const headingRegex = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;

  for (const match of htmlCode.matchAll(headingRegex)) {
    const level = Number.parseInt(match[1], 10);
    const attrs = match[2] ?? "";
    const rawTitle = match[3] ?? "";
    const anchorId = attrs.match(/\sid=["']([^"']+)["']/i)?.[1] ?? "";
    const title = decodeHtml(rawTitle.replace(/<[^>]+>/g, "").trim());

    result.push({
      level,
      anchorId,
      title,
    });
  }

  return result;
};
