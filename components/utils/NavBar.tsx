import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import { type MouseEvent, useEffect, useState } from "react";
import { MdMenu, MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const MenuItems = [
  {
    title: "首页",
    href: "/",
  },
  {
    title: "文章",
    href: "/posts",
  },
  {
    title: "关于",
    href: "/about",
  },
];

export const NavBar = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isThemeSwitching, setIsThemeSwitching] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const isMenuItemActive = (href: string) => {
    const currentPath = router.asPath.split("?")[0];

    if (href === "/") {
      return currentPath === "/";
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSwitchTheme = (event: MouseEvent<HTMLElement>) => {
    if (!isMounted || isThemeSwitching) {
      return;
    }

    const nextTheme = theme === "light" ? "dark" : "light";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setTheme(nextTheme);
      setIsSideNavOpen(false);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxX = Math.max(centerX, window.innerWidth - centerX);
    const maxY = Math.max(centerY, window.innerHeight - centerY);
    const radius = Math.hypot(maxX, maxY);

    const documentWithTransition = document as DocumentWithViewTransition;
    const startTransition =
      documentWithTransition.startViewTransition?.bind(document);

    if (startTransition == null) {
      setTheme(nextTheme);
      setIsSideNavOpen(false);
      return;
    }

    setIsThemeSwitching(true);

    const transition = startTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${centerX}px ${centerY}px)`,
              `circle(${radius}px at ${centerX}px ${centerY}px)`,
            ],
          },
          {
            duration: 650,
            easing: "cubic-bezier(0.22, 0.78, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        setTheme(nextTheme);
      });

    transition.finished.finally(() => {
      setIsThemeSwitching(false);
    });

    setIsSideNavOpen(false);
  };

  return (
    <Sheet onOpenChange={(open) => setIsSideNavOpen(open)} open={isSideNavOpen}>
      <div className="sticky top-0 z-50 border-black-200 border-b bg-[hsl(var(--background))] px-5 py-2.5 dark:border-[#2b3a49] dark:bg-[rgb(17,24,32)]">
        <div className="relative mx-auto flex w-full max-w-[880px] items-center justify-between">
          <Link className="my-auto cursor-pointer pl-5" href="/">
            <span className="logo-text">{"纸上流年"}</span>
          </Link>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 sm:flex">
            {MenuItems.map((menuItem) => {
              const isActive = isMenuItemActive(menuItem.href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`pointer-events-auto nav-chip ${isActive ? "nav-chip--active" : ""}`}
                  href={menuItem.href}
                  key={`menu-desktop-${menuItem.href}`}
                  onClick={() => setIsSideNavOpen(false)}
                >
                  {menuItem.title}
                </Link>
              );
            })}
          </div>

          <div className="my-auto hidden items-center sm:flex">
            <div
              className="mx-1 cursor-pointer rounded-full p-1.5 text-2xl text-black hover:bg-gray-200 dark:text-gray-50 dark:hover:bg-gray-800"
              onClick={handleSwitchTheme}
              title={
                isMounted && theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {isMounted ? (
                theme === "light" ? (
                  <MdOutlineDarkMode />
                ) : (
                  <MdOutlineLightMode />
                )
              ) : (
                <MdOutlineDarkMode />
              )}
            </div>
          </div>

          <div className="my-auto text-3xl sm:hidden">
            <SheetTrigger
              className="rounded-full p-1 text-black hover:bg-gray-200 dark:text-gray-50 dark:hover:bg-gray-800"
              title="Spread the navigation menu"
            >
              <MdMenu
                onClick={() => {
                  setIsSideNavOpen(!isSideNavOpen);
                }}
              />
            </SheetTrigger>
          </div>
        </div>
      </div>
      <SheetContent className="bg:white flex flex-col border-none py-16 text-end shadow-md dark:bg-black">
        {MenuItems.map((menuItem) => (
          <Link
            className="border-b border-dashed p-3 text-xl hover:text-sky-500"
            href={menuItem.href}
            key={`menu-mobile-${menuItem.href}`}
            onClick={() => setIsSideNavOpen(false)}
          >
            {menuItem.title}
          </Link>
        ))}
        <div
          className="flex cursor-pointer justify-end border-b border-dashed p-3 text-xl hover:text-sky-500"
          onClick={handleSwitchTheme}
        >
          <div
            className="mx-1 my-auto cursor-pointer rounded-full text-2xl"
            title={
              isMounted && theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {isMounted ? (
              theme === "light" ? (
                <MdOutlineDarkMode />
              ) : (
                <MdOutlineLightMode />
              )
            ) : (
              <MdOutlineDarkMode />
            )}
          </div>
          <div className="my-auto">
            {isMounted ? (theme === "light" ? "DARK" : "LIGHT") : "LIGHT"}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
