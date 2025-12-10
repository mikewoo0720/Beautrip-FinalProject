"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { FiTrendingUp, FiHeart, FiStar } from "react-icons/fi";
import { 
  loadTreatments, 
  getThumbnailUrl,
  calculateRecommendationScore,
  type Treatment
} from "@/lib/api/beautripApi";

export default function HotConcernsSection() {
  const router = useRouter();
  const { t } = useLanguage();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const allTreatments = await loadTreatments();
        
        // 추천 점수로 정렬하고 랜덤으로 10개 선택
        const sortedTreatments = allTreatments
          .map((treatment) => ({
            ...treatment,
            recommendationScore: calculateRecommendationScore(treatment),
          }))
          .sort((a, b) => b.recommendationScore - a.recommendationScore);
        
        // 상위 50개 중에서 랜덤으로 10개 선택
        const top50 = sortedTreatments.slice(0, 50);
        const shuffled = [...top50].sort(() => Math.random() - 0.5);
        const random10 = shuffled.slice(0, 10);
        
        setTreatments(random10);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const procedureFavorites = savedFavorites
      .filter((f: any) => f.type === "procedure")
      .map((f: any) => f.id);
    setFavorites(new Set(procedureFavorites));
  }, []);

  const handleFavoriteClick = (treatment: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!treatment.treatment_id) return;

    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(treatment.treatment_id!)) {
        newSet.delete(treatment.treatment_id!);
      } else {
        newSet.add(treatment.treatment_id!);
      }

      // 로컬 스토리지에 저장
      const savedFavorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      const updatedFavorites = Array.from(newSet).map((id) => ({
        id,
        type: "procedure",
      }));
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-primary-main" />
          <h3 className="text-lg font-bold text-gray-900">{t("home.hotConcerns")}</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[150px] bg-gray-100 rounded-xl animate-pulse"
              style={{ height: "200px" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-primary-main" />
        <h3 className="text-lg font-bold text-gray-900">{t("home.hotConcerns")}</h3>
      </div>

      {/* 카드 슬라이드 */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {treatments.map((treatment) => {
          const isFavorite = favorites.has(treatment.treatment_id || 0);
          const thumbnailUrl = getThumbnailUrl(treatment);
          const price = treatment.selling_price
            ? `${Math.round(treatment.selling_price / 10000)}만원`
            : "가격 문의";
          const rating = treatment.rating || 0;
          const reviewCount = treatment.review_count || 0;
          const discountRate = treatment.dis_rate ? `${treatment.dis_rate}%` : "";

          return (
            <div
              key={treatment.treatment_id}
              className="flex-shrink-0 w-[150px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (treatment.treatment_id) {
                  router.push(`/treatment/${treatment.treatment_id}`);
                }
              }}
            >
              {/* 이미지 - 1:1 비율 */}
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt={treatment.treatment_name || "시술 이미지"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x300/667eea/ffffff?text=🏥";
                  }}
                />
                {/* 할인율 배지 */}
                {discountRate && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    {discountRate}
                  </div>
                )}
                {/* 찜 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(treatment, e);
                  }}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors shadow-sm z-10"
                >
                  <FiHeart
                    className={`text-sm ${
                      isFavorite
                        ? "text-red-500 fill-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>

              {/* 카드 내용 */}
              <div className="p-3">
                {/* 병원명 */}
                {treatment.hospital_name && (
                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {treatment.hospital_name}
                  </p>
                )}

                {/* 시술명 */}
                <h4 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 min-h-[2.5rem]">
                  {treatment.treatment_name}
                </h4>

                {/* 평점 */}
                {rating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
                    <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-xs text-gray-400">
                        ({reviewCount.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}

                {/* 가격 */}
                <p className="text-sm font-bold text-primary-main">
                  {price}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
