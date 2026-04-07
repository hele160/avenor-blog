export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="my-8 py-2 text-sm">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-1 px-5 md:flex-row md:items-center md:justify-between">
        <p className="font-semibold text-[#2f3e4a]">{`© ${currentYear} 纸上流年`}</p>
        <p className="text-[#5a6a75]">{"Powered by zS1m • Made by avenor"}</p>
      </div>
    </footer>
  );
};
