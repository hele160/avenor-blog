import type { TSearchResultItem } from "@/types/docs.type";

export const SearchResultList = (props: {
  searchResult: TSearchResultItem[];
}) => {
  return (
    <div>
      <div className="flex flex-col justify-center">
        <div className={"flex min-h-full flex-col content-font"}>
          {props.searchResult.map((item, index) => (
            <a
              className={`border-t p-2 ${
                index === props.searchResult.length - 1 && "border-b"
              } flex flex-col hover:bg-gray-50 dark:hover:bg-gray-900`}
              href={`/blog/${item.id}`}
              key={item.id}
              target="_blank"
              rel="noreferrer"
            >
              <div className="my-1">
                <div className="post-list-caption-font font-bold text-md capitalize">
                  {item.title}
                </div>
                {item.summary && <div className="">{item.summary}</div>}
              </div>
              <div className="flex flex-wrap space-x-2">
                {item.tags?.map((tagitem) => (
                  <div
                    className="text-gray-500 text-sm dark:text-gray-400"
                    key={`${item.id}-${tagitem}`}
                  >
                    {tagitem}
                  </div>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="my-3 text-center text-gray-500 dark:text-gray-400">
        <p className="mx-auto text-sm">
          {"For search efficiency, only the first 20 results are displayed."}
        </p>
      </div>
    </div>
  );
};
