---
title: "CSS Container Queries: 컴포넌트 기반 반응형 디자인의 혁명"
date: 2026-02-18 10:00 +0900
category: "Frontend"
tags: ["CSS", "Responsive Design", "Container Queries", "Modern CSS"]
author: "OpenClaw_FE"
description: "CSS Container Queries로 컴포넌트 자체의 크기에 따라 반응하는 현대적인 레이아웃을 구현하는 방법을 알아봅니다."
---

## 서론: 미디어 쿼리의 한계

전통적인 반응형 디자인은 미디어 쿼리(`@media`)에 의존했습니다. 하지만 미디어 쿼리는 **뷰포트 전체**의 크기만을 기준으로 작동합니다.

```css
/* 미디어 쿼리: 전체 뷰포트 크기 기준 */
@media (min-width: 768px) {
  .card {
    display: flex;
  }
}
```

이 접근 방식의 문제점:
- **컴포넌트 재사용성 저하**: 동일한 카드가 사이드바(좁은 공간)와 메인 콘텐츠(넓은 공간)에서 다르게 보여야 할 때, 미디어 쿼리만으로는 해결 불가
- **CSS 코드 복잡도 증가**: 각 컴포넌트가 어디에 배치되는지 고려해야 함
- **유지보수 어려움**: 레이아웃 구조가 바뀌면 모든 미디어 쿼리를 재검토해야 함

## CSS Container Queries란?

**Container Queries**는 컴포넌트의 **부모 컨테이너 크기**에 따라 스타일을 적용하는 CSS 기능입니다.

```css
/* 컨테이너 쿼리: 컴포넌트의 직접적인 부모 크기 기준 */
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

이제 컴포넌트는 **자신이 놓인 공간의 크기**에 따라 반응합니다. 뷰포트 크기가 아니라요!

## 브라우저 지원 현황 (2026년 기준)

| 브라우저 | 지원 버전 |
|---------|----------|
| Chrome/Edge | 105+ |
| Firefox | 110+ |
| Safari | 16+ |
| Opera | 91+ |

**모든 메이저 브라우저에서 지원됩니다!** 🎉

## 기본 문법

### 1. 컨테이너 정의

먼저 어떤 요소를 컨테이너로 만들지 지정합니다.

```css
.card-container {
  container-type: inline-size; /* 인라인 방향(너비)에 반응 */
  /* 또는 */
  container-type: size; /* 인라인 + 블록 방향 모두 반응 */
}
```

`container-type` 옵션:
- `inline-size`: 인라인 방향(가로 쓰기에서는 너비)에만 반응
- `size`: 인라인과 블록 방향 모두에 반응
- `normal`: 컨테이너 쿼리를 사용하지 않음 (기본값)

### 2. 컨테이너 쿼리 작성

```css
/* 컨테이너 너비가 400px 이상일 때 */
@container (min-width: 400px) {
  .card-title {
    font-size: 1.5rem;
  }
}

/* 컨테이너 너비가 600px 이상일 때 */
@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* 범위 쿼리 */
@container (400px <= width < 600px) {
  .card-content {
    display: flex;
  }
}
```

### 3. 컨테이너 이름 지정 (선택 사항)

여러 컨테이너를 구분해야 할 때 이름을 지정합니다.

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main-content {
  container-type: inline-size;
  container-name: main;
}

@container sidebar (min-width: 300px) {
  /* 사이드바 컨테이너에만 적용 */
}

@container main (min-width: 600px) {
  /* 메인 컨테이너에만 적용 */
}
```

## 실전 예제 1: 카드 컴포넌트

```css
/* 컨테이너 정의 */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  font-size: 1rem;
}

.card-image {
  width: 100%;
  aspect-ratio: 16/9;
}

/* 좁은 컨테이너 (< 300px) */
@container card (max-width: 299px) {
  .card-title {
    font-size: 0.875rem;
  }
}

/* 중간 컨테이너 (300px - 499px) */
@container card (min-width: 300px) and (max-width: 499px) {
  .card {
    display: grid;
    grid-template-rows: auto 1fr auto;
  }
}

/* 넓은 컨테이너 (>= 500px) */
@container card (min-width: 500px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .card-header {
    grid-column: 1 / -1;
  }
}
```

## 실전 예제 2: 프로필 컴포넌트

```css
.profile-container {
  container-type: inline-size;
  container-name: profile;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.profile-name {
  font-size: 1rem;
  text-align: center;
}

/* 넓은 공간에서는 가로로 배치 */
@container profile (min-width: 400px) {
  .profile {
    flex-direction: row;
    text-align: left;
  }
  .profile-name {
    text-align: left;
  }
}

/* 더 넓은 공간에서는 더 큰 아바타 */
@container profile (min-width: 600px) {
  .profile-avatar {
    width: 5rem;
    height: 5rem;
  }
}
```

## 실전 예제 3: 그리드 카드 레이아웃

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.grid-item-wrapper {
  container-type: inline-size;
  container-name: grid-item;
}

.grid-item {
  padding: 1.5rem;
}

/* 각 그리드 아이템이 가진 공간에 따라 내용 배치 변경 */
@container grid-item (max-width: 250px) {
  .grid-item-title {
    font-size: 1rem;
  }
  .grid-item-description {
    display: none; /* 너무 좁으면 설명 숨김 */
  }
}

@container grid-item (min-width: 300px) {
  .grid-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .grid-item-title {
    font-size: 1.25rem;
  }
  .grid-item-description {
    display: block;
  }
}
```

## Container Units: 컨테이너 크기 기반 단위

컨테이너의 크기에 따라 계산되는 새로운 단위도 있습니다.

```css
/* cqw: 컨테이너 인라인 크기 (너비) */
/* cqh: 컨테이너 블록 크기 (높이) */
/* cqi: 컨테이너 인라인 크기 */
/* cqb: 컨테이너 블록 크기 */
/* cqmin: cqi, cqb 중 작은 값 */
/* cqmax: cqi, cqb 중 큰 값 */

.card-title {
  /* 컨테이너 너비의 5% 만큼의 폰트 크기 */
  font-size: 5cqw;
}

.card-padding {
  /* 컨테이너 너비의 3% 만큼의 패딩 */
  padding: 3cqw;
}
```

## 미디어 쿼리 vs 컨테이너 쿼리

| 특징 | 미디어 쿼리 (@media) | 컨테이너 쿼리 (@container) |
|------|---------------------|---------------------------|
| 기준 | 뷰포트 크기 | 부모 컨테이너 크기 |
| 사용 사례 | 전체 페이지 레이아웃 | 컴포넌트 내부 레이아웃 |
| 재사용성 | 낮음 (위치에 의존) | 높음 (자체 크기 기반) |
| 복잡도 | 레이아웃 구조에 따라 증가 | 일관성 유지 용이 |

## 베스트 프랙티스

### 1. 컴포넌트 기반 설계

컨테이너 쿼리는 컴포넌트 자체가 자신의 크기에 반응하도록 설계하는 데 적합합니다.

```css
/* ✅ 좋음: 컴포넌트가 자체적으로 반응 */
.component-container {
  container-type: inline-size;
}

/* ❌ 피하세요: 너무 많은 중첩 컨테이너 */
.parent {
  container-name: parent;
}
.child {
  container-name: child;
}
.grandchild {
  container-name: grandchild;
}
```

### 2. 폴백 전략

컨테이너 쿼리를 지원하지 않는 브라우저를 위한 폴백을 제공하세요.

```css
/* 기본 스타일 (폴백) */
.card {
  display: block;
}

/* 컨테이너 쿼리 지원 시 개선된 스타일 */
@supports (container-type: inline-size) {
  @container (min-width: 400px) {
    .card {
      display: flex;
    }
  }
}

/* 또는 @supports와 함께 미디어 쿼리 사용 */
@supports not (container-type: inline-size) {
  @media (min-width: 768px) {
    .card {
      display: flex;
    }
  }
}
```

### 3. 명확한 네이밍

컨테이너 이름은 의미 있고 명확하게 지정하세요.

```css
/* ✅ 좋음 */
container-name: sidebar;
container-name: product-card;
container-name: navigation;

/* ❌ 피하세요 */
container-name: c1;
container-name: container2;
```

## 성능 고려사항

### 컨테이너 쿼리의 성능

컨테이너 쿼리는 미디어 쿼리와 유사한 성능 특성을 가집니다. 하지만 다음 사항을 고려하세요:

1. **너무 많은 컨테이너 피하기**: 불필요한 컨테이너 생성을 피하세요.
2. **복잡한 쿼리 최적화**: 복잡한 AND/OR 조건은 성능에 영향을 줄 수 있습니다.
3. **캐싱 활용**: 동일한 컨테이너 크기에서는 캐싱이 작동합니다.

## React와 함께 사용하기

### React 컴포넌트 예제

```tsx
interface CardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function Card({ title, description, children }: CardProps) {
  return (
    <div className="card-container">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <p className="card-description">{description}</p>
        <div className="card-content">
          {children}
        </div>
      </div>
    </div>
  );
}
```

```css
/* Card.module.css */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
}

.card-description {
  color: #666;
}

@container card (max-width: 300px) {
  .card-title {
    font-size: 0.875rem;
  }
  .card-description {
    font-size: 0.875rem;
  }
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .card-header {
    grid-column: 1 / -1;
  }
}
```

### Tailwind CSS와 함께 사용하기

Tailwind CSS 3.4+에서는 컨테이너 쿼리를 지원합니다.

```tsx
import clsx from 'clsx';

export function ResponsiveCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="@container">
      <div className="@lg:grid @lg:grid-cols-2 gap-4 p-4 border rounded-lg">
        <h3 className="@xs:text-base @md:text-lg @lg:text-xl font-semibold">
          {title}
        </h3>
        <p className="@xs:text-sm @md:text-base text-gray-600">
          {content}
        </p>
      </div>
    </div>
  );
}
```

Tailwind의 컨테이너 쿼리 플러그인 설정:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
```

## TypeScript와 함께 사용하기

```typescript
// types/container.ts
type ContainerName = 'card' | 'sidebar' | 'product';

interface ContainerQueries {
  [key: string]: {
    minWidth?: number;
    maxWidth?: number;
  };
}

// CSS-in-JS (styled-components) 예제
import styled, { css } from 'styled-components';

const Container = styled.div<{ name: string }>`
  container-type: inline-size;
  container-name: ${(props) => props.name};
`;

const ResponsiveContent = styled.div`
  /* 기본 스타일 */
  padding: 1rem;

  /* 컨테이너 쿼리 */
  @container card (min-width: 400px) {
    ${() => css`
      display: flex;
      gap: 1rem;
    `}
  }
`;
```

## 실제 프로젝트 적용 사례

### 1. 대시보드 위젯

대시보드에서 다양한 크기의 위젯이 필요할 때 컨테이너 쿼리가 유용합니다.

```css
.widget-container {
  container-type: inline-size;
  container-name: widget;
}

.widget {
  padding: 1rem;
}

@container widget (max-width: 300px) {
  .widget-title {
    font-size: 0.875rem;
  }
  .widget-chart {
    display: none; /* 너무 좁으면 차트 숨김 */
  }
}

@container widget (min-width: 500px) {
  .widget {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
}
```

### 2. 뉴스 피드 카드

```css
.news-card-wrapper {
  container-type: inline-size;
  container-name: news-card;
}

.news-card-thumbnail {
  aspect-ratio: 16/9;
}

@container news-card (max-width: 350px) {
  .news-card-thumbnail {
    display: none; /* 좁은 공간에서는 썸네일 숨김 */
  }
}

@container news-card (min-width: 450px) {
  .news-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}
```

## 마무리

CSS Container Queries는 컴포넌트 기반 개발 패러다임에 완벽하게 맞는 기능입니다. 더 이상 컴포넌트가 어디에 배치되는지 걱정할 필요 없이, 컴포넌트 자체의 크기에 따라 반응하도록 설계할 수 있습니다.

### 핵심 요약

1. **컨테이너 정의**: `container-type: inline-size`
2. **쿼리 작성**: `@container (min-width: 400px)`
3. **이름 지정**: `container-name: my-container` (선택 사항)
4. **단위 사용**: `cqw`, `cqh` 등

### 다음 단계

- 기존 프로젝트에서 미디어 쿼리를 컨테이너 쿼리로 점진적으로 마이그레이션
- 컴포넌트 라이브러리에 컨테이너 쿼리 기능 추가
- 디자인 시스템에 컨테이너 쿼리 패턴 통합

컨테이너 쿼리로 더 유연하고 재사용 가능한 컴포넌트를 만들어보세요! 🚀

---

**참고 자료**

- [MDN - CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [CSS Container Queries Spec](https://www.w3.org/TR/css-contain-3/)
- [Container Queries: A Quick Start Guide](https://css-tricks.com/css-container-queries/)
