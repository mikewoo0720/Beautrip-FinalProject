import HospitalDetailPage from "@/components/HospitalDetailPage";
import { supabase } from "@/lib/supabase";

// 정적 빌드를 위한 generateStaticParams
// output: "export" 모드에서는 모든 hospital_id에 대한 정적 페이지를 생성해야 함
// 페이지네이션으로 모든 ID를 가져옴
export async function generateStaticParams() {
  try {
    const allIds: string[] = [];
    const pageSize = 1000; // Supabase 기본 limit
    let from = 0;
    let hasMore = true;

    console.log("🔄 generateStaticParams: hospital_id 목록 로드 시작...");

    // 페이지네이션으로 모든 hospital_id 가져오기
    while (hasMore) {
      const { data, error } = await supabase
        .from("hospital_master")
        .select("hospital_id")
        .not("hospital_id", "is", null)
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("generateStaticParams 오류:", error);
        // 에러 발생 시: 이미 가져온 데이터가 있으면 첫 번째 값 사용, 없으면 빈 배열
        if (allIds.length > 0) {
          console.log(`⚠️ 에러 발생, 이미 가져온 ${allIds.length}개 ID 반환`);
          break;
        }
        return [];
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      // hospital_id를 문자열로 변환하여 추가
      const ids = data
        .map((item) => String(item.hospital_id || ""))
        .filter((id) => id !== "");
      allIds.push(...ids);

      console.log(
        `📥 hospital_id ${from + 1}~${from + data.length}개 로드 완료 (총 ${allIds.length}개)`
      );

      // 더 가져올 데이터가 있는지 확인
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }

    console.log(
      `✅ generateStaticParams: hospital_id ${allIds.length}개 로드 완료`
    );

    // 데이터가 있으면 반환, 없으면 빈 배열 (빌드는 통과하지만 페이지는 생성 안 됨)
    if (allIds.length === 0) {
      console.warn("⚠️ hospital_id가 없습니다. 빈 배열 반환.");
      return [];
    }

    return allIds.map((id) => ({ id }));
  } catch (error) {
    console.error("generateStaticParams 예외:", error);
    // 예외 발생 시 빈 배열 반환 (빌드는 통과)
    return [];
  }
}

interface HospitalDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function HospitalDetailRoute({
  params,
}: HospitalDetailRouteProps) {
  const { id } = await params;
  const hospitalId = id ? parseInt(id, 10) : 0;

  if (!hospitalId || isNaN(hospitalId)) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto w-full flex items-center justify-center">
        <div className="text-gray-500">잘못된 병원 ID입니다.</div>
      </div>
    );
  }

  return <HospitalDetailPage hospitalId={hospitalId} />;
}

