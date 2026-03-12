import { Suspense } from "react";

import QuizScreen from "./quiz-screen";

function QuizFallback() {
  return (
    <div className="flex min-h-full w-full justify-center p-6 md:p-10">
      <div className="w-full max-w-4xl rounded-2xl border border-[#E4E4E7] bg-white p-7 shadow-sm">
        Loading quiz...
      </div>
    </div>
  );
}

const QuizPage = () => {
  return (
    <Suspense fallback={<QuizFallback />}>
      <QuizScreen />
    </Suspense>
  );
};

export default QuizPage;
