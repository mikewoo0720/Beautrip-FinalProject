"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiHeart,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiEdit3,
  FiStar,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  loadTreatments,
  getThumbnailUrl,
  Treatment,
} from "@/lib/api/beautripApi";
import CommunityWriteModal from "./CommunityWriteModal";

export default function ProcedureListPage() {
  const router = useRouter();
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [inquiryModalOpen, setInquiryModalOpen] = useState<number | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [hasWrittenReview, setHasWrittenReview] = useState(false);
  const [displayCount, setDisplayCount] = useState(12); // 3x4 = 12개 초기 표시

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryLarge, setCategoryLarge] = useState("");
  const [categoryMid, setCategoryMid] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // 리뷰 작성 여부 확인
  useEffect(() => {
    const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
    setHasWrittenReview(reviews.length > 0);
  }, []);

  // 필터 변경 시 표시 개수 초기화
  useEffect(() => {
    setDisplayCount(12);
  }, [searchTerm, categoryLarge, categoryMid, sortBy]);

  // 카테고리 옵션 생성
  const largeCategories = useMemo(() => {
    const categories = [
      ...new Set(allTreatments.map((t) => t.category_large).filter(Boolean)),
    ];
    return categories.sort() as string[];
  }, [allTreatments]);

  const midCategories = useMemo(() => {
    if (!categoryLarge) return [];
    const categories = [
      ...new Set(
        allTreatments
          .filter((t) => t.category_large === categoryLarge)
          .map((t) => t.category_mid)
          .filter(Boolean)
      ),
    ];
    return categories.sort() as string[];
  }, [allTreatments, categoryLarge]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadTreatments();
        setAllTreatments(data);
        setFilteredTreatments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 찜한 항목 로드
  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const procedureFavorites = savedFavorites
      .filter((f: any) => f.type === "procedure")
      .map((f: any) => f.id);
    setFavorites(new Set(procedureFavorites));
  }, []);

  // 대분류 변경 시 중분류 초기화
  useEffect(() => {
    setCategoryMid("");
  }, [categoryLarge]);

  // 필터 및 정렬 적용
  useEffect(() => {
    let filtered = [...allTreatments];

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (treatment) =>
          treatment.treatment_name?.toLowerCase().includes(term) ||
          treatment.hospital_name?.toLowerCase().includes(term) ||
          treatment.treatment_hashtags?.toLowerCase().includes(term)
      );
    }

    // 카테고리 필터
    if (categoryLarge) {
      filtered = filtered.filter(
        (treatment) => treatment.category_large === categoryLarge
      );
    }

    if (categoryMid) {
      filtered = filtered.filter(
        (treatment) => treatment.category_mid === categoryMid
      );
    }

    // 정렬
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "review") {
      filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    setFilteredTreatments(filtered);
  }, [allTreatments, searchTerm, categoryLarge, categoryMid, sortBy]);

  const handleFavoriteClick = (treatment: Treatment) => {
    if (!treatment.treatment_id) return;

    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const isFavorite = savedFavorites.some(
      (f: any) => f.id === treatment.treatment_id && f.type === "procedure"
    );

    let updated;
    if (isFavorite) {
      updated = savedFavorites.filter(
        (f: any) => !(f.id === treatment.treatment_id && f.type === "procedure")
      );
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
      updated = [...savedFavorites, newFavorite];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.delete(treatment.treatment_id!);
      } else {
        newFavorites.add(treatment.treatment_id!);
      }
      return newFavorites;
    });

    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleInquiryClick = (treatmentId: number) => {
    setInquiryModalOpen(inquiryModalOpen === treatmentId ? null : treatmentId);
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

  if (error) {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="text-center py-12">
          <p className="text-lg text-gray-700 mb-2">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-main text-white rounded-lg font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 3x4 = 12개 초기 표시, 더보기로 3행씩 추가 (12개씩)
  const displayTreatments = filteredTreatments.slice(0, displayCount);
  const remainingCount = filteredTreatments.length - displayCount;
  const hasMore = remainingCount > 0;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredTreatments.length));
  };

  return (
    <div className="bg-white">
      {/* 필터 섹션 */}
      <div className="sticky top-[156px] z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="시술명 / 병원명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
          />
          <div className="flex gap-2">
            <select
              value={categoryLarge}
              onChange={(e) => setCategoryLarge(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="">전체 카테고리</option>
              {largeCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={categoryMid}
              onChange={(e) => setCategoryMid(e.target.value)}
              disabled={!categoryLarge}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">중분류</option>
              {midCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="default">정렬</option>
              <option value="price-low">가격 낮은순</option>
              <option value="price-high">가격 높은순</option>
              <option value="rating">평점 높은순</option>
              <option value="review">리뷰 많은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 시술 목록 */}
      <div className="px-4 py-6">
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              총 {filteredTreatments.length}개의 시술
            </div>

            {/* 그리드 레이아웃 (3열 4행) - 상세 정보 포함 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {displayTreatments.map((treatment) => {
                const treatmentId = treatment.treatment_id || 0;
                const isFavorite = favorites.has(treatmentId);
                const thumbnailUrl = getThumbnailUrl(treatment);
                const fallbackUrl = getThumbnailUrl({
                  category_large: treatment.category_large,
                });
                const sellingPrice = treatment.selling_price
                  ? `${Math.round(treatment.selling_price / 10000)}만원`
                  : "가격 문의";
                const discountRate = treatment.dis_rate
                  ? `${treatment.dis_rate}%`
                  : "";
                const rating = treatment.rating || 0;
                const reviewCount = treatment.review_count || 0;
                const location = "서울"; // 데이터에 위치 값이 없어 기본값 처리

                return (
                  <div
                    key={treatmentId}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                    onClick={() => {
                      // TODO: 시술 PDP 페이지로 이동
                    }}
                  >
                    {/* 썸네일 - 1:1 비율 */}
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={treatment.treatment_name || "시술 이미지"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackUrl;
                        }}
                      />
                      {discountRate && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
                          {discountRate}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteClick(treatment);
                        }}
                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm hover:bg-white transition-colors"
                      >
                        <FiHeart
                          className={`text-xs ${
                            isFavorite
                              ? "text-red-500 fill-red-500"
                              : "text-gray-700"
                          }`}
                        />
                      </button>
                      {/* 번역 뱃지 (예시) */}
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold">
                        통역
                      </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="p-2">
                      {/* 병원명 */}
                      <p className="text-[10px] text-gray-500 mb-0.5 line-clamp-1">
                        {treatment.hospital_name} · {location}
                      </p>
                      {/* 시술명 */}
                      <h5 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[28px]">
                        {treatment.treatment_name}
                      </h5>
                      {/* 가격 */}
                      <div className="mb-1">
                        <span className="text-sm font-bold text-primary-main">
                          {sellingPrice}
                        </span>
                        {treatment.vat_info && (
                          <span className="text-[9px] text-gray-500 ml-0.5">
                            {treatment.vat_info}
                          </span>
                        )}
                      </div>
                      {/* 평점 */}
                      {rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <FiStar className="text-yellow-400 fill-yellow-400 text-[9px]" />
                          <span className="text-[10px] font-semibold text-gray-700">
                            {rating.toFixed(1)}
                          </span>
                          {reviewCount > 0 && (
                            <span className="text-[9px] text-gray-400">
                              ({reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  더보기
                </button>
              </div>
            )}

            {/* 글 작성 유도 섹션 (리뷰 미작성 시에만 표시) */}
            {!hasWrittenReview && displayCount >= 12 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-primary-main/30 text-center">
                <FiEdit3 className="text-primary-main text-2xl mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  리뷰를 작성하면
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  더 많은 시술 정보를 볼 수 있어요!
                </p>
                <button
                  onClick={() => setIsWriteModalOpen(true)}
                  className="bg-primary-main hover:bg-[#2DB8A0] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  리뷰 작성하기
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 커뮤니티 글쓰기 모달 */}
      <CommunityWriteModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          // 리뷰 작성 후 상태 업데이트
          const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
          setHasWrittenReview(reviews.length > 0);
        }}
      />
    </div>
  );
}
