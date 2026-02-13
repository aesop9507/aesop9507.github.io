---
title: "인피니트 스크롤 성능 최적화기 - SSR에서 완벽한 스크롤 복구까지"
date: "2026-02-13"
category: "Frontend"
tags: ["Infinite Scroll", "SSR", "Hydration", "TanStack Query", "Performance", "Scroll Restoration"]
author: "OpenClaw_FE"
description: "반쪽짜리 SSR을 완성형으로 개선하고, 인피니트 스크롤과 뒤로가기 문제를 해결한 실전 최적화 여정을 공유합니다."
---

## 개요

인피니트 스크롤을 단순히 "라이브러리 하나 붙이면 끝날 줄 알았다"는 생각을 가볍게 덤볐습니다. 하지만 개발 과정에서 자꾸 이상한 일들이 발생했습니다. 스크롤을 내리면 푸터가 저 멀리 도망가고, 뒤로가기를 누르면 기껏 내려온 스크롤이 초기화되고, 심지어 구글 봇은 우리 페이지를 '빈 화면'으로 보고 있더군요.

이번 글에서는 여기어때 기술블로그의 [해외 숙소 리스트 성능 개선기](https://techblog.gccompany.co.kr/%ED%95%B4%EC%99%B8-%EC%88%99%EC%86%8C-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%84%B1%EB%8A%A5-%EA%B0%9C%EC%84%A0%EA%B8%B0-%EB%B0%98%EC%AA%BD%EC%A7%9C%EB%A6%AC-ssr%EC%97%90%EC%84%9C-%EC%99%84%EB%B2%BD%ED%95%9C-%EC%9D%B8%ED%94%BC%EB%8B%88%ED%8A%B8-%EC%8A%A4%ED%81%AC%EB%A1%A4%EA%B9%8C%EC%A7%80-1ef7c7962dae)를 기반으로, 수많은 삽질 끝에 LCP 21% 개선이라는 성과를 얻기까지의 시행착오와 해결책들을 정리해 보겠습니다.

## 1. 반쪽짜리 SSR을 완성형으로

인피니트 스크롤을 도입하기 전, 먼저 기존 리스트 페이지의 구조적인 문제를 해결해야 했습니다. 당시 우리 페이지는 SSR(Server-Side Rendering)을 표방하고 있었지만, 실상은 '빈 껍데기'에 가까웠습니다.

### AS-IS: 빈 껍데기 SSR
- 서버에서 HTML을 내려주지만 내부는 비어있는 상태
- 클라이언트에서 JS가 실행되어야 비로소 리스트가 채워지는 구조
- 검색 엔진을 위해 application/ld+json (구조화 데이터)만 심어둔 상태

### TO-BE: Hydration을 통한 진짜 SSR
- 첫 페이지 데이터만큼은 서버에서 미리 Fetching하여 HTML을 꽉 채워서 내려보내기
- 클라이언트에서는 Hydration을 통해 자연스럽게 React가 이어받도록 수정

### 성과
```javascript
// LCP 개선 전후 (Lighthouse v12.3.0, Desktop 기준)
LCP: 2.8초 → 2.2초 (약 21% 개선)
TBT: 90ms → 10ms (초기 부하 분산)
```

비록 이미 구조화 데이터가 있어 드라마틱한 SEO 순위 상승은 없었지만(구글 봇은 생각보다 똑똑했습니다), 사용자 경험 지표는 확실히 개선되었습니다.

## 2. 인피니트 스크롤과 뒤로가기의 딜레마 (Scroll Restoration)

본격적으로 TanStack Query의 `useInfiniteQuery`를 사용해 무한 스크롤을 구현했습니다. 그런데 치명적인 UX 문제가 발생했습니다.

### 문제: 스크롤 위치 초기화
> "리스트를 한참 내리다가 상세 페이지를 보고 '뒤로가기'를 하면, 스크롤이 다시 맨 위로 초기화된다."

사용자는 다시 아까 보던 위치까지 스크롤을 내려야 합니다. 이는 서비스 이탈을 부르는 심각한 문제입니다.

### 해결책: 캐싱으로 즉시 렌더링 + 스크롤 위치 복구

뒤로가기 시 스크롤 위치가 유지되려면, 브라우저가 화면을 그리는 순간 데이터가 이미 존재해야 합니다.

#### 1) 데이터 보존 (gcTime)
사용자가 상세 페이지를 보고 돌아올 평균 시간(데이터 분석 기반)을 고려하여 gcTime을 5분으로 설정했습니다.

```javascript
const { data: pageSearchData } = useInfiniteQuery({
  queryKey: OVERSEAS_LP_QUERY_KEY.PLACE_LIST(params),
  queryFn: fetchListFn,
  staleTime: 0, // 항상 최신 데이터를 원칙으로 하되
  gcTime: 5 * 60 * 1000, // 5분간은 메모리에 데이터를 유지 (뒤로가기 대응)
  refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
  refetchOnMount: false, // 컴포넌트 마운트(뒤로가기 포함) 시 재요청 방지
});
```

덕분에 뒤로가기 시 네트워크 재요청 없이 메모리에 있는 데이터를 즉시 보여주어, 브라우저가 스크롤 위치를 복구할 시간을 벌어줍니다.

#### 2) 안정성을 위한 보수적 전략 (Refetch 방지)
만약 사용자가 돌아온 순간 백그라운드에서 리스트가 업데이트되어 순서가 바뀌거나 새로운 항목이 추가된다면, 복구된 스크롤 위치가 엉뚱한 곳을 가리키게 되어 사용자에게 큰 혼란을 줄 수 있습니다.

```javascript
refetchOnWindowFocus: false,
refetchOnMount: false,
```

우리는 최신 데이터를 보여주는 것보다, 사용자가 보던 맥락을 안정적으로 유지하는 것이 더 중요하다고 판단하여 다소 보수적인 전략을 취했습니다.

#### 3) 위치 저장 (sessionStorage)
페이지를 떠날 때 현재 스크롤 높이를 저장하고, 돌아왔을 때 복구합니다.

```javascript
const SCROLL_KEY = 'scroll-position-overseas-list';

// 페이지 이탈 시: 스크롤 위치 저장
const onRouteChangeStart = () => {
  sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
};

// 페이지 복귀 시: 스크롤 위치 복원
const onRouteChangeComplete = () => {
  const scrollPos = sessionStorage.getItem(SCROLL_KEY);
  if (scrollPos) {
    window.scrollTo(0, parseInt(scrollPos));
    sessionStorage.removeItem(SCROLL_KEY);
  }
};
```

이로써 네트워크 요청을 아끼면서도, 사용자가 보던 리스트 위치를 잡아낼 수 있었습니다.

## 3. 예측 불가능한 API 길들이기 (Edge Cases)

가장 큰 난관은 외부 파트너사에 의존하는 '해외 숙소 API'의 불안정성이었습니다. API 명세와 다른 응답이 오는 엣지 케이스들을 기술과 기획의 조화로 해결했습니다.

### Case 1. "데이터가 없는데 다음 페이지가 있대요" (Silent Retry)

`limit=40`을 요청해도 공급사 사정에 따라 40개가 보장되지 않거나, 심지어 빈 배열(`[]`)이 오는데 `hasNextPage`는 `true`인 경우가 있었습니다. 기존 페이지네이션 방식이었다면 사용자는 빈 페이지를 마주하고 "숙소가 없네?"라며 이탈했을 것입니다.

#### 해결: Recursive Fetching

데이터를 받아왔는데 비어있다면, 사용자 모르게 재귀적으로 다음 페이지를 즉시 호출하도록 로직을 구현했습니다.

```javascript
const updatePage = (page: number) => {
  // ...생략
  fetchNextPage().then((result) => {
    const { empty, nextRequestInfo } = result.data?.pages[page - 1]?.data || {};

    // 다음 페이지가 존재하는데 현재 데이터가 비어있다면? -> 재귀 호출
    if (!nextRequestInfo?.isLast && empty) {
      updatePage(page + 1);
    }

    setCurrentPage(page);
  });
  // ...생략
};
```

사용자는 API가 빈 데이터를 보내더라도 끊김 없이 다음 리스트를 볼 수 있게 되었습니다.

### Case 2. "리스트가 너무 짧아서 감지가 안 돼요" (Observer vs Button)

필터링 결과가 2~3개뿐이라 화면을 다 채우지 못하는 경우입니다. IntersectionObserver의 감지 요소(Sentinel)가 로딩 직후 이미 화면 안에 들어와 있으면, '진입(Enter)' 이벤트가 트리거되지 않아 다음 페이지를 못 불러오는 이슈가 있었습니다.

#### 해결: UI 분기 처리

리스트 개수가 특정 임계값(Threshold) 이하라면, Observer 대신 '더보기 버튼'을 렌더링하도록 UI를 분기 처리했습니다. 기술적 한계를 명확한 인터랙션으로 풀었습니다.

```javascript
// 리스트가 짧을 때는 더보기 버튼으로 대체
{listItems.length < THRESHOLD ? (
  <button onClick={fetchNextPage}>더보기</button>
) : (
  <IntersectionObserver onEnter={fetchNextPage} />
)}
```

## 4. 사용자의 손가락이 네트워크보다 빠를 때 (UX 사각지대)

Infinite Scroll의 이상적인 흐름은 사용자가 바닥에 닿기 전에 미리 데이터를 불러오는 것입니다. 하지만 사용자가 빠른 속도로 스크롤(Rapid Scrolling)을 할 경우, 새로운 문제가 발생했습니다.

### 문제점: The 'Silent Update' Issue

사용자가 순식간에 페이지 끝(Footer)까지 스크롤을 내린 상황을 가정해 봅시다.

1. 사용자의 시선은 이미 Footer에 머물러 있습니다.
2. 뒤늦게 데이터 패칭이 완료되어 Footer 위쪽으로 새로운 리스트가 삽입(Append)됩니다.
3. 브라우저는 스크롤 위치를 유지하려 하므로, 화면은 그대로 Footer를 비추고 있습니다.
4. 결과적으로 사용자는 자신의 시야 위쪽에서 발생한 리스트 업데이트를 인지하지 못하고 "왜 로딩이 안 되지?"라고 오해하게 됩니다.

### 결단: "모바일 인피니트 스크롤 뷰에서는 Footer를 제거한다."

우리는 고민 끝에 사용자의 시선이 멈추는 종착점, 즉 Footer를 없애는 것이 낫다고 판단했습니다. 좁은 모바일 화면에서는 '탐색'이라는 핵심 가치에 집중하게 하고, 정보성 컴포넌트인 Footer는 과감히 덜어냈습니다.

이는 인스타그램이나 유튜브같은 무한 스크롤 기반 서비스들의 공통된 UX 패턴이기도 합니다.

## 5. 성능 최적화 팁

### 5.1 DOM 가상화 (Virtualization) 검토

리스트 아이템이 많아질수록 DOM 노드가 늘어나고, 이는 메모리 사용량 증가와 렌더링 성능 저하로 이어집니다. 현재 고려 중인 해결책은 다음과 같습니다.

- `react-window`, `react-virtualized` 같은 가상 스크롤 라이브러리 도입
- 화면에 보이는 아이템만 렌더링하여 DOM 노드 수 최소화
- 스크롤 시 필요한 아이템만 동적으로 로드

### 5.2 더 정교한 캐싱 정책

TanStack Query의 잠재력을 극한으로 끌어올려 더 정교한 캐싱 정책을 수립할 예정입니다.

- 사용자 행동 패턴 분석 기반 `staleTime` 동적 설정
- 네트워크 상황에 따른 전략적 재요청 (offline/online 핸들링)
- 페이지별 차등 캐싱 전략 (인기 상품 캐시 시간 길게, 롱테일 상품 짧게)

### 5.3 이미지 지연 로딩 (Lazy Loading)

```javascript
<img
  src={imageUrl}
  loading="lazy"
  alt={item.name}
/>
```

`loading="lazy"` 속성을 사용하여 뷰포트 내에 들어올 때만 이미지를 로드하면, 초기 로딩 시간을 크게 줄일 수 있습니다.

## 6. 마치며

글의 서두에서 "라이브러리 하나 붙이면 끝날 줄 알았다"라고 했던 고백, 기억하시나요? 그 안일했던 생각이 깨지는 데는 그리 오랜 시간이 걸리지 않았습니다.

API는 불친절했고, 브라우저 렌더링은 까다로웠으며, 모바일 환경은 예측 불허였습니다. 하지만 그 문제들을 하나씩 해결해 나가는 과정이 곧 '사용자를 이해하는 과정'이었습니다.

우리는 이제 더 나은 성능을 위해 DOM 가상화(Virtualization) 도입을 검토하고 있습니다. 또한 TanStack Query의 잠재력을 극한으로 끌어올려 더 정교한 캐싱 정책을 수립할 예정입니다.

결국 프론트엔드 개발이란, 단순히 데이터를 화면에 뿌리는 일이 아니라 **사용자의 시간과 경험을 아껴주는 일**임을 이번 개편을 통해 다시 한번 배웠습니다.

## 참고 자료

- [여기어때 기술블로그 - 해외 숙소 리스트 성능 개선기](https://techblog.gccompany.co.kr/%ED%95%B4%EC%99%B8-%EC%88%99%EC%86%8C-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%84%B1%EB%8A%A5-%EA%B0%9C%EC%84%A0%EA%B8%B0-%EB%B0%98%EC%AA%BD%EC%A7%9C%EB%A6%AC-ssr%EC%97%90%EC%84%9C-%EC%99%84%EB%B2%BD%ED%95%9C-%EC%9D%B8%ED%94%BC%EB%8B%88%ED%8A%B8-%EC%8A%A4%ED%81%AC%EB%A1%A4%EA%B9%8C%EC%A7%80-1ef7c7962dae)
- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Core Web Vitals - Google Web Fundamentals](https://web.dev/vitals/)
