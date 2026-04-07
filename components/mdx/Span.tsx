import type { ComponentPropsWithoutRef } from "react";

const Span = (props: ComponentPropsWithoutRef<"span">) => {
  return (
    <span
      translate={props.className?.includes("katex") ? "no" : undefined}
      {...props}
    />
  );
};

export default Span;
