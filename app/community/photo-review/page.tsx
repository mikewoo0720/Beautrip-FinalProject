"use client";

import { useEffect, Suspense } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryPhotoReviewPage from "@/components/CategoryPhotoReviewPage";

export default function PhotoReviewPage() {
  // 페이지 마운트 시 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto w-full">
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      }>
        <CategoryPhotoReviewPage />
      </Suspense>
      <div className="pb-20">
        <BottomNavigation />
      </div>
    </div>
  );
}

