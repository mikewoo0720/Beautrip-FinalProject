"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";

// 홈페이지와 동일한 대분류 카테고리 10개
const MAIN_CATEGORIES = [
  { id: "eyes", name: "눈성형", icon: "👀" },
  { id: "lifting", name: "리프팅", icon: "✨" },
  { id: "botox", name: "보톡스", icon: "💉" },
  { id: "facial", name: "안면윤곽/양악", icon: "😊" },
  { id: "hair-removal", name: "제모", icon: "💫" },
  { id: "body", name: "지방성형", icon: "🏃" },
  { id: "nose", name: "코성형", icon: "👃" },
  { id: "skin", name: "피부", icon: "🌟" },
  { id: "filler", name: "필러", icon: "💎" },
  { id: "breast", name: "가슴성형", icon: "💕" },
];

export default function CategoryCommunityPage() {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/community/posts?category=${categoryId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          카테고리별 게시글
        </h2>
        <p className="text-sm text-gray-500">
          관심 있는 카테고리를 선택하여 게시글을 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MAIN_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-primary-main hover:shadow-md transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-4xl">{category.icon}</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900 group-hover:text-primary-main transition-colors">
                  {category.name}
                </span>
                <FiChevronRight className="text-gray-400 group-hover:text-primary-main transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

