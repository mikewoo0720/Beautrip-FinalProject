"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FiChevronRight,
  FiMapPin,
} from "react-icons/fi";

interface ConsultationSection {
  id: string;
  titleKey: string;
  icon: string;
  color: string;
  items: ConsultationItem[];
}

interface ConsultationItem {
  id: string;
  labelKey: string;
  hasButton?: boolean;
  buttonLabelKey?: string;
  subItems?: string[];
}

export default function ConsultationPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const consultationSections: ConsultationSection[] = [
    {
      id: "recovery",
      titleKey: "community.section.recovery",
      icon: "💬",
      color: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
      items: [
        {
          id: "surgery-done",
          labelKey: "community.item.surgeryDone",
          subItems: [
            "수술경과사진",
            "부작용",
            "염증 & 발열",
            "마사지 & 찜질",
            "성형메이크업",
          ],
          hasButton: true,
          buttonLabelKey: "community.hospitalInfo",
        },
        {
          id: "recovery-chat",
          labelKey: "community.item.recoveryChat",
        },
      ],
    },
    {
      id: "questions",
      titleKey: "community.section.questions",
      icon: "❓",
      color: "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200",
      items: [
        {
          id: "ask-surgery",
          labelKey: "community.item.askSurgery",
          subItems: ["후기글 작성자 DM"],
        },
      ],
    },
    {
      id: "skin-concerns",
      titleKey: "community.section.skinConcerns",
      icon: "😟",
      color: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
      items: [
        {
          id: "skin-diseases",
          labelKey: "community.item.skinDiseases",
          subItems: [
            "지루성",
            "아토피",
            "건선",
            "여드름",
            "안면홍조",
            "한포진",
            "사마귀",
            "광알러지",
            "피부건조",
            "점기미주근깨",
            "여성탈모",
          ],
          hasButton: true,
          buttonLabelKey: "community.hospitalInfo",
        },
      ],
    },
    {
      id: "travel",
      titleKey: "community.section.travel",
      icon: "✈️",
      color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
      items: [
        {
          id: "popular-itinerary",
          labelKey: "community.item.popularItinerary",
        },
        {
          id: "ask-itinerary",
          labelKey: "community.item.askItinerary",
        },
      ],
    },
  ];

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleCategoryClick = (
    sectionId: string,
    itemId: string,
    subItem?: string
  ) => {
    const params = new URLSearchParams();
    params.set("section", sectionId);
    params.set("category", itemId);
    if (subItem) {
      params.set("subCategory", subItem);
    }
    router.push(`/community/posts?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHospitalInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/explore?tab=hospital");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {consultationSections.map((section) => (
        <div
          key={section.id}
          className={`${section.color} border-2 rounded-2xl p-5 shadow-sm`}
        >
          {/* 섹션 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{section.icon}</span>
            <h2 className="text-xl font-bold text-gray-900">
              {t(section.titleKey)}
            </h2>
          </div>

          {/* 섹션 아이템들 */}
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (item.subItems && item.subItems.length > 0) {
                        toggleItem(item.id);
                      } else {
                        handleCategoryClick(section.id, item.id);
                      }
                    }}
                    className="flex-1 text-left flex items-center justify-between group"
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-primary-main transition-colors">
                      {t(item.labelKey)}
                    </span>
                    {item.subItems && item.subItems.length > 0 && (
                      <FiChevronRight
                        className={`text-gray-400 transition-transform ${
                          expandedItems.has(item.id) ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>

                  {item.hasButton && (
                    <button
                      onClick={handleHospitalInfoClick}
                      className="ml-3 px-3 py-1.5 bg-primary-main text-white text-xs font-medium rounded-lg hover:bg-primary-main/90 transition-colors flex items-center gap-1"
                    >
                      <FiMapPin className="text-xs" />
                      {t(item.buttonLabelKey || "")}
                    </button>
                  )}
                </div>

                {/* 하위 카테고리 */}
                {expandedItems.has(item.id) &&
                  item.subItems &&
                  item.subItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {item.subItems.map((subItem, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleCategoryClick(section.id, item.id, subItem)
                          }
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {subItem}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

