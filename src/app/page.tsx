"use client";

import SparkleIcon from "@/components/ui/sparkle-icon";

import { useHomeContext } from "./_provider/homeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileIcon from "@/components/ui/file-icon";
import AppSidebar from "./app-sidebar";

const Home = () => {
  const { loading, setLoading, isGenerated } = useHomeContext();

  return (
    <div className="w-screen flex justify-center items-center">
      {" "}
      <AppSidebar />
      <div className="p-7 border-[#E4E4E7] border rounded-lg flex flex-col gap-5 w-fit">
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
          <Input placeholder="Enter a title for your article" />
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
            className="h-30"
            placeholder="Enter a title for your article"
          />
        </div>

        {loading ? (
          <Button
            className={`text-[#FFFF] flex items-center justify-center py-2 px-4 h-10 w-fit self-end 
        `}
          >
            Generating summary...
          </Button>
        ) : isGenerated ? (
          <Button
            className={`text-[#FFFF] flex items-center justify-center py-2 px-4 h-10 w-fit self-end  cursor-pointer"
            } hover:opacity-100
        `}
          >
            Take a quiz
          </Button>
        ) : (
          <Button
            className={`text-[#FFFF] flex items-center justify-center py-2 px-4 h-10 w-fit self-end ${
              loading ? "opacity-100" : "opacity-20 cursor-pointer"
            } hover:opacity-100
        `}
          >
            Generate summary
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home;
