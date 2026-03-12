"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  History,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useHomeContext } from "./_provider/homeProvider";
import {
  ARTICLE_STORAGE_EVENT,
  getSavedArticles,
  setCurrentArticleId,
  type SavedArticle,
} from "@/lib/article-store";
import { cn } from "@/lib/utils";

const navigation = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/quiz",
    label: "Quiz",
    icon: FileText,
  },
];

type SidebarContentProps = {
  articles: SavedArticle[];
  compact?: boolean;
  onClose?: () => void;
  onOpenArticle: (articleId: string) => void;
  onOpenQuiz: (articleId: string) => void;
  pathname: string;
  onToggle?: () => void;
};

function formatSavedDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function SidebarContent({
  articles,
  compact = false,
  onClose,
  onOpenArticle,
  onOpenQuiz,
  pathname,
  onToggle,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[#E4E4E7] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <History className="h-5 w-5" />
          </div>
          {!compact && (
            <div>
              <p className="text-sm font-semibold text-[#18181B]">History</p>
              <p className="text-xs text-[#71717A]">
                {articles.length} saved article{articles.length === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>
        {onToggle ? (
          <button
            type="button"
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className="hidden rounded-lg border border-[#E4E4E7] p-2 text-[#71717A] transition hover:bg-[#F4F4F5] md:inline-flex"
          >
            {compact ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg border border-[#E4E4E7] p-2 text-[#71717A] transition hover:bg-[#F4F4F5] md:hidden"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex flex-col gap-2 px-3 py-4">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                compact ? "justify-center" : "justify-start",
                isActive
                  ? "bg-[#18181B] text-white"
                  : "text-[#3F3F46] hover:bg-[#F4F4F5]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!compact && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {compact ? (
          <div className="flex justify-center">
            <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4 py-3 text-center">
              <p className="text-xl font-semibold text-[#18181B]">
                {articles.length}
              </p>
              <p className="text-xs text-[#71717A]">saved</p>
            </div>
          </div>
        ) : articles.length ? (
          <div className="flex flex-col gap-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-4"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onOpenArticle(article.id)}
                >
                  <p className="line-clamp-2 text-sm font-semibold text-[#18181B]">
                    {article.title}
                  </p>
                  <p className="mt-1 text-xs text-[#71717A]">
                    Saved {formatSavedDate(article.createdAt)}
                  </p>
                </button>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#71717A]">
                    {article.lastAttempt
                      ? `Last score ${article.lastAttempt.score}/${article.lastAttempt.total}`
                      : `${article.questions.length} questions ready`}
                  </span>
                  <button
                    type="button"
                    className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white"
                    onClick={() => onOpenQuiz(article.id)}
                  >
                    Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-4">
            <p className="text-sm font-medium text-[#18181B]">
              No saved articles yet
            </p>
            <p className="mt-2 text-sm text-[#71717A]">
              Generate a summary and the article will appear here with its quiz.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { loadSavedArticle } = useHomeContext();
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    const syncArticles = () => {
      setSavedArticles(getSavedArticles());
    };

    syncArticles();
    window.addEventListener(ARTICLE_STORAGE_EVENT, syncArticles);
    window.addEventListener("storage", syncArticles);

    return () => {
      window.removeEventListener(ARTICLE_STORAGE_EVENT, syncArticles);
      window.removeEventListener("storage", syncArticles);
    };
  }, []);

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null;
  }

  const openArticle = (articleId: string) => {
    loadSavedArticle(articleId);
    setCurrentArticleId(articleId);
    setMobileOpen(false);
    router.push("/");
  };

  const openQuiz = (articleId: string) => {
    setCurrentArticleId(articleId);
    setMobileOpen(false);
    router.push(`/quiz?articleId=${articleId}`);
  };

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r border-[#E4E4E7] bg-white transition-[width] duration-300 md:flex",
          desktopCollapsed ? "w-20" : "w-72"
        )}
      >
        <SidebarContent
          articles={savedArticles}
          compact={desktopCollapsed}
          onOpenArticle={openArticle}
          onOpenQuiz={openQuiz}
          pathname={pathname}
          onToggle={() => setDesktopCollapsed((current) => !current)}
        />
      </aside>

      {!mobileOpen ? (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="fixed top-20 left-4 z-30 inline-flex rounded-lg border border-[#E4E4E7] bg-white p-2 text-[#18181B] shadow-sm md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      ) : null}

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-40 flex w-72 flex-col border-r border-[#E4E4E7] bg-white shadow-lg transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          articles={savedArticles}
          onClose={() => setMobileOpen(false)}
          onOpenArticle={openArticle}
          onOpenQuiz={openQuiz}
          pathname={pathname}
        />
      </aside>
    </>
  );
}

export default AppSidebar;
