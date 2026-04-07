import type { TPostListItem } from "@/types/docs.type";

export const MorePostLinks = (props: {
  prevPostListItem: TPostListItem | null;
  nextPostListItem: TPostListItem | null;
}) => {
  return (
    <ul className="my-5 flex list-none flex-col justify-center pl-0">
      {props.prevPostListItem && (
        <li className="my-1">
          <span className="mr-1">上一篇：</span>
          <a
            className=" hover:text-sky-600 dark:hover:text-sky-500"
            href={`/blog/${props.prevPostListItem?.id}`}
          >
            {props.prevPostListItem?.frontMatter.title}
          </a>
        </li>
      )}
      {props.nextPostListItem && (
        <li className="my-1">
          <span className="mr-1">下一篇：</span>
          <a
            className=" hover:text-sky-600 dark:hover:text-sky-500"
            href={`/blog/${props.nextPostListItem?.id}`}
          >
            {props.nextPostListItem?.frontMatter.title}
          </a>
        </li>
      )}
    </ul>
  );
};
