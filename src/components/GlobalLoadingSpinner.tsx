"use client";

import { useLoadingStore } from "@/store/loadingStore";
import React from "react";

const GlobalLoadingSpinner = () => {
  const { isLoading } = useLoadingStore();

  return isLoading ? (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
  ) : null;
};

export default GlobalLoadingSpinner;
