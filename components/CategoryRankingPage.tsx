"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  loadTreatments,
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
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(5); // 초기 5개 표시

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadTreatments();
        setTreatments(data);

        // 리뷰 수 통계 확인
        const withReviews = data.filter(t => t.review_count && t.review_count > 0);
        const reviewCounts = data.map(t => t.review_count || 0);
        const totalReviews = reviewCounts.reduce((sum, count) => sum + count, 0);
        const avgReviews = reviewCounts.length > 0 ? totalReviews / reviewCounts.length : 0;
        const maxReviews = Math.max(...reviewCounts);
        const minReviews = Math.min(...reviewCounts.filter(c => c > 0));

        console.log("📊 리뷰 수 통계:");
        console.log(`- 전체 시술 수: ${data.length}개`);
        console.log(`- 리뷰가 있는 시술: ${withReviews.length}개 (${(withReviews.length / data.length * 100).toFixed(1)}%)`);
        console.log(`- 총 리뷰 수: ${totalReviews.toLocaleString()}개`);
        console.log(`- 평균 리뷰 수: ${avgReviews.toFixed(1)}개`);
        console.log(`- 최대 리뷰 수: ${maxReviews.toLocaleString()}개`);
        console.log(`- 최소 리뷰 수: ${minReviews > 0 ? minReviews : '없음'}`);
        console.log(`- 리뷰 수 분포:`);
        const distribution = {
          "0개": data.filter(t => !t.review_count || t.review_count === 0).length,
          "1~10개": data.filter(t => t.review_count && t.review_count >= 1 && t.review_count <= 10).length,
          "11~50개": data.filter(t => t.review_count && t.review_count >= 11 && t.review_count <= 50).length,
          "51~100개": data.filter(t => t.review_count && t.review_count >= 51 && t.review_count <= 100).length,
          "101~500개": data.filter(t => t.review_count && t.review_count >= 101 && t.review_count <= 500).length,
          "500개 이상": data.filter(t => t.review_count && t.review_count > 500).length,
        };
        Object.entries(distribution).forEach(([range, count]) => {
          console.log(`  ${range}: ${count}개 (${(count / data.length * 100).toFixed(1)}%)`);
        });

        // 데이터 로드 완료 (카테고리는 MAIN_CATEGORIES 사용)
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

  // 해시태그 목록 추출
  const hashtags = useMemo(() => {
    const hashtagSet = new Set<string>();
    treatments.forEach((t) => {
      if (t.treatment_hashtags) {
        const tags = t.treatment_hashtags.split(/[,\s#]+/).filter(Boolean);
        tags.forEach((tag) => hashtagSet.add(tag.trim()));
      }
    });
    return Array.from(hashtagSet).sort().slice(0, 20); // 상위 20개만
  }, [treatments]);

  // 중분류별로 그룹화된 랭킹 생성
  const midCategoryRankings = useMemo(() => {
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

    // 해시태그 필터링
    if (selectedHashtag) {
      filtered = filtered.filter((t) => {
        const hashtags = (t.treatment_hashtags || "").toLowerCase();
        return hashtags.includes(selectedHashtag.toLowerCase());
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

    // 평균 평점과 리뷰 수 기준으로 중분류 랭킹 정렬
    rankings.sort((a, b) => {
      const scoreA = a.averageRating * 0.7 + a.totalReviews * 0.3;
      const scoreB = b.averageRating * 0.7 + b.totalReviews * 0.3;
      return scoreB - scoreA;
    });

    return rankings;
  }, [treatments, selectedCategory]);

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
                    setSelectedHashtag(null); // 카테고리 변경 시 해시태그 초기화
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

        {/* 해시태그 필터 */}
        {hashtags.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedHashtag(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedHashtag === null
                    ? "bg-gray-900 text-white border border-gray-900"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                }`}
              >
                전체
              </button>
              {hashtags.map((hashtag) => {
                const isSelected = selectedHashtag === hashtag;
                return (
                  <button
                    key={hashtag}
                    onClick={() => setSelectedHashtag(hashtag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white border border-gray-900"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    #{hashtag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 중분류별 랭킹 섹션 */}
      <div className="px-4 py-6 space-y-6">
        {midCategoryRankings.length === 0 ? (
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
          midCategoryRankings.slice(0, visibleCategoriesCount).map((ranking, index) => {
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
                          {/* 이미지 - 1:1 비율 */}
                          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
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
          })
        )}

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
      </div>
    </div>
  );
}
