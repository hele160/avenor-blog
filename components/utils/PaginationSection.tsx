import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/utils/Pagination";

type PaginationSectionProps = {
  pageNumber: number;
  pageAmount: number;
  onGotoNextPage: (nextPage: number) => void;
  onGotoPrevPage: (prevPage: number) => void;
  onJumpToSpecPage: (pageNum: number) => void;
  separatorClassName?: string;
};

export const PaginationSection = ({
  pageNumber,
  pageAmount,
  onGotoNextPage,
  onGotoPrevPage,
  onJumpToSpecPage,
  separatorClassName = "mx-auto w-full max-w-[940px]",
}: PaginationSectionProps) => {
  return (
    <>
      <Separator className={separatorClassName} />
      <Pagination
        onGotoNextPage={onGotoNextPage}
        onGotoPrevPage={onGotoPrevPage}
        onJumpToSpecPage={onJumpToSpecPage}
        pageNumber={pageNumber}
        pageAmount={pageAmount}
      />
    </>
  );
};
