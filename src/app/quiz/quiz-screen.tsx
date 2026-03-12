"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Answers from "../_components/answers";
import { QuizProvider, useQuizContext } from "../_provider/quizProvider";
import SparkleIcon from "@/components/ui/sparkle-icon";
import { Button } from "@/components/ui/button";

function QuizContent() {
  const router = useRouter();
  const {
    article,
    currentQuestionIndex,
    error,
    goToPreviousQuestion,
    lastAttempt,
    loading,
    nextQuestion,
    result,
    restartQuiz,
    selectAnswer,
    selectedAnswer,
  } = useQuizContext();

  if (loading && !article) {
    return (
      <div className="flex min-h-full w-full justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
          Loading quiz...
        </div>
      </div>
    );
  }

  if (!article || !article.questions.length) {
    return (
      <div className="flex min-h-full w-full justify-center p-6 md:p-10">
        <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-2">
            <SparkleIcon />
            <h1 className="text-2xl font-semibold">No quiz ready yet</h1>
          </div>
          <p className="text-[#71717A]">
            {error ||
              "Generate a summary first so the app has an article and quiz to work from."}
          </p>
          <Button className="w-fit" onClick={() => router.push("/")}>
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-full w-full justify-center p-6 md:p-10">
        <div className="flex w-full max-w-4xl flex-col gap-6">
          <div className="rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SparkleIcon />
                  <h1 className="text-2xl font-semibold">Quiz results</h1>
                </div>
                <p className="mt-2 text-[#71717A]">{article.title}</p>
              </div>
              <div className="rounded-2xl bg-black px-5 py-4 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  Score
                </p>
                <p className="text-3xl font-semibold">
                  {result.score}/{result.total}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={restartQuiz}>Retake quiz</Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to article
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result.answers.map((answer, index) => (
              <div
                key={answer.questionId}
                className="rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#71717A]">
                      Question {index + 1}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {answer.question}
                    </h2>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
                      answer.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-4">
                    <p className="text-sm font-medium text-[#71717A]">
                      Your answer
                    </p>
                    <p className="mt-2 text-sm text-[#18181B]">
                      {answer.selectedAnswer ?? "No answer selected"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-700">
                      Correct answer
                    </p>
                    <p className="mt-2 text-sm text-green-900">
                      {answer.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const question = article.questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const isLastQuestion = currentQuestionIndex === article.questions.length - 1;

  return (
    <div className="flex min-h-full w-full justify-center p-6 md:p-10">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SparkleIcon />
                <h1 className="text-2xl font-semibold">Quick test</h1>
              </div>
              <p className="mt-2 text-[#71717A]">{article.title}</p>
            </div>
            <div className="flex items-center gap-3">
              {lastAttempt ? (
                <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 text-sm text-[#3F3F46]">
                  Last score: {lastAttempt.score}/{lastAttempt.total}
                </div>
              ) : null}
              <Button variant="outline" onClick={() => router.push("/")}>
                Close
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#71717A]">
                Question {questionNumber} of {article.questions.length}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{question.question}</h2>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6">
            <Answers
              options={question.options}
              selectedAnswer={selectedAnswer}
              onSelect={selectAnswer}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0 || loading}
              onClick={goToPreviousQuestion}
            >
              Previous
            </Button>
            <Button disabled={!selectedAnswer || loading} onClick={nextQuestion}>
              {loading
                ? "Saving..."
                : isLastQuestion
                  ? "Finish quiz"
                  : "Next question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const QuizScreen = () => {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");

  return (
    <QuizProvider articleId={articleId}>
      <QuizContent />
    </QuizProvider>
  );
};

export default QuizScreen;
