import { normalizeDateZh } from "@/lib/date";

type PostDateProps = {
  date?: string | null;
  className?: string;
};

export const PostDate = ({ date, className }: PostDateProps) => {
  const safeDate = date ?? "1970-01-01";

  return (
    <time className={className} dateTime={safeDate}>
      {normalizeDateZh(safeDate)}
    </time>
  );
};
