import type { ComponentPropsWithoutRef } from "react";

const H2 = (props: ComponentPropsWithoutRef<"h2">) => {
  return (
    <h2
      className={"caption-font mt-6 mb-2 scroll-mt-20 text-[1.45rem]"}
      id={props.id}
    >
      {props.children}
    </h2>
  );
};

export default H2;
