"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { findRecoveryGuideById } from "@/lib/content/recoveryGuidePosts";
import { FiChevronLeft } from "react-icons/fi";

// 읽기 좋은 마크다운 렌더링 함수
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let currentParagraph: (string | JSX.Element)[] = [];
  let listItems: string[] = [];
  let inList = false;

  // 텍스트를 JSX 요소로 변환 (볼드, 이탤릭 등 처리)
  const parseInline = (
    text: string,
    lineIdx: number
  ): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // 볼드 텍스트 처리 (**text**)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    const matches: Array<{ start: number; end: number; text: string }> = [];

    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
      });
    }

    matches.forEach((m, idx) => {
      if (m.start > lastIndex) {
        parts.push(text.substring(lastIndex, m.start));
      }
      parts.push(
        <strong
          key={`bold-${lineIdx}-${idx}`}
          className="font-semibold text-gray-900"
        >
          {m.text}
        </strong>
      );
      lastIndex = m.end;
    });

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="text-[15px] text-gray-800 leading-[1.8] mb-4"
        >
          {currentParagraph.map((item, idx) => (
            <React.Fragment key={idx}>{item}</React.Fragment>
          ))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="list-disc list-outside space-y-2 mb-4 ml-5 text-[15px] text-gray-800 leading-[1.8]"
        >
          {listItems.map((item, idx) => {
            const cleanItem = item
              .replace(/^[-*]\s+/, "")
              .replace(/^\d+\.\s+/, "");
            const parsed = parseInline(cleanItem, idx);
            return (
              <li key={idx} className="pl-1">
                {parsed.map((p, pIdx) => (
                  <React.Fragment key={pIdx}>{p}</React.Fragment>
                ))}
              </li>
            );
          })}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 헤더 처리
    if (trimmed.startsWith("##")) {
      flushParagraph();
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 2;
      const text = trimmed.replace(/^#+\s+/, "");

      if (level === 2) {
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-xl font-bold text-gray-900 mt-8 mb-4 first:mt-0 pb-2 border-b border-gray-200"
          >
            {text}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-semibold text-gray-900 mt-6 mb-3"
          >
            {text}
          </h3>
        );
      } else if (level === 4) {
        elements.push(
          <h4
            key={`h4-${idx}`}
            className="text-base font-semibold text-gray-900 mt-4 mb-2"
          >
            {text}
          </h4>
        );
      }
      return;
    }

    // 리스트 항목 처리
    if (trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      flushParagraph();
      inList = true;
      listItems.push(trimmed);
      return;
    }

    // 리스트가 끝나면 flush
    if (inList && trimmed === "") {
      flushList();
      return;
    }

    // 빈 줄 처리
    if (trimmed === "") {
      flushParagraph();
      flushList();
      return;
    }

    // 일반 텍스트 처리
    if (inList) {
      flushList();
    }

    const parsed = parseInline(trimmed, idx);
    currentParagraph.push(...parsed);
  });

  flushParagraph();
  flushList();

  return <div className="space-y-1">{elements}</div>;
}

interface RecoveryGuidePostDetailPageProps {
  postId: string;
}

export default function RecoveryGuidePostDetailPage({
  postId,
}: RecoveryGuidePostDetailPageProps) {
  const router = useRouter();
  const post = findRecoveryGuideById(postId);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <FiChevronLeft className="text-gray-700 text-xl" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">회복 가이드</h1>
          </div>
        </div>
        <div className="px-4 py-8 text-center text-gray-500">
          회복 가이드를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <FiChevronLeft className="text-gray-700 text-xl" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20">
        {/* Badge & Meta */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-primary-light/20 text-primary-main px-3 py-1.5 rounded-full font-medium">
              {post.category}
            </span>
            {post.readTime && (
              <span className="text-xs text-gray-500">
                {post.readTime} 읽기
              </span>
            )}
            {post.views !== undefined && (
              <span className="text-xs text-gray-500">
                조회 {post.views.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-[15px] text-gray-700 leading-[1.8]">
            {post.description}
          </p>
        </div>

        {/* Markdown Content */}
        <div className="max-w-none">{renderMarkdown(post.content)}</div>
      </div>
    </div>
  );
}
