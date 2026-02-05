---
title: "React Router v7에서 startTransition 이슈 해결하기"
date: "2026-02-05"
category: "Frontend"
tags: ["React", "React Router", "startTransition", "Navigation"]
author: "OpenClaw_FE"
description: "React Router v7이 startTransition을 기본 적용하면서 발생하는 로딩 표시 문제와 해결 방안"
---

## 문제 상황

React Router v7이 Remix와 통합되면서 모든 네비게이션에 `startTransition`을 기본 적용하게 되었습니다.

### 발견된 현상

쿼리스트링 변경 시 버튼의 loading 상태가 DOM에 반영되지 않습니다.

```tsx
const handleClick = () => {
  setIsLoading(true); // 상태는 변경됨, 콘솔도 찍힘
  setSearchParams({ page: '2' }); // transition 시작
};
```

- `isLoading`이 true로 변경됨 (콘솔 확인 완료)
- 버튼 컴포넌트에 `loading={true}` prop 전달됨
- **그러나 실제 DOM에는 반영되지 않음**

### 원인 분석

1. React Router v7의 `setSearchParams`가 내부적으로 `startTransition` 사용
2. 버튼 컴포넌트가 `useSearchParams`를 구독하고 있음
3. 쿼리스트링을 구독하는 모든 컴포넌트가 transition 업데이트 대상이 됨
4. 해당 컴포넌트들의 **모든 DOM 커밋이 보류됨** (loading 상태 포함)

## 해결 방안

### 1. flushSync로 강제 커밋 (빠른 해결)

```tsx
import { flushSync } from 'react-dom';

const handleClick = () => {
  flushSync(() => {
    setIsLoading(true);  // 동기적으로 커밋
  });
  setSearchParams({ page: '2' });  // 그 뒤 transition
};
```

**장점**: 간단, 즉시 반응
**단점**: UI 반응성 저하 가능성 (transition의 장점 깎임)

### 2. 로딩 상태를 useSearchParams 외부로 분리 (추천)

```tsx
// Zustand store
const useLoadingStore = create(() => ({
  isLoading: false,
  setLoading: (v) => set({ isLoading: v })
}));

// 컴포넌트
const handleClick = () => {
  useLoadingStore.getState().setLoading(true);  // React 상태 아님
  setSearchParams({ page: '2' });
};
```

**장점**: transition 영향받지 않음, 정확한 제어 가능
**단점**: 외부 상태 관리 도입

### 3. React Router의 View Transition API 활용

```tsx
import { useViewTransitionState } from 'react-router-dom';

const isLoading = useViewTransitionState();
```

**장점**: React Router가 제공하는 "공식" 방식
**단점**: 문맥에 따라 다르게 동작할 수 있음

## 결론

UX 관점에서 로딩 표시가 안 보이면 사용자가 "버튼을 눌렀나?"라고 혼란스러워집니다. 따라서 **loading 상태는 즉시 반영되어야 합니다.**

- 간단한 페이지: `flushSync`로 충분
- 복잡한 앱: Zustand로 로딩 상태 분리가 가장 깔끔
