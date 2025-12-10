# 컴포넌트 구조 및 사용 현황

## 📱 홈페이지 (HomePage.tsx)

### 사용 중인 컴포넌트:
1. **RankingBanner** - 상단 고정 랭킹 배너
2. **Header** - 헤더 (배너 아래 고정)
3. **TravelScheduleBar** - 여행 일정 입력 바
4. **HotConcernsSection** - 인기 시술 (일정 미선택 시)
5. **ProcedureRecommendation** - 맞춤 시술 추천 (일정 선택 시)
6. **PromotionBanner** - 배너 슬라이더 (AI/이벤트/블프...)
7. **CountryPainPointSection** - 국가별 페인포인트 인기 검색어 목록
8. **AIAnalysisBanner** - AI 분석 배너
9. **PopularReviewsSection** - 인기 급상승 리뷰
10. **InformationalContentSection** - 정보성 컨텐츠 섹션 (새로 추가)
11. **AISkinAnalysisButton** - 플로팅 AI 피부 분석 버튼
12. **OverlayBar** - 오버레이 바
13. **CommunityWriteModal** - 커뮤니티 글쓰기 모달
14. **BottomNavigation** - 하단 네비게이션

### 숨김 처리된 컴포넌트:
- **MissionSection** - 미션 (출석, 활동) - 주석 처리
- **KBeautyByCountry** - 국가별 인기 시술 - 주석 처리
- **RecentEventsSection** - 인기 급상승 비포&애프터 리뷰 - 주석 처리
- **DDayBanner** - D-Day 플로팅 배너 - 주석 처리
- **SearchSection** - 검색어 입력 - 주석 처리

---

## 🔍 탐색 탭 (ExploreScrollPage.tsx)

### 사용 중인 컴포넌트:
1. **Header** - 헤더
2. **ExploreHeader** - 탐색 탭 상단 네비게이션 (랭킹, 추천, 시술 목록, 병원 목록)
3. **CategoryRankingPage** - 카테고리별 인기 랭킹
4. **RecommendationPage** - 추천 섹션 (카테고리 맞춤, 일정 맞춤, 유행 시술)
5. **ProcedureListPage** - 시술 목록
6. **HospitalInfoPage** - 병원 목록
7. **BottomNavigation** - 하단 네비게이션

### IA와 다른 부분:
- ❌ **랭킹 섹션에 Kbeauty 인기 랭킹, 병원 랭킹이 별도로 없음**
  - 현재: CategoryRankingPage만 있음
  - IA: 카테고리별 인기 랭킹, Kbeauty 인기 랭킹, 병원 랭킹 3개
- ❌ **글 작성 유도 버튼이 없음**
  - IA: 병원 목록과 시술 목록 위에 "글 작성 유도 button" 표시
- ❌ **병원 정보/시술 정보 상세 페이지 기능 부족**
  - 현재: 기본 정보만 표시
  - IA: 문의하기 (AI 채팅, 전화, 메일), 찜하기 기능 필요
- ❌ **시술 찜하기 후 일정 저장 기능 없음**
  - IA: 찜하기 → 내 일정의 찜한 시술 저장 → 여행 일정 목록 선택 → 시술 일자 선택 → 내 일정 저장

---

## 💬 커뮤니티 탭 (CommunityPage.tsx)

### 사용 중인 컴포넌트:
1. **Header** - 헤더
2. **CommunityHeader** - 커뮤니티 탭 헤더 (카테고리, 추천, 최신, 인기, 후기)
3. **CommunityCategoriesPage** - 카테고리 페이지
4. **PostList** - 게시글 목록 (추천, 최신, 인기)
5. **ReviewTabPage** - 후기 탭 페이지
6. **CommunityFloatingButton** - 커뮤니티 플로팅 버튼 (글 쓰기)
7. **BottomNavigation** - 하단 네비게이션

---

## 👤 마이페이지 (MyPage.tsx)

### 사용 중인 컴포넌트:
1. **Header** - 헤더
2. **LoginModal** - 로그인 모달 (비로그인 시)
3. **BottomNavigation** - 하단 네비게이션

---

## 📋 기타 페이지 컴포넌트

### 사용 중:
- **FavoritesPage** - 찜한 목록 페이지
- **MySchedulePage** - 내 일정 페이지
- **SchedulePage** - 일정 페이지
- **NearbyPage** - 주변 병원 페이지
- **QuoteRequestPage** - 견적 요청 페이지
- **ReviewWriteModal** - 리뷰 작성 모달
- **ReviewFilterModal** - 리뷰 필터 모달
- **SearchModal** - 검색 모달
- **QuoteRequestModal** - 견적 요청 모달
- **AISkinAnalysisConsentModal** - AI 피부 분석 동의 모달
- **AISkinAnalysisCameraModal** - AI 피부 분석 카메라 모달
- **ProcedureFilterModal** - 시술 필터 모달
- **TravelScheduleCalendarModal** - 여행 일정 캘린더 모달
- **TravelScheduleForm** - 여행 일정 폼
- **TravelScheduleBar** - 여행 일정 바
- **TravelScheduleCalendar** - 여행 일정 캘린더

---

## 🚫 현재 사용되지 않는 컴포넌트

1. **RankingPage.tsx** - 랭킹 페이지 (하드코딩된 데이터, 실제 사용 안 함)
2. **RankingSection.tsx** - 랭킹 섹션 (CategoryRankingPage, KBeautyRankingPage, HospitalRankingPage를 포함하지만 실제로는 ExploreScrollPage에서 직접 사용)
3. **KBeautyByCountry.tsx** - 국가별 인기 시술 (홈에서 주석 처리됨)
4. **RecentEventsSection.tsx** - 인기 급상승 비포&애프터 리뷰 (홈에서 주석 처리됨)
5. **MissionSection.tsx** - 미션 섹션 (홈에서 주석 처리됨)
6. **DDayBanner.tsx** - D-Day 배너 (홈에서 주석 처리됨)
7. **SearchSection.tsx** - 검색 섹션 (홈에서 주석 처리됨)
8. **CalendarSidebar.tsx** - 캘린더 사이드바 (홈에서 제거됨)
9. **CategoriesSection.tsx** - 카테고리 섹션 (사용처 불명)
10. **DatePickerSection.tsx** - 날짜 선택 섹션 (사용처 불명)
11. **EventsSection.tsx** - 이벤트 섹션 (사용처 불명)
12. **FilterTags.tsx** - 필터 태그 (사용처 불명)
13. **InterestProceduresSection.tsx** - 관심 시술 섹션 (사용처 불명)
14. **ThemeSection.tsx** - 테마 섹션 (사용처 불명)
15. **TrendingSearchTerms.tsx** - 트렌딩 검색어 (사용처 불명)
16. **CommunityRecommendations.tsx** - 커뮤니티 추천 (사용처 불명)
17. **CategoryPhotoReviewPage.tsx** - 카테고리별 사진 리뷰 페이지 (app/community/photo-review에서만 사용, 실제 사용 여부 불명)
18. **HospitalReviewForm.tsx** - 병원 후기 폼 (CommunityWriteModal에서 사용 예정이지만 현재 미사용)
19. **ProcedureReviewForm.tsx** - 시술 후기 폼 (CommunityWriteModal에서 사용 예정이지만 현재 미사용)
20. **ConcernPostForm.tsx** - 고민글 폼 (CommunityWriteModal에서 사용 예정이지만 현재 미사용)

---

## 📊 컴포넌트 계층 구조

```
HomePage
├── RankingBanner
├── Header
├── TravelScheduleBar
│   └── TravelScheduleCalendarModal
├── HotConcernsSection (일정 미선택 시)
├── ProcedureRecommendation (일정 선택 시)
│   └── ProcedureFilterModal
├── PromotionBanner
│   ├── AISkinAnalysisConsentModal
│   └── AISkinAnalysisCameraModal
├── CountryPainPointSection
├── AIAnalysisBanner
├── PopularReviewsSection
├── InformationalContentSection (새로 추가)
├── AISkinAnalysisButton
├── OverlayBar
├── CommunityWriteModal
│   ├── ProcedureReviewForm
│   ├── HospitalReviewForm
│   └── ConcernPostForm
└── BottomNavigation

ExploreScrollPage
├── Header
├── ExploreHeader
├── CategoryRankingPage
├── RecommendationPage
│   ├── TravelScheduleForm
│   └── ProcedureRecommendation
├── ProcedureListPage
├── HospitalInfoPage
└── BottomNavigation

CommunityPage
├── Header
├── CommunityHeader
├── CommunityCategoriesPage
├── PostList
├── ReviewTabPage
│   ├── ReviewList
│   └── ReviewFilterModal
├── CommunityFloatingButton
│   └── CommunityWriteModal
└── BottomNavigation

MyPage
├── Header
├── LoginModal
└── BottomNavigation
```

---

## 🔍 탐색 탭 IA 비교 분석

### IA 구조:
1. **상단 네비게이션바**
   - 랭킹
     - 카테고리별 인기 랭킹 ✅
     - Kbeauty 인기 랭킹 ❌ (없음)
     - 병원 랭킹 ❌ (별도 섹션으로 분리됨)
   - 추천 ✅
     - 카테고리 맞춤 추천 ✅
     - 유행 시술 맞춤 추천 ✅
     - 일정 맞춤 추천 ✅
2. **글 작성 유도 button** ❌ (없음)
3. **병원 목록** ✅
   - 병원 정보 ✅
     - 문의하기 (AI 채팅, 전화, 메일) ⚠️ (부분 구현)
     - 찜하기 ✅
4. **글 작성 유도 button** ❌ (없음)
5. **시술 목록** ✅
   - 시술정보 ✅
     - 문의하기 (AI 채팅, 전화, 메일) ⚠️ (부분 구현)
     - 찜하기 ✅
     - 내 일정의 찜한 시술 저장 ❌ (없음)

### 주요 차이점:
1. **랭킹 섹션 구조가 다름**
   - IA: 랭킹 탭 안에 3개 하위 섹션 (카테고리별, Kbeauty, 병원)
   - 현재: 랭킹 섹션에 CategoryRankingPage만 있고, 병원은 별도 섹션으로 분리
2. **글 작성 유도 버튼이 없음**
   - IA: 병원 목록과 시술 목록 위에 표시
3. **시술 찜하기 후 일정 저장 기능 없음**
   - IA: 찜하기 → 일정 저장 플로우가 있음
   - 현재: 찜하기만 가능

