"use client";

import { useState, useEffect, useMemo } from "react";
import { FiArrowLeft, FiX, FiCamera, FiStar } from "react-icons/fi";
import Image from "next/image";
import { loadTreatmentsPaginated, Treatment } from "@/lib/api/beautripApi";

interface ProcedureReviewFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

export default function ProcedureReviewForm({
  onBack,
  onSubmit,
}: ProcedureReviewFormProps) {
  const [surgeryDate, setSurgeryDate] = useState("");
  const [category, setCategory] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [procedureSearchTerm, setProcedureSearchTerm] = useState("");
  const [showProcedureSuggestions, setShowProcedureSuggestions] =
    useState(false);
  const [cost, setCost] = useState("");
  const [procedureRating, setProcedureRating] = useState(0);
  const [hospitalRating, setHospitalRating] = useState(0);
  const [gender, setGender] = useState<"여" | "남" | "">("");
  const [ageGroup, setAgeGroup] = useState("");
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
  const ageGroups = ["20대", "30대", "40대", "50대"];

  // 시술명 자동완성 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 리뷰 작성 폼은 자동완성용으로만 사용하므로 최소한만 로드
        const result = await loadTreatmentsPaginated(1, 100);
        setAllTreatments(result.data);

        // 디버깅: 데이터 확인
        console.log("📊 전체 데이터 개수:", treatments.length);
        if (treatments.length > 0) {
          const sample = treatments[0];
          console.log("📋 샘플 데이터 필드:", Object.keys(sample));
          console.log("📋 샘플 데이터 (전체):", sample);

          // 실제 테이블 컬럼명 확인
          const allKeys = new Set<string>();
          treatments.slice(0, 100).forEach((t) => {
            Object.keys(t).forEach((key) => allKeys.add(key));
          });
          console.log(
            "📋 실제 테이블 컬럼명 목록:",
            Array.from(allKeys).sort()
          );

          // category_small 필드 확인 (다양한 가능한 필드명 체크)
          const categorySmallVariations = [
            "category_small",
            "categorySmall",
            "category_small_name",
            "small_category",
          ];
          let categorySmallField: string | null = null;
          for (const field of categorySmallVariations) {
            if (sample[field as keyof typeof sample]) {
              categorySmallField = field;
              break;
            }
          }
          console.log(
            "📌 category_small 필드명:",
            categorySmallField || "없음"
          );

          // "눈" 관련 데이터 확인 (모든 가능한 필드에서)
          const eyeData = treatments.filter((t) => {
            const large =
              t.category_large ||
              (t as any).category_large_name ||
              (t as any).categoryLarge;
            const mid =
              t.category_mid ||
              (t as any).category_mid_name ||
              (t as any).categoryMid;
            const small =
              t.category_small ||
              (t as any).category_small_name ||
              (t as any).categorySmall ||
              (t as any)[categorySmallField || ""];
            const name =
              t.treatment_name ||
              (t as any).treatment_name_name ||
              (t as any).treatmentName;

            return (
              large?.includes("눈") ||
              mid?.includes("눈") ||
              small?.includes("눈") ||
              name?.includes("눈")
            );
          });
          console.log("👁️ '눈' 관련 데이터 개수:", eyeData.length);
          if (eyeData.length > 0) {
            console.log(
              "👁️ '눈' 관련 샘플 (최대 10개):",
              eyeData.slice(0, 10).map((t) => ({
                treatment_name: t.treatment_name,
                category_large: t.category_large,
                category_mid: t.category_mid,
                category_small:
                  t.category_small ||
                  (t as any)[categorySmallField || ""] ||
                  "없음",
              }))
            );
          }

          // category_small 필드가 있는 데이터 확인
          const hasCategorySmall = treatments.filter((t) => {
            if (categorySmallField) {
              return !!(t as any)[categorySmallField];
            }
            return !!(
              t.category_small ||
              (t as any).category_small_name ||
              (t as any).categorySmall
            );
          });
          console.log(
            "📌 category_small 필드가 있는 데이터 개수:",
            hasCategorySmall.length
          );
          if (hasCategorySmall.length > 0) {
            const getSmallValue = (t: Treatment) => {
              if (categorySmallField) return (t as any)[categorySmallField];
              return (
                t.category_small ||
                (t as any).category_small_name ||
                (t as any).categorySmall
              );
            };
            const uniqueSmall = new Set(
              hasCategorySmall.map(getSmallValue).filter(Boolean)
            );
            console.log(
              "📌 고유한 category_small 값들 (최대 20개):",
              Array.from(uniqueSmall).slice(0, 20)
            );
          }
        }
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
      const possibleFields = [
        "category_small",
        "categorySmall",
        "category_small_name",
        "small_category",
      ];
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
      return (
        t.category_small ||
        (t as any).category_small_name ||
        (t as any).categorySmall
      );
    };

    const filtered = allTreatments
      .filter((t) => {
        // 카테고리가 선택되었으면 해당 카테고리만, 아니면 전체
        const categoryLarge =
          t.category_large ||
          (t as any).category_large_name ||
          (t as any).categoryLarge;
        const categoryMatch = !category || categoryLarge === category;

        // 소분류(category_small)에 검색어가 포함되어 있는지
        const categorySmall = getCategorySmall(t);
        const smallMatch = categorySmall
          ?.toLowerCase()
          .includes(searchTermLower);

        return categoryMatch && smallMatch;
      })
      .map(getCategorySmall)
      .filter((small): small is string => !!small && small.trim() !== "")
      .filter((small, index, self) => self.indexOf(small) === index) // 중복 제거
      .slice(0, 10); // 최대 10개만 표시

    // 디버깅: 검색 결과 로그
    if (procedureSearchTerm) {
      console.log("🔍 검색어:", procedureSearchTerm);
      console.log("🔍 선택된 카테고리:", category);
      console.log(
        "🔍 category_small 필드명:",
        categorySmallField || "category_small (기본)"
      );
      console.log("🔍 검색 결과 개수:", filtered.length);
      if (filtered.length > 0) {
        console.log("🔍 검색 결과:", filtered);
      } else {
        console.log("🔍 전체 데이터 개수:", allTreatments.length);
        const hasCategorySmall = allTreatments.filter((t) =>
          getCategorySmall(t)
        ).length;
        console.log("🔍 category_small 필드가 있는 데이터:", hasCategorySmall);
      }
    }

    return filtered;
  }, [procedureSearchTerm, category, allTreatments]);

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

  const handleSubmit = () => {
    if (!category || !procedureName || !cost || content.length < 10) {
      alert("필수 항목을 모두 입력하고 글을 10자 이상 작성해주세요.");
      return;
    }
    onSubmit();
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
        {label} <span className="text-red-500">*</span>
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
        <h3 className="text-lg font-bold text-gray-900">시술 후기 작성</h3>
      </div>

      {/* 시술 카테고리 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          시술 카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setProcedureSearchTerm(""); // 카테고리 변경 시 검색어 초기화
            setProcedureName("");
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        >
          <option value="">카테고리를 선택하세요</option>
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
          시술명(수술명) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={procedureSearchTerm}
          onChange={(e) => {
            setProcedureSearchTerm(e.target.value);
            setShowProcedureSuggestions(true);
            if (!e.target.value) {
              setProcedureName("");
            }
          }}
          onFocus={() => setShowProcedureSuggestions(true)}
          onBlur={() => {
            // 약간의 지연을 두어 클릭 이벤트가 먼저 발생하도록
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
                  setProcedureName(suggestion);
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
        {procedureName && (
          <p className="text-xs text-gray-500 mt-1">
            선택된 소분류: {procedureName}
          </p>
        )}
      </div>

      {/* 시술, 수술 비용 (만원) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          비용 (만원) <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">₩</span>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="수술 비용"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
          />
          <span className="text-gray-700">만원</span>
        </div>
      </div>

      {/* 전체적인 시술 만족도 */}
      <StarRating
        rating={procedureRating}
        onRatingChange={setProcedureRating}
        label="전체적인 시술 만족도 (1~5)"
      />

      {/* 병원 만족도 */}
      <StarRating
        rating={hospitalRating}
        onRatingChange={setHospitalRating}
        label="병원 만족도 (1~5)"
      />

      {/* 병원명 (선택사항) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          병원명(선택사항)
        </label>
        <input
          type="text"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="병원명을 입력하세요"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
      </div>

      {/* 시술 날짜 (선택사항) */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          시술 날짜(선택사항)
        </label>
        <input
          type="date"
          value={surgeryDate}
          onChange={(e) => setSurgeryDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main"
        />
      </div>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          성별 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGender("여")}
            className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
              gender === "여"
                ? "border-primary-main bg-primary-main/10 text-primary-main"
                : "border-gray-300 text-gray-700"
            }`}
          >
            여
          </button>
          <button
            type="button"
            onClick={() => setGender("남")}
            className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
              gender === "남"
                ? "border-primary-main bg-primary-main/10 text-primary-main"
                : "border-gray-300 text-gray-700"
            }`}
          >
            남
          </button>
        </div>
      </div>

      {/* 연령 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          연령 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ageGroups.map((age) => (
            <button
              key={age}
              type="button"
              onClick={() => setAgeGroup(age)}
              className={`py-3 rounded-xl border-2 transition-colors ${
                ageGroup === age
                  ? "border-primary-main bg-primary-main/10 text-primary-main"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* 글 작성 */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          글 작성 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="시술 경험을 자세히 작성해주세요 (10자 이상)"
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
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-300"
            >
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
