import { QuizProvider } from "../_provider/quizProvider";

const QuizLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <QuizProvider>{children}</QuizProvider>;
};

export default QuizLayout;
