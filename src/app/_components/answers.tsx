"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const Answers = () => {
  const [dummyAnswers, setDummyAnswers] = useState({
    answerOne: `Answer 1`,
    answerTwo: `Answer 2`,
    answerThree: `Answer 3`,
    answerFour: `Answer 4`,
  });
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4">
      {Object.entries(dummyAnswers).map(([key, value]) => (
        <Button
          variant="outline"
          className="px-4 py-2 h-10 flex items-center justify-center cursor-pointer"
          key={key}
        >
          {value}
        </Button>
      ))}
    </div>
  );
};

export default Answers;
