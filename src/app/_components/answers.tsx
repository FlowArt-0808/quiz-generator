"use client";

import { Button } from "@/components/ui/button";

type AnswersProps = {
  disabled?: boolean;
  onSelect: (answer: string) => void;
  options: string[];
  selectedAnswer: string | null;
};

const Answers = ({
  disabled = false,
  onSelect,
  options,
  selectedAnswer,
}: AnswersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {options.map((option) => {
        const isSelected = selectedAnswer === option;

        return (
          <Button
            key={option}
            type="button"
            variant={isSelected ? "default" : "outline"}
            className="min-h-14 cursor-pointer justify-start whitespace-normal px-4 py-3 text-left"
            disabled={disabled}
            onClick={() => onSelect(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
};

export default Answers;
