"use client";

import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface AddToScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  treatmentName: string;
}

export default function AddToScheduleModal({
  isOpen,
  onClose,
  onDateSelect,
  treatmentName,
}: AddToScheduleModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 달력의 첫 번째 날짜와 마지막 날짜 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 날짜 포맷팅 (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    const clickedDate = new Date(dateStr);
    
    // 과거 날짜는 선택 불가
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);
    
    if (clickedDate < today) {
      return;
    }

    setSelectedDate(dateStr);
  };

  // 확인 버튼 클릭
  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
      onClose();
      setSelectedDate(null);
    }
  };

  // 달력 날짜 배열 생성
  const calendarDays: (Date | null)[] = [];
  
  // 빈 칸 추가 (첫 주 시작일 전)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">일정에 추가</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <FiX className="text-gray-700 text-xl" />
            </button>
          </div>

          {/* 시술명 표시 */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">시술명</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {treatmentName}
            </p>
          </div>

          {/* 달력 */}
          <div className="p-4">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <FiChevronLeft className="text-gray-700" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {year}년 {month + 1}월
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <FiChevronRight className="text-gray-700" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    index === 0
                      ? "text-red-500"
                      : index === 6
                      ? "text-blue-500"
                      : "text-gray-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square" />;
                }

                const dateStr = formatDate(date);
                const isSelected = selectedDate === dateStr;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const dayOfWeek = date.getDay();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                      isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary-main text-white font-semibold"
                        : isToday(date)
                        ? "bg-primary-light/20 text-primary-main font-semibold"
                        : dayOfWeek === 0
                        ? "text-red-500 hover:bg-red-50"
                        : dayOfWeek === 6
                        ? "text-blue-500 hover:bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                selectedDate
                  ? "bg-primary-main text-white hover:bg-primary-main/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              추가하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

