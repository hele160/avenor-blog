import type { ComponentPropsWithoutRef } from "react";

const TableWrapper = ({ children }: ComponentPropsWithoutRef<"table">) => {
  return (
    <div className="flat-scrollbar-normal w-full overflow-x-auto">
      <table>{children}</table>
    </div>
  );
};

export default TableWrapper;
