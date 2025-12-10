"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FiHeart,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiGlobe,
  FiMessageCircle,
  FiEdit3,
} from "react-icons/fi";
import {
  loadTreatments,
  extractHospitalInfo,
  HospitalInfo,
  getThumbnailUrl,
} from "@/lib/api/beautripApi";
import CommunityWriteModal from "./CommunityWriteModal";

export default function HospitalInfoPage() {
  const [allTreatments, setAllTreatments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<HospitalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [inquiryModalOpen, setInquiryModalOpen] = useState<string | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [hasWrittenReview, setHasWrittenReview] = useState(false);
  const [displayCount, setDisplayCount] = useState(12); // 3x4 = 12개 초기 표시

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // 리뷰 작성 여부 확인
  useEffect(() => {
    const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
    setHasWrittenReview(reviews.length > 0);
  }, []);

  // 필터 변경 시 표시 개수 초기화
  useEffect(() => {
    setDisplayCount(12);
  }, [searchTerm, filterCategory]);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadTreatments();
        setAllTreatments(data);
        const hospitalData = extractHospitalInfo(data);
        setHospitals(hospitalData);
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

  // 카테고리 목록
  const categories = useMemo(() => {
    const cats = new Set<string>();
    hospitals.forEach((hospital) => {
      hospital.categories.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [hospitals]);

  // 필터링된 병원 목록
  const filteredHospitals = useMemo(() => {
    let filtered = [...hospitals];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (hospital) =>
          hospital.hospital_name.toLowerCase().includes(term) ||
          hospital.procedures.some((proc) => proc.toLowerCase().includes(term))
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((hospital) =>
        hospital.categories.includes(filterCategory)
      );
    }

    return filtered;
  }, [hospitals, searchTerm, filterCategory]);

  // 3x4 = 12개 초기 표시, 더보기로 3행씩 추가 (12개씩)
  const displayHospitals = filteredHospitals.slice(0, displayCount);
  const remainingCount = filteredHospitals.length - displayCount;
  const hasMore = remainingCount > 0;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 12, filteredHospitals.length));
  };

  // localStorage에서 찜한 병원 목록 불러오기
  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const clinicFavorites = savedFavorites
      .filter((f: any) => f.type === "clinic")
      .map((f: any) => f.name || f.title || f.clinic);
    setFavorites(new Set(clinicFavorites));
  }, []);

  const handleFavoriteClick = (hospital: HospitalInfo) => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const isFavorite = savedFavorites.some(
      (f: any) =>
        (f.name === hospital.hospital_name ||
          f.title === hospital.hospital_name ||
          f.clinic === hospital.hospital_name) &&
        f.type === "clinic"
    );

    let updated;
    if (isFavorite) {
      updated = savedFavorites.filter(
        (f: any) =>
          !(
            (f.name === hospital.hospital_name ||
              f.title === hospital.hospital_name ||
              f.clinic === hospital.hospital_name) &&
            f.type === "clinic"
          )
      );
    } else {
      const newFavorite = {
        name: hospital.hospital_name,
        title: hospital.hospital_name,
        clinic: hospital.hospital_name,
        rating: hospital.averageRating,
        reviewCount: hospital.totalReviews,
        procedures: hospital.procedures,
        specialties: hospital.categories,
        type: "clinic" as const,
      };
      updated = [...savedFavorites, newFavorite];
    }

    localStorage.setItem("favorites", JSON.stringify(updated));

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.delete(hospital.hospital_name);
      } else {
        newFavorites.add(hospital.hospital_name);
      }
      return newFavorites;
    });

    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const handleInquiryClick = (hospitalName: string) => {
    setInquiryModalOpen(
      inquiryModalOpen === hospitalName ? null : hospitalName
    );
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

  return (
    <div className="bg-white">
      {/* 필터 섹션 */}
      <div className="sticky top-[156px] z-20 bg-white border-b border-gray-100 px-4 py-3">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="병원명 / 시술명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
          >
            <option value="">전체 카테고리</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 py-6">
        {filteredHospitals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              총 {filteredHospitals.length}개의 병원
            </div>

            {/* 그리드 레이아웃 (3열 4행) - 상세 정보 포함 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {displayHospitals.map((hospital) => {
                const isFavorite = favorites.has(hospital.hospital_name);
                // 병원의 첫 번째 시술 이미지 사용
                const firstTreatment = hospital.treatments[0];
                const thumbnailUrl = firstTreatment
                  ? getThumbnailUrl(firstTreatment)
                  : "https://via.placeholder.com/400x300/667eea/ffffff?text=🏥";
                const avgPrice = firstTreatment?.selling_price
                  ? `${Math.round(firstTreatment.selling_price / 10000)}만원`
                  : "가격 문의";
                const topProcedure =
                  firstTreatment?.treatment_name || "대표 시술 정보 없음";
                const location = "서울"; // 데이터에 위치 값이 없어 기본값 처리

                return (
                  <div
                    key={hospital.hospital_name}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                    onClick={() => {
                      // TODO: 병원 PDP 페이지로 이동
                    }}
                  >
                    {/* 썸네일 - 1:1 비율 */}
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={thumbnailUrl}
                        alt={hospital.hospital_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x300/667eea/ffffff?text=🏥";
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteClick(hospital);
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
                      {/* 번역 뱃지 */}
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold">
                        통역
                      </div>
                    </div>

                    {/* 상세 정보 */}
                    <div className="p-2">
                      {/* 병원명 / 위치 */}
                      <h5 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[28px]">
                        {hospital.hospital_name} · {location}
                      </h5>
                      {/* 대표 시술 / 평균 가격 */}
                      <p className="text-[10px] text-gray-600 mb-1 line-clamp-1">
                        {topProcedure}
                      </p>
                      <div className="mb-1">
                        <span className="text-sm font-bold text-primary-main">
                          {avgPrice}
                        </span>
                      </div>
                      {/* 평점 */}
                      {hospital.averageRating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <FiStar className="text-yellow-400 fill-yellow-400 text-[9px]" />
                          <span className="text-[10px] font-semibold text-gray-700">
                            {hospital.averageRating.toFixed(1)}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            ({hospital.totalReviews || 0})
                          </span>
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
                  더 많은 병원 정보를 볼 수 있어요!
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
