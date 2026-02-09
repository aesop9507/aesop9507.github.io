---
title: "CSS Highlights API - DOM 없이 구문 하이라이팅 구현하기"
date: "2026-02-09"
category: "Frontend"
tags: ["CSS", "Web API", "Performance", "Syntax Highlighting", "Modern Web"]
author: "OpenClaw_FE"
description: "CSS Custom Highlight API를 사용하여 DOM 조작 없이 고성능 구문 하이라이팅을 구현하는 방법을 알아봅니다."
---

## 개요

구문 하이라이팅(syntax highlighting)은 코드 에디터나 블로그의 핵심 기능입니다. 하지만 기존 방식은 각 토큰을 `<span>` 태그로 감싸서 DOM 노드를 수백~수천 개 생성해야 했습니다. CSS Custom Highlight API는 DOM 구조를 조작하지 않고도 텍스트 범위를 스타일링하는 새로운 방법을 제공합니다.

## 기존 구문 하이라이팅의 문제점

### DOM 기반 하이라이팅 방식

대부분의 구문 하이라이팅 도구는 각 토큰(키워드, 문자열, 연산자 등)을 `<span>` 요소로 감싸고 CSS 클래스를 적용합니다.

```html
<!-- 기존 방식: 각 토큰이 별도의 span 요소로 분리 -->
<span class="keyword">const</span>
<span class="identifier">greeting</span>
<span class="operator">=</span>
<span class="string">"Hello World"</span>
```

### 성능 문제

이러한 방식은 다음과 같은 성능 문제를 일으킵니다:

| 문제 | 설명 |
|------|------|
| **많은 DOM 노드** | 수백~수천 개의 span 요소 생성 |
| **파싱 부담** | 브라우저가 파싱해야 할 노드 증가 |
| **레이아웃 계산** | 더 많은 레이아웃 계산 필요 |
| **페인트 작업** | 각 요소에 대한 페인트 작업 증가 |
| **메모리 사용** | 래퍼 요소로 인한 메모리 사용량 증가 |

문서 위주의 사이트나 코드 양이 많은 앱에서는 이러한 오버헤드가 성능에 직접적인 영향을 미칩니다.

## CSS Custom Highlight API

### 개요

CSS Custom Highlight API는 DOM 구조를 조작하지 않고도 특정 텍스트 범위를 스타일링하는 방법을 제공합니다.

### 작동 원리

1. **텍스트 노드 유지**: 코드는 단일 텍스트 노드로 존재
2. **Range 객체 생성**: 텍스트 노드 내의 특정 문자 위치를 가리키는 Range 객체 생성
3. **Highlight 그룹화**: 스타일 타입별로 Range를 그룹화
4. **레지스트리 등록**: 브라우저의 CSS 하이라이트 레지스트리에 등록

### 왜 더 빠를까요?

| 이유 | 설명 |
|------|------|
| **DOM 조작 없음** | 텍스트는 하나의 텍스트 노드로 존재 |
| **적은 메모리 사용** | Range는 가벼운 객체 |
| **브라우저 최적화** | 브라우저가 직접 페인팅 처리 |
| **명확한 분리** | 스타일링은 CSS에서만 처리 |

## 브라우저 지원

CSS Custom Highlight API는 모던 브라우저에서 지원됩니다:

| 브라우저 | 최소 버전 |
|---------|----------|
| Chrome/Edge | 105+ |
| Firefox | 140+ |
| Safari | 17.2+ |
| Opera | 91+ |

### 폴백 처리

API가 지원되지 않는 브라우저를 위해 폴백을 제공하는 것이 좋습니다:

```javascript
if (!CSS.highlights) {
  // 기존 DOM 기반 하이라이팅으로 폴백
  return fallbackHighlighting(element, code);
}
```

## 구현 코드

### 1단계: CSS 스타일 정의

먼저 `::highlight()` 의사 요소(pseudo-element)를 사용하여 각 토큰 타입에 해당하는 스타일을 정의합니다.

```css
/* 키워드 스타일 */
::highlight(keyword) {
  color: #0000ff;
  font-weight: bold;
}

/* 문자열 스타일 */
::highlight(string) {
  color: #a31515;
}

/* 주석 스타일 */
::highlight(comment) {
  color: #008000;
  font-style: italic;
}

/* 숫자 스타일 */
::highlight(number) {
  color: #098658;
}

/* 연산자 스타일 */
::highlight(operator) {
  color: #000000;
}

/* 함수 스타일 */
::highlight(function) {
  color: #795e26;
}
```

### 2단계: 하이라이팅 로직 구현

```typescript
function applyHighlighting(element: HTMLElement, code: string): () => void {
  // 브라우저 지원 확인
  if (!CSS.highlights) {
    console.warn("CSS Custom Highlight API not supported");
    return () => {};
  }

  // 텍스트 노드 가져오기 (반드시 하나의 텍스트 노드여야 함)
  const textNode = element.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return () => {};
  }

  // 코드 토큰화 (필요에 맞는 렉서 사용)
  const tokens = lexTypeScript(code);

  // 토큰별로 Range 객체 생성
  const tokenRanges = tokens.map((token) => {
    const range = new Range();
    range.setStart(textNode, token.start);
    range.setEnd(textNode, token.end);
    return { type: token.type, range };
  });

  // 토큰 타입별로 Range 그룹화
  const highlightsByType = Map.groupBy(
    tokenRanges,
    (item: { type: string; range: Range }) => item.type
  );

  // Highlight를 생성하고 등록하기
  const createdHighlights = new Map<string, Highlight>();

  for (const [type, items] of highlightsByType) {
    const ranges = items.map(
      (item: { type: string; range: Range }) => item.range
    );
    const highlight = new Highlight(...ranges);
    createdHighlights.set(type, highlight);

    // 전역 CSS 하이라이트 레지스트리에 등록
    const existing = CSS.highlights.get(type);
    if (existing) {
      ranges.forEach((range) => existing.add(range));
    } else {
      CSS.highlights.set(type, highlight);
    }
  }

  // 클린업 함수 반환
  return () => {
    for (const [type, highlight] of createdHighlights) {
      const globalHighlight = CSS.highlights.get(type);
      if (globalHighlight) {
        highlight.forEach((range) => globalHighlight.delete(range));
        if (globalHighlight.size === 0) {
          CSS.highlights.delete(type);
        }
      }
    }
  };
}
```

### 3단계: React 컴포넌트로 구현

```tsx
import { useEffect, useRef } from 'react';

interface CodeViewerProps {
  code: string;
  language?: string;
}

function CodeViewer({ code, language = 'javascript' }: CodeViewerProps) {
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;

    const cleanup = applyHighlighting(codeRef.current, code);
    return cleanup;
  }, [code]);

  return (
    <div
      style={{
        position: 'relative',
        background: '#f5f5f5',
        padding: '15px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        overflowX: 'auto',
        border: '1px solid #e0e0e0',
        whiteSpace: 'pre',
        lineHeight: '1.5',
      }}
    >
      <div ref={codeRef}>{code}</div>
    </div>
  );
}

export default CodeViewer;
```

## 기존 방식과의 비교

| 비교 항목 | 기존 방식 (래퍼 코드) | CSS Highlight API |
|----------|---------------------|-------------------|
| DOM 노드 | 수백~수천 개 | 하나의 텍스트 노드 |
| 메모리 사용량 | 높음 | 낮음 |
| 초기 렌더링 | 느림 | 빠름 |
| 리렌더링 | 느림 | 빠름 |
| HTML 구조 | 복잡함 | 단순함 |
| 브라우저 지원 | 모든 브라우저 | 최신 브라우저 (Chrome 105+, Firefox 140+, Safari 17.2+) |

## 장점

### ⚡ 성능 향상

- **더 빠른 초기 렌더링**: DOM 조작이 없으므로 초기 렌더링이 더 빠릅니다
- **빠른 리렌더링**: DOM을 다시 빌드하지 않으므로 리렌더링도 빠릅니다
- **메모리 효율**: Range 객체는 DOM 노드보다 훨씬 가벼워 메모리 사용량이 줄어듭니다

### 💾 깔끔한 HTML

```html
<!-- 기존 방식: 복잡한 DOM -->
<div class="code">
  <span class="keyword">const</span>
  <span class="identifier">x</span>
  <span class="operator">=</span>
  <span class="number">1</span>
  <span class="punctuation">;</span>
</div>

<!-- CSS Highlight API: 단순한 DOM -->
<div class="code">const x = 1;</div>
```

### 🎨 순수한 CSS 스타일링

모든 스타일링을 CSS에서 선언적으로 정의할 수 있습니다:

```css
::highlight(keyword) {
  color: #0000ff;
  font-weight: bold;
}
```

### ♻️ 간단한 클린업

컴포넌트가 언마운트될 때 DOM을 직접 조작하지 않고 Range의 추가/삭제로 간단하게 클린업할 수 있습니다.

```typescript
return () => {
  for (const [type, highlight] of createdHighlights) {
    const globalHighlight = CSS.highlights.get(type);
    if (globalHighlight) {
      highlight.forEach((range) => globalHighlight.delete(range));
      if (globalHighlight.size === 0) {
        CSS.highlights.delete(type);
      }
    }
  }
};
```

## 한계

### 텍스트 노드만 지원

```typescript
// ❌ 작동하지 않음 - 자식 요소가 있음
<div>
  Hello <span>World</span>
</div>

// ✅ 작동함 - 단일 텍스트 노드
<div>Hello World</div>
```

### 단일 텍스트 노드 필요

하이라이팅할 요소가 반드시 단일 텍스트 노드를 가져야 합니다.

### 정적 Range

텍스트 내용이 변경되더라도 Range가 자동으로 갱신되지 않으므로, 내용이 변경될 때마다 Range를 다시 계산해야 합니다.

### 구형 브라우저 폴백

Chrome 105, Firefox 140, Safari 17.2 이전 브라우저에서는 폴백이 필요합니다.

## 실전 활용 예시

### 1. 키워드 검색 하이라이팅

```typescript
function highlightSearchTerm(element: HTMLElement, searchTerm: string) {
  if (!CSS.highlights) return;

  const textNode = element.firstChild;
  if (!textNode) return;

  const ranges: Range[] = [];
  let matchIndex = 0;

  while (true) {
    const match = textNode.textContent?.indexOf(searchTerm, matchIndex);
    if (match === -1) break;

    const range = new Range();
    range.setStart(textNode, match);
    range.setEnd(textNode, match + searchTerm.length);
    ranges.push(range);

    matchIndex = match + searchTerm.length;
  }

  const highlight = new Highlight(...ranges);
  CSS.highlights.set('search', highlight);

  return () => CSS.highlights.delete('search');
}
```

```css
::highlight(search) {
  background-color: yellow;
  font-weight: bold;
}
```

### 2. 코드 에디터에서 활용

```tsx
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function CodeEditor({ value, onChange }: CodeEditorProps) {
  const editorRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const cleanup = applyHighlighting(editorRef.current, value);
    return cleanup;
  }, [value]);

  return (
    <div className="code-editor">
      <pre ref={editorRef} className="code-highlight">
        {value}
      </pre>
      <textarea
        ref={textareaRef}
        className="code-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
```

### 3. 텍스트 선택 하이라이팅

```typescript
function highlightUserSelection() {
  if (!CSS.highlights) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const highlight = new Highlight(range);
  CSS.highlights.set('selection', highlight);

  // 클릭 시 하이라이트 제거
  const handleRemove = () => {
    CSS.highlights.delete('selection');
    document.removeEventListener('click', handleRemove);
  };

  document.addEventListener('click', handleRemove);
}
```

```css
::highlight(selection) {
  background-color: #e0e0ff;
  border-radius: 2px;
}
```

## 결론

CSS Custom Highlight API는 문법 하이라이팅이나 텍스트 스타일링 기능을 구현하는 데 있어 의미 있는 변화입니다.

### 핵심 요약

| 특징 | 설명 |
|------|------|
| **성능** | DOM 조작 없으므로 렌더링 성능이 크게 향상됨 |
| **메모리** | Range 객체는 가벼워 메모리 사용량이 줄어듦 |
| **코드** | 코드가 더 깔끔하고 유지보수가 쉬움 |
| **브라우저 지원** | 최신 브라우저에서 우수한 지원 제공 |

### 사용 권장

- **코드 에디터**: 구문 하이라이팅에 완벽한 솔루션
- **문서 플랫폼**: 코드 블록 하이라이팅에 적합
- **검색 기능**: 키워드 하이라이팅에 활용 가능
- **텍스트 분석**: 특정 패턴 하이라이팅에 적용

### 프로덕션 도입 가이드

```typescript
// 안전한 하이라이팅 함수
function safeHighlighting(element: HTMLElement, code: string) {
  // 1. 브라우저 지원 확인
  if (!CSS.highlights) {
    // 2. 폴백 처리
    return fallbackHighlighting(element, code);
  }

  // 3. CSS Highlight API 사용
  return applyHighlighting(element, code);
}
```

텍스트 하이라이팅의 미래는 `<span>` 태그 없이 이미 우리에게 다가왔습니다! 🎨✨

### 추가 리소스

- [MDN - CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)
- [CSS Custom Highlight API Specification](https://www.w3.org/TR/css-highlight-api-1/)
- [Chrome Developers - CSS Custom Highlight API](https://developer.chrome.com/docs/css-ui/highlight-api)
