import type { ComponentPropsWithoutRef } from "react";

const resolveImageSrc = (src?: string | Blob) => {
  if (src == null) return src;
  if (typeof src !== "string") return src;
  if (src.length === 0) return src;

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("/")
  ) {
    return src;
  }

  const normalized = src.replace(/^\.\//, "");

  if (normalized.startsWith("assets/")) {
    const relativePath = normalized.slice("assets/".length);
    return `/api/post-assets/${relativePath}`;
  }

  return src;
};

// Unlike other mdx elements, it does not receive the converted img tag,
// but all the attributes of the img tag.
const ImageWrapper = (props: ComponentPropsWithoutRef<"img">) => {
  const { alt, src, className, loading, decoding, fetchPriority, ...rest } =
    props;
  const resolvedSrc = resolveImageSrc(src);

  return (
    <span className="my-5 flex flex-col">
      <img
        alt={alt ?? ""}
        className={className ?? "mx-auto my-0"}
        decoding={decoding ?? "async"}
        fetchPriority={fetchPriority ?? "low"}
        loading={loading ?? "lazy"}
        src={resolvedSrc}
        {...rest}
      />
      {alt && (
        <span className="mx-auto my-1 text-gray-500 text-sm dark:text-gray-300">
          {alt}
        </span>
      )}
    </span>
  );
};

export default ImageWrapper;
