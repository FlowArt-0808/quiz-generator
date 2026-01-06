"use client";

import { useState } from "react";

import SparkleIcon from "@/components/ui/sparkle-icon";
import { Button } from "@/components/ui/button";
import Answers from "../_components/answers";
import AppSidebar from "../app-sidebar";
import { useQuizContext } from "../_provider/quizProvider";

const Quiz = () => {
  const {} = useQuizContext();
  const [dummyTitles, setDummyTitles] = useState({
    questionOne: `Question 1`,
    questionTwo: `Question 2`,
  });
  const [dummyWhichQuestion, setDummyWhichQuesti] = useState({
    questionOne: `1`,
    questionTwo: `2`,
  });
  return (
    <div className="w-full ">
      <AppSidebar />
      <div className="flex flex-col gap-6 items-center justify-center">
        <div className="flex items-center justify-between gap-16">
          {" "}
          <div>
            {" "}
            <div className="flex gap-2 items-center">
              <SparkleIcon />
              <h1 className="text-2xl font-semibold">Quick test</h1>
            </div>
            <p className="text-[#71717A] text-[16px] font-normal">
              Take a quick test about your knowledge from your content
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center justify-center cursor-pointer py-2 px-4"
          >
            X
          </Button>
        </div>{" "}
        <div className="border border-[#E4E4E7] rounded-lg p-7 flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium">{dummyTitles.questionOne}</h1>
            <h1 className="text-xl font-medium">
              {dummyWhichQuestion.questionOne}
              <span className="text-[#737373] text-[16px] font-medium">
                {" "}
                / 5
              </span>
            </h1>
          </div>
          <Answers />,
        </div>
      </div>
    </div>
  );
};

export default Quiz;
