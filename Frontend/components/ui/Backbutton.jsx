"use client"
import React from "react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Backbutton() {
  const router = useRouter();

  const onBack = () => {
    router.back();
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onBack}
      className="w-8 h-8 sm:w-10 sm:h-10"
    >
      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
    </Button>
  );
}
