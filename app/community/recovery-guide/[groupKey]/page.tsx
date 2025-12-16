"use client";

import { useParams } from "next/navigation";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import RecoveryGuideDetailPage from "@/components/RecoveryGuideDetailPage";
import RecoveryGuidePostDetailPage from "@/components/RecoveryGuidePostDetailPage";
import { RecoveryGroupKey } from "@/lib/content/recoveryGuideContent";
import { findRecoveryGuideById } from "@/lib/content/recoveryGuidePosts";

export default function RecoveryGuideDetailRoute() {
  const params = useParams();
  const param = params.groupKey as string;

  const validGroupKeys: RecoveryGroupKey[] = [
    "jaw",
    "breast",
    "body",
    "upperFace",
    "nose",
    "eyeSurgery",
    "eyeVolume",
    "faceFat",
    "lifting",
    "procedures",
  ];

  // 먼저 19개 회복 가이드 글(post)인지 확인
  const recoveryPost = findRecoveryGuideById(param);
  if (recoveryPost) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto w-full">
        <Header />
        <RecoveryGuidePostDetailPage postId={param} />
        <BottomNavigation />
      </div>
    );
  }

  // 그 다음 10개 그룹(groupKey)인지 확인
  const groupKey = param as RecoveryGroupKey;
  if (groupKey && validGroupKeys.includes(groupKey)) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto w-full">
        <Header />
        <RecoveryGuideDetailPage groupKey={groupKey} />
        <BottomNavigation />
      </div>
    );
  }

  // 둘 다 아니면 에러
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto w-full">
      <Header />
      <div className="px-4 py-8 text-center text-gray-500">
        잘못된 회복 가이드입니다.
      </div>
      <BottomNavigation />
    </div>
  );
}
