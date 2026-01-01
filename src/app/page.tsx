"use client";

import SparkleIcon from "@/components/ui/sparkle-icon";

import { useHomeContext } from "./_provider/homeProvider";
import { Input } from "@/components/ui/input";

const Home = () => {
  return (
    <div className="w-screen flex justify-center items-center">
      {" "}
      <div className="p-7 border-[#E4E4E7] border rounded-lg flex flex-col gap-5 w-fit">
        <div
          className="flex flex-col gap-2
        "
        >
          <div className="flex gap-2 items-center">
            {" "}
            <SparkleIcon />
            <h1 className="">Article Quiz Generator </h1>
          </div>

          <p className="text-[#71717A] text-[16px]">
            Paste your article below to generate a summarize and quiz question.
            Your articles will saved in the sidebar for future reference.
          </p>
          <div className="flex gap-2">
            {" "}
            <Input placeholder="Enter a title for your article" />
          </div>

          <div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
