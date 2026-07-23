import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, LayoutGrid } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

function GitHubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.74.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.11 0 1.52-.01 2.75-.01 3.12 0 .3.2.66.79.55A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5Z" />
    </svg>
  );
}

const REPO_URL = "https://github.com/SHalimoosavi/SYJ-CanvasForge";

const NAV_LINKS = [
  { to: "/pdf", label: "PDF Editor" },
  { to: "/image", label: "Image Editor" },
  { to: "/document", label: "Documents" },
];

export function Navbar() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--surface-0)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-[var(--text-primary)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LayoutGrid size={18} aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">SYJ-CanvasForge</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
                location.pathname.startsWith(link.to) &&
                  "bg-[var(--surface-2)] text-[var(--text-primary)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <IconButton
            icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          />
          <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
            <IconButton icon={<GitHubMark size={18} />} label="View source on GitHub" />
          </a>
        </div>
      </div>

      <nav
        aria-label="Primary mobile"
        className="flex items-center gap-1 overflow-x-auto border-t border-[var(--border-subtle)] px-4 py-2 md:hidden"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]",
              location.pathname.startsWith(link.to) &&
                "bg-[var(--surface-2)] text-[var(--text-primary)]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
