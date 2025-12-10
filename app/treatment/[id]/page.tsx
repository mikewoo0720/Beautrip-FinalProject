"use client";

import { useParams } from "next/navigation";
import TreatmentDetailPage from "@/components/TreatmentDetailPage";

export default function TreatmentDetailRoute() {
  const params = useParams();
  const treatmentId = params.id ? parseInt(params.id as string, 10) : 0;

  if (!treatmentId || isNaN(treatmentId)) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto w-full flex items-center justify-center">
        <div className="text-gray-500">잘못된 시술 ID입니다.</div>
      </div>
    );
  }

  return <TreatmentDetailPage treatmentId={treatmentId} />;
}

