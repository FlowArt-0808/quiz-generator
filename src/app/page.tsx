"use client";

import { useRouter } from "next/navigation";

import SparkleIcon from "@/components/ui/sparkle-icon";

import { useHomeContext } from "./_provider/homeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileIcon from "@/components/ui/file-icon";

const Home = () => {
  const router = useRouter();
  const {
    articleContent,
    articleTitle,
    currentArticleId,
    error,
    generateSummary,
    isGenerated,
    loading,
    questionCount,
    setArticleContent,
    setArticleTitle,
    summary,
  } = useHomeContext();
  const canGenerate =
    articleTitle.trim().length > 0 && articleContent.trim().length > 0;

  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-3xl flex-col gap-5 rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
        <div
          className="flex flex-col gap-2
        "
        ></div>
        <div className="flex gap-2 items-center">
          {" "}
          <SparkleIcon />
          <h1 className="">Article Quiz Generator </h1>
        </div>

        <p className="text-[#71717A] text-[16px]">
          Paste your article below to generate a summarize and quiz question.
          Your articles will saved in the sidebar for future reference.
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            {" "}
            <FileIcon />
            <h2 className="text-[#71717A] text-[14px] font-semibold">
              Article Title
            </h2>
          </div>
          <Input
            placeholder="Enter a title for your article"
            value={articleTitle}
            onChange={(event) => setArticleTitle(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            {" "}
            <FileIcon />
            <h2 className="text-[#71717A] text-[14px] font-semibold">
              Article Content
            </h2>
          </div>
          <Textarea
            className="min-h-48"
            placeholder="Paste your article content"
            value={articleContent}
            onChange={(event) => setArticleContent(event.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {summary ? (
          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-5">
            <div className="flex items-center gap-2">
              <SparkleIcon />
              <h2 className="text-lg font-semibold">Generated summary</h2>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#3F3F46]">
              {summary}
            </p>
          </div>
        ) : null}

        {loading ? (
          <Button
            disabled
            className="h-10 w-fit self-end px-4 py-2 text-[#FFFF]"
          >
            Generating summary...
          </Button>
        ) : isGenerated ? (
          <div className="flex items-center gap-3 self-end">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => void generateSummary()}
            >
              Generate again
            </Button>
            <Button
              className="h-10 w-fit cursor-pointer px-4 py-2 text-[#FFFF] hover:opacity-100"
              onClick={() =>
                router.push(
                  currentArticleId ? `/quiz?articleId=${currentArticleId}` : "/quiz"
                )
              }
            >
              Take a quiz
            </Button>
          </div>
        ) : (
          <Button
            disabled={!canGenerate}
            className="h-10 w-fit self-end px-4 py-2 text-[#FFFF] hover:opacity-100"
            onClick={() => void generateSummary()}
          >
            Generate summary
          </Button>
        )}

        {isGenerated && questionCount > 0 ? (
          <p className="text-sm text-[#71717A]">
            {questionCount} quiz questions are ready for this article.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
