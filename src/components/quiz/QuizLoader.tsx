"use client";

import dynamic from "next/dynamic";

export const QuizLoader = dynamic(() => import("./Quiz"), {
  ssr: false,
  loading: () => <div className="h-96" aria-busy="true" />,
});
