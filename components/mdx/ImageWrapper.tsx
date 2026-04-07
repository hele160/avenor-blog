import type { ComponentPropsWithoutRef } from "react";

// Unlike other mdx elements, it does not receive the converted img tag,
// but all the attributes of the img tag.
const ImageWrapper = (props: ComponentPropsWithoutRef<"img">) => {
  const { alt, src, className, loading, decoding, fetchPriority, ...rest } = props;

  return (
    <span className="my-5 flex flex-col">
      <img
        alt={alt ?? ""}
        className={className ?? "mx-auto my-0"}
        decoding={decoding ?? "async"}
        fetchPriority={fetchPriority ?? "low"}
        loading={loading ?? "lazy"}
        src={src}
        {...rest}
      />
      {alt && <span className="mx-auto my-1 text-gray-500 text-sm dark:text-gray-300">{alt}</span>}
    </span>
  );
};

export default ImageWrapper;
