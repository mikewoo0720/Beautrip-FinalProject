"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  loadTreatmentsPaginated,
  getThumbnailUrl,
  Treatment,
} from "@/lib/api/beautripApi";

// 홈페이지와 동일한 대분류 카테고리 10개
const MAIN_CATEGORIES = [
  { id: null, name: "전체" },
  { id: "눈성형", name: "눈성형" },
  { id: "리프팅", name: "리프팅" },
  { id: "보톡스", name: "보톡스" },
  { id: "안면윤곽/양악", name: "안면윤곽/양악" },
  { id: "제모", name: "제모" },
  { id: "지방성형", name: "지방성형" },
  { id: "코성형", name: "코성형" },
  { id: "피부", name: "피부" },
  { id: "필러", name: "필러" },
  { id: "가슴성형", name: "가슴성형" },
];

export default function CategoryRankingPage() {
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = 전체
  const [selectedMidCategory, setSelectedMidCategory] = useState<string | null>(null); // 선택된 중분류
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(5); // 초기 5개 표시
  const [visibleTreatmentsCount, setVisibleTreatmentsCount] = useState(20); // 중분류 선택 시 표시할 시술 개수

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 필요한 만큼만 로드 (300개 - 카테고리별 랭킹에 충분)
        // 랭킹 페이지는 플랫폼 우선순위 정렬 없이 원본 데이터 순서로 로드
        const result = await loadTreatmentsPaginated(1, 300, { skipPlatformSort: true });
        const data = result.data;
        setTreatments(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // 선택된 대분류에 속한 중분류 목록 추출
  const midCategories = useMemo(() => {
    if (selectedCategory === null) {
      // 전체 선택 시 모든 중분류 표시
      const midCategorySet = new Set<string>();
      treatments.forEach((t) => {
        if (t.category_mid) {
          midCategorySet.add(t.category_mid);
        }
      });
      return Array.from(midCategorySet).sort();
    }

    // 선택된 대분류에 속한 중분류만 필터링
    const midCategorySet = new Set<string>();
    treatments.forEach((t) => {
      const categoryLarge = t.category_large || "";
      if (
        categoryLarge.includes(selectedCategory) ||
        selectedCategory.includes(categoryLarge)
      ) {
        if (t.category_mid) {
          midCategorySet.add(t.category_mid);
        }
      }
    });
    return Array.from(midCategorySet).sort();
  }, [treatments, selectedCategory]);

  // 중분류 선택 시 해당 중분류의 소분류(시술) 랭킹 생성
  const treatmentRankings = useMemo(() => {
    if (selectedMidCategory === null) {
      return [];
    }

    let filtered = treatments;

    // 대분류 필터링
    if (selectedCategory !== null) {
      filtered = filtered.filter((t) => {
        const categoryLarge = t.category_large || "";
        return (
          categoryLarge.includes(selectedCategory) ||
          selectedCategory.includes(categoryLarge)
        );
      });
    }

    // 중분류 필터링
    filtered = filtered.filter((t) => {
      const categoryMid = t.category_mid || "";
      return (
        categoryMid === selectedMidCategory ||
        categoryMid.includes(selectedMidCategory) ||
        selectedMidCategory.includes(categoryMid)
      );
    });

    // 평점, 리뷰 수, 시술 개수를 종합한 정렬
    // 같은 시술명의 개수를 카운트하여 인기도 반영
    const treatmentNameCount = new Map<string, number>();
    filtered.forEach((t) => {
      const name = t.treatment_name || "";
      treatmentNameCount.set(name, (treatmentNameCount.get(name) || 0) + 1);
    });
    
    const sorted = [...filtered].sort((a, b) => {
      // 평점 점수 (50%)
      const ratingScoreA = (a.rating || 0) * 0.5;
      const ratingScoreB = (b.rating || 0) * 0.5;
      
      // 리뷰 수 점수 (30%, 로그 스케일)
      const reviewScoreA = Math.log10((a.review_count || 0) + 1) * 3;
      const reviewScoreB = Math.log10((b.review_count || 0) + 1) * 3;
      
      // 시술 개수 점수 (20%, 같은 시술명이 많을수록 인기)
      const nameA = a.treatment_name || "";
      const nameB = b.treatment_name || "";
      const countA = treatmentNameCount.get(nameA) || 0;
      const countB = treatmentNameCount.get(nameB) || 0;
      const countScoreA = Math.log10(countA + 1) * 2;
      const countScoreB = Math.log10(countB + 1) * 2;
      
      const scoreA = ratingScoreA + reviewScoreA + countScoreA;
      const scoreB = ratingScoreB + reviewScoreB + countScoreB;
      
      return scoreB - scoreA;
    });

    return sorted;
  }, [treatments, selectedCategory, selectedMidCategory]);

  // 중분류별로 그룹화된 랭킹 생성 (중분류 미선택 시)
  const midCategoryRankings = useMemo(() => {
    if (selectedMidCategory !== null) {
      return []; // 중분류 선택 시 중분류 랭킹은 표시하지 않음
    }

    let filtered = treatments;
    if (selectedCategory !== null) {
      // 선택된 카테고리로 필터링
      filtered = treatments.filter((t) => {
        const categoryLarge = t.category_large || "";
        const categoryMid = t.category_mid || "";
        
        // 대분류 카테고리 매칭
        const matchesLarge = categoryLarge.includes(selectedCategory) || 
                            selectedCategory.includes(categoryLarge);
        
        // 중분류 카테고리 매칭
        const matchesMid = categoryMid.includes(selectedCategory) || 
                          selectedCategory.includes(categoryMid);
        
        // 시술명에도 카테고리 키워드가 포함되어 있는지 확인
        const nameMatch = t.treatment_name
          ?.toLowerCase()
          .includes(selectedCategory.toLowerCase());
        
        return matchesLarge || matchesMid || nameMatch;
      });
    }

    // 중분류별로 그룹화
    const midCategoryMap = new Map<string, Treatment[]>();
    filtered.forEach((treatment) => {
      const midCategory = treatment.category_mid || "기타";
      if (!midCategoryMap.has(midCategory)) {
        midCategoryMap.set(midCategory, []);
      }
      midCategoryMap.get(midCategory)!.push(treatment);
    });

    // 각 중분류별로 시술들을 평점/리뷰순으로 정렬하고 랭킹 생성
    const rankings: Array<{
      categoryMid: string;
      treatments: Treatment[];
      averageRating: number;
      totalReviews: number;
    }> = [];

    midCategoryMap.forEach((treatmentList, midCategory) => {
      // 평점과 리뷰 수 기준으로 정렬
      const sorted = [...treatmentList].sort((a, b) => {
        const scoreA = (a.rating || 0) * 0.7 + (a.review_count || 0) * 0.3;
        const scoreB = (b.rating || 0) * 0.7 + (b.review_count || 0) * 0.3;
        return scoreB - scoreA;
      });

      const averageRating =
        sorted.reduce((sum, t) => sum + (t.rating || 0), 0) / sorted.length || 0;
      const totalReviews = sorted.reduce(
        (sum, t) => sum + (t.review_count || 0),
        0
      );

      rankings.push({
        categoryMid: midCategory,
        treatments: sorted,
        averageRating,
        totalReviews,
      });
    });

    // 평균 평점, 리뷰 수, 시술 개수를 종합한 랭킹 정렬
    // 가중치: 평점 50%, 리뷰 수 30%, 시술 개수 20%
    rankings.sort((a, b) => {
      const treatmentCountA = a.treatments.length;
      const treatmentCountB = b.treatments.length;
      
      // 시술 개수 점수 (로그 스케일 사용, 최대 20점)
      const countScoreA = Math.log10(treatmentCountA + 1) * 5;
      const countScoreB = Math.log10(treatmentCountB + 1) * 5;
      
      // 종합 점수 계산
      const scoreA = a.averageRating * 0.5 + (a.totalReviews / 100) * 0.3 + countScoreA * 0.2;
      const scoreB = b.averageRating * 0.5 + (b.totalReviews / 100) * 0.3 + countScoreB * 0.2;
      
      return scoreB - scoreA;
    });

    return rankings;
  }, [treatments, selectedCategory, selectedMidCategory]);

  // 스크롤 관련 상태
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrollPositions, setScrollPositions] = useState<
    Record<string, { left: number; canScrollLeft: boolean; canScrollRight: boolean }>
  >({});

  // 스크롤 위치 확인
  const handleScroll = (categoryMid: string) => {
    const element = scrollRefs.current[categoryMid];
    if (element) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setScrollPositions((prev) => ({
        ...prev,
        [categoryMid]: {
          left: scrollLeft,
          canScrollLeft: scrollLeft > 0,
          canScrollRight: scrollLeft < scrollWidth - clientWidth - 10,
        },
      }));
    }
  };

  // 스크롤 위치 초기화
  useEffect(() => {
    midCategoryRankings.forEach((ranking) => {
      const timer = setTimeout(() => {
        handleScroll(ranking.categoryMid);
      }, 200);
      return () => clearTimeout(timer);
    });
  }, [midCategoryRankings]);

  const handleFavoriteClick = (treatment: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!treatment.treatment_id) return;

    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const isFavorite = favorites.has(treatment.treatment_id);

    if (isFavorite) {
      const updated = savedFavorites.filter(
        (f: any) => !(f.id === treatment.treatment_id && f.type === "procedure")
      );
      localStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(treatment.treatment_id!);
        return newSet;
      });
    } else {
      const newFavorite = {
        id: treatment.treatment_id,
        title: treatment.treatment_name,
        clinic: treatment.hospital_name,
        price: treatment.selling_price,
        rating: treatment.rating,
        reviewCount: treatment.review_count,
        type: "procedure" as const,
      };
      localStorage.setItem(
        "favorites",
        JSON.stringify([...savedFavorites, newFavorite])
      );
      setFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.add(treatment.treatment_id!);
        return newSet;
      });
    }
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 중분류별 설명 텍스트 매핑
  const getCategoryDescription = (categoryMid: string): string => {
    const descriptions: Record<string, string> = {
      "주름보톡스": "주름이 많은 부위에 주사하여 톡! 하고 주름을 펴주고 주름 예방 효과도 기대할 수 있어요.",
      "백옥주사": "글루타치온 성분이 피부를 밝게 해주며, 항산화 작용을 동반하여 노화 방지에도 효과적이에요.",
      "리프팅": "피부 탄력을 개선하고 처진 피부를 리프팅하여 더욱 젊어 보이게 해줍니다.",
      "필러": "볼륨을 채워주고 윤곽을 개선하여 자연스러운 미모를 연출합니다.",
      "보톡스": "근육을 이완시켜 주름을 예방하고 개선하는 효과가 있습니다.",
    };
    return descriptions[categoryMid] || `${categoryMid} 시술로 피부와 외모를 개선할 수 있어요.`;
  };

  return (
    <div className="bg-white">
      {/* Category Filter Tags - 가로 스크롤 */}
      <div className="sticky top-[156px] z-20 bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {MAIN_CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id || "all"}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedMidCategory(null); // 카테고리 변경 시 중분류 초기화
                  }}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? "text-primary-main font-bold"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 중분류 해시태그 필터 */}
        {midCategories.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedMidCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedMidCategory === null
                    ? "bg-gray-900 text-white border border-gray-900"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                전체
              </button>
              {midCategories.map((midCategory) => {
                const isSelected = selectedMidCategory === midCategory;
                return (
                  <button
                    key={midCategory}
                    onClick={() => {
                      setSelectedMidCategory(midCategory);
                      setVisibleTreatmentsCount(20); // 중분류 선택 시 초기화
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white border border-gray-900"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    #{midCategory}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 컨텐츠 섹션 */}
      <div className="px-4 py-6 space-y-6">
        {/* 중분류 선택 시: 소분류(시술) 랭킹 표시 */}
        {selectedMidCategory !== null ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  #{selectedMidCategory}
                </h3>
                <p className="text-sm text-gray-600">
                  총 {treatmentRankings.length}개의 시술
                </p>
              </div>
              <button
                onClick={() => setSelectedMidCategory(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                전체 보기
              </button>
            </div>

            {treatmentRankings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">
                  "{selectedMidCategory}" 카테고리의 시술 데이터가 없습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {treatmentRankings
                  .slice(0, visibleTreatmentsCount)
                  .map((treatment, index) => {
                    const treatmentId = treatment.treatment_id || 0;
                    const isFavorited = favorites.has(treatmentId);
                    const thumbnailUrl = getThumbnailUrl(treatment);
                    const price = treatment.selling_price
                      ? `${Math.round(treatment.selling_price / 10000)}만원`
                      : "가격 문의";

                    return (
                      <div
                        key={treatmentId}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          router.push(`/treatment/${treatmentId}`);
                        }}
                      >
                        {/* 이미지 - 2:1 비율 */}
                        <div className="relative w-full aspect-[2/1] bg-gray-100 overflow-hidden">
                          <img
                            src={thumbnailUrl}
                            alt={treatment.treatment_name}
                            className="w-full h-full object-cover"
                          />
                          {treatment.dis_rate && treatment.dis_rate > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {treatment.dis_rate}%
                            </div>
                          )}
                          <button
                            onClick={(e) => handleFavoriteClick(treatment, e)}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors shadow-sm"
                          >
                            <FiHeart
                              className={`text-sm ${
                                isFavorited
                                  ? "text-red-500 fill-red-500"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                        </div>

                        {/* 카드 내용 */}
                        <div className="p-3 space-y-1.5">
                          <h5 className="font-bold text-gray-900 text-sm line-clamp-2">
                            {treatment.treatment_name}
                          </h5>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-primary-main">
                              {price}
                            </span>
                            {treatment.vat_info && (
                              <span className="text-[10px] text-gray-500">
                                {treatment.vat_info}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 line-clamp-1">
                            {treatment.hospital_name || "병원명 없음"}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiHeart
                                className={`text-[12px] ${
                                  isFavorited
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-500"
                                }`}
                              />
                              <span>{treatment.review_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiStar className="text-yellow-400 fill-yellow-400 text-[11px]" />
                              <span className="font-semibold">
                                {treatment.rating
                                  ? treatment.rating.toFixed(1)
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* 더보기 버튼 - 시술 목록 */}
            {treatmentRankings.length > visibleTreatmentsCount && (
              <div className="text-center pt-4">
                <button
                  onClick={() =>
                    setVisibleTreatmentsCount((prev) => prev + 20)
                  }
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  더보기 ({treatmentRankings.length - visibleTreatmentsCount}개
                  더)
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 중분류 미선택 시: 중분류별 랭킹 표시 */
          midCategoryRankings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">
                {selectedCategory === null
                  ? "랭킹 데이터가 없습니다."
                  : `"${
                      MAIN_CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.name || selectedCategory
                    }" 카테고리의 랭킹 데이터가 없습니다.`}
              </p>
              <p className="text-sm text-gray-500">
                다른 카테고리를 선택해보세요.
              </p>
            </div>
          ) : (
            <>
              {midCategoryRankings.slice(0, visibleCategoriesCount).map((ranking, index) => {
            const rank = index + 1;
            const scrollState = scrollPositions[ranking.categoryMid] || {
              left: 0,
              canScrollLeft: false,
              canScrollRight: true,
            };

            const handleScrollLeft = () => {
              const element = scrollRefs.current[ranking.categoryMid];
              if (element) {
                element.scrollBy({ left: -300, behavior: "smooth" });
              }
            };

            const handleScrollRight = () => {
              const element = scrollRefs.current[ranking.categoryMid];
              if (element) {
                element.scrollBy({ left: 300, behavior: "smooth" });
              }
            };

            return (
              <div key={ranking.categoryMid} className="space-y-4">
                {/* 중분류 헤더 with 순위 */}
                <div className="flex items-start gap-4">
                  <span className="text-primary-main text-4xl font-bold leading-none">
                    {rank}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {ranking.categoryMid}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                      {getCategoryDescription(ranking.categoryMid)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-400 fill-yellow-400 text-sm" />
                        <span className="text-sm font-semibold text-gray-900">
                          {ranking.averageRating > 0
                            ? ranking.averageRating.toFixed(1)
                            : "-"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        리뷰 {ranking.totalReviews.toLocaleString()}개
                      </span>
                    </div>
                  </div>
                </div>

                {/* 카드 스크롤 컨테이너 */}
                <div className="relative">
                  {/* 좌측 스크롤 버튼 */}
                  {scrollState.canScrollLeft && (
                    <button
                      onClick={handleScrollLeft}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
                    >
                      <FiChevronLeft className="text-gray-700 text-lg" />
                    </button>
                  )}

                  {/* 카드 스크롤 영역 */}
                  <div
                    ref={(el) => {
                      scrollRefs.current[ranking.categoryMid] = el;
                    }}
                    className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
                    onScroll={() => handleScroll(ranking.categoryMid)}
                  >
                    {ranking.treatments.map((treatment) => {
                      const treatmentId = treatment.treatment_id || 0;
                      const isFavorited = favorites.has(treatmentId);
                      const thumbnailUrl = getThumbnailUrl(treatment);
                      const price = treatment.selling_price
                        ? `${Math.round(treatment.selling_price / 10000)}만원`
                        : "가격 문의";

                      return (
                        <div
                          key={treatmentId}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-[160px] cursor-pointer"
                          onClick={() => {
                            router.push(`/treatment/${treatmentId}`);
                          }}
                        >
                          {/* 이미지 - 2:1 비율 */}
                          <div className="relative w-full aspect-[2/1] bg-gray-100 overflow-hidden">
                            <img
                              src={thumbnailUrl}
                              alt={treatment.treatment_name}
                              className="w-full h-full object-cover"
                            />
                            {/* 할인율 배지 */}
                            {treatment.dis_rate &&
                              treatment.dis_rate > 0 && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {treatment.dis_rate}%
                                </div>
                              )}
                            {/* 통역 가능 뱃지 (예시) */}
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold">
                              통역
                            </div>
                            {/* 찜 버튼 */}
                            <button
                              onClick={(e) =>
                                handleFavoriteClick(treatment, e)
                              }
                              className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-colors shadow-sm"
                            >
                              <FiHeart
                                className={`text-base ${
                                  isFavorited
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-600"
                                }`}
                              />
                            </button>
                          </div>

                          {/* 카드 내용 */}
                          <div className="p-3 space-y-1.5">
                            {/* 시술명 */}
                            <h5 className="font-bold text-gray-900 text-sm line-clamp-2">
                              {treatment.treatment_name}
                            </h5>

                            {/* 가격 / 부가세 */}
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-primary-main">
                                {price}
                              </span>
                              {treatment.vat_info && (
                                <span className="text-[10px] text-gray-500">
                                  {treatment.vat_info}
                                </span>
                              )}
                            </div>

                            {/* 병원명 / 위치(예시) */}
                            <p className="text-[11px] text-gray-600 line-clamp-1">
                              {treatment.hospital_name || "병원명 없음"} · 서울
                            </p>

                            {/* 찜/평점/리뷰 */}
                            <div className="flex items-center justify-between text-[11px] text-gray-600">
                              <div className="flex items-center gap-1">
                                <FiHeart
                                  className={`text-[13px] ${
                                    isFavorited
                                      ? "text-red-500 fill-red-500"
                                      : "text-gray-500"
                                  }`}
                                />
                                <span>{treatment.review_count || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FiStar className="text-yellow-400 fill-yellow-400 text-[12px]" />
                                <span className="font-semibold">
                                  {treatment.rating
                                    ? treatment.rating.toFixed(1)
                                    : "-"}
                                </span>
                                {treatment.review_count !== undefined && (
                                  <span className="text-[10px] text-gray-400">
                                    ({treatment.review_count || 0})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 우측 스크롤 버튼 */}
                  {scrollState.canScrollRight && (
                    <button
                      onClick={handleScrollRight}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
                    >
                      <FiChevronRight className="text-gray-700 text-lg" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

            {/* 더보기 버튼 - 중분류 카테고리 */}
            {midCategoryRankings.length > visibleCategoriesCount && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCategoriesCount((prev) => prev + 5)}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  더보기
                </button>
              </div>
            )}
            </>
          )
        )}
      </div>
    </div>
  );
}
