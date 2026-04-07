import Link from "next/link";
import type { TTagListItem } from "@/types/docs.type";

export const TagsList = (props: { tagsList: TTagListItem[] }) => {
  return (
    <div aria-label="标签列表" className="tags-filter w-full">
      <div className="flex flex-wrap gap-2">
        {props.tagsList.map((item) => (
          <Link
            className="tag-chip"
            href={`/tags/${item.name}`}
            key={`tags-${item.name}`}
          >
            <span className="tag">{item.name}</span>
            <span aria-label={`${item.count} 篇`} className="tag-count">
              {item.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
