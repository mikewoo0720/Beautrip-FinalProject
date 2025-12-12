"use client";

import { useState, useEffect, useMemo } from "react";
import { FiArrowLeft, FiX, FiCamera, FiStar } from "react-icons/fi";
import Image from "next/image";
import { loadTreatmentsPaginated, Treatment } from "@/lib/api/beautripApi";

interface HospitalReviewFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

export default function HospitalReviewForm({
  onBack,
  onSubmit,
}: HospitalReviewFormProps) {
  const [hospitalName, setHospitalName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [categoryLarge, setCategoryLarge] = useState("");
  const [procedureSearchTerm, setProcedureSearchTerm] = useState("");
  const [showProcedureSuggestions, setShowProcedureSuggestions] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [overallSatisfaction, setOverallSatisfaction] = useState(0);
  const [hospitalKindness, setHospitalKindness] = useState(0);
  const [hasTranslation, setHasTranslation] = useState(false);
  const [translationSatisfaction, setTranslationSatisfaction] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [allTreatments, setAllTreatments] = useState<Treatment[]>([]);

  // 대분류 카테고리 10개 (고정)
  const categories = [
    "눈성형",
    "리프팅",
    "보톡스",
    "안면윤곽/양악",
    "제모",
    "지방성형",
    "코성형",
    "피부",
    "필러",
    "가슴성형",
  ];

  // 시술명 자동완성 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 리뷰 작성 폼은 자동완성용으로만 사용하므로 최소한만 로드
        const result = await loadTreatmentsPaginated(1, 100);
        const treatments = result.data;
        setAllTreatments(treatments);
      } catch (error) {
        console.error("시술 데이터 로드 실패:", error);
      }
    };
    loadData();
  }, []);

  // 선택된 카테고리에 맞는 소분류(category_small) 필터링
  const procedureSuggestions = useMemo(() => {
    if (!procedureSearchTerm || procedureSearchTerm.length < 1) return [];
    
    const searchTermLower = procedureSearchTerm.toLowerCase();
    
    // category_small 필드명 찾기 (다양한 가능한 필드명 체크)
    let categorySmallField: string | null = null;
    if (allTreatments.length > 0) {
      const sample = allTreatments[0];
      const possibleFields = ['category_small', 'categorySmall', 'category_small_name', 'small_category'];
      for (const field of possibleFields) {
        if ((sample as any)[field]) {
          categorySmallField = field;
          break;
        }
      }
    }
    
    const getCategorySmall = (t: Treatment): string | undefined => {
      if (categorySmallField) {
        return (t as any)[categorySmallField];
      }
      return t.category_small || (t as any).category_small_name || (t as any).categorySmall;
    };
    
    const filtered = allTreatments
      .filter((t) => {
        // 카테고리가 선택되었으면 해당 카테고리만, 아니면 전체
        const tCategoryLarge = t.category_large || (t as any).category_large_name || (t as any).categoryLarge;
        const categoryMatch = !categoryLarge || tCategoryLarge === categoryLarge;
        
        // 소분류(category_small)에 검색어가 포함되어 있는지
        const categorySmall = getCategorySmall(t);
        const smallMatch = categorySmall?.toLowerCase().includes(searchTermLower);
        
        return categoryMatch && smallMatch;
      })
      .map(getCategorySmall)
      .filter((small): small is string => !!small && small.trim() !== "")
      .filter((small, index, self) => self.indexOf(small) === index) // 중복 제거
      .slice(0, 10); // 최대 10개만 표시
    
    return filtered;
  }, [procedureSearchTerm, categoryLarge, allTreatments]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const StarRating = ({
    rating,
    onRatingChange,
    label,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="p-1"
          >
            <FiStar
              className={`text-2xl ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (!hospitalName || !categoryLarge || content.length < 10) {
      alert("필수 항목을 모두 입력하고 글을 10자 이상 작성해주세요.");
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <FiArrowLeft className="text-gray-700 text-xl" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">병원 후기 작성</h3>
      </div>

      {/* 병원명 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          병원명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="병원명을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
      </div>

      {/* 시술 카테고리 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          시술 카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={categoryLarge}
          onChange={(e) => {
            setCategoryLarge(e.target.value);
            setProcedureSearchTerm(""); // 카테고리 변경 시 검색어 초기화
            setSelectedProcedure("");
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        >
          <option value="">대분류 선택</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 시술명(수술명) (자동완성 - 소분류) */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          시술명(수술명) (선택사항)
        </label>
        <input
          type="text"
          value={procedureSearchTerm}
          onChange={(e) => {
            setProcedureSearchTerm(e.target.value);
            setShowProcedureSuggestions(true);
            if (!e.target.value) {
              setSelectedProcedure("");
            }
          }}
          onFocus={() => setShowProcedureSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowProcedureSuggestions(false), 200);
          }}
          placeholder="소분류를 입력하세요 (자동완성)"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
        {showProcedureSuggestions && procedureSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {procedureSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedProcedure(suggestion);
                  setProcedureSearchTerm(suggestion);
                  setShowProcedureSuggestions(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {selectedProcedure && (
          <p className="text-xs text-gray-500 mt-1">선택된 소분류: {selectedProcedure}</p>
        )}
      </div>

      {/* 전체적인 시술 만족도 */}
      <StarRating
        rating={overallSatisfaction}
        onRatingChange={setOverallSatisfaction}
        label="전체적인 시술 만족도 (1~5)"
      />

      {/* 병원 만족도 */}
      <StarRating
        rating={hospitalKindness}
        onRatingChange={setHospitalKindness}
        label="병원 만족도 (1~5)"
      />

      {/* 통역 여부 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          통역 여부
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setHasTranslation(true)}
            className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
              hasTranslation
                ? "border-primary-main bg-primary-main/10 text-primary-main"
                : "border-gray-300 text-gray-700"
            }`}
          >
            있음
          </button>
          <button
            type="button"
            onClick={() => setHasTranslation(false)}
            className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
              !hasTranslation
                ? "border-primary-main bg-primary-main/10 text-primary-main"
                : "border-gray-300 text-gray-700"
            }`}
          >
            없음
          </button>
        </div>
      </div>

      {/* 병원 방문일 (비필수, 통역 여부 아래로 이동) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          병원 방문일
        </label>
        <input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
      </div>

      {/* 통역 만족도 */}
      {hasTranslation && (
        <StarRating
          rating={translationSatisfaction}
          onRatingChange={setTranslationSatisfaction}
          label="통역 만족도 (1~5)"
        />
      )}

      {/* 글 작성 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          글 작성 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="병원 방문 경험을 자세히 작성해주세요 (10자 이상)"
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {content.length}자 / 최소 10자 이상 작성해주세요
        </p>
      </div>

      {/* 사진첨부 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FiCamera className="text-primary-main" />
          사진첨부 (최대 4장)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-300">
              <Image
                src={img}
                alt={`Uploaded ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-main transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="text-center">
                <FiCamera className="text-2xl text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">사진 추가</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-primary-main hover:bg-primary-light text-white rounded-xl font-semibold transition-colors"
        >
          작성완료
        </button>
      </div>
    </div>
  );
}

