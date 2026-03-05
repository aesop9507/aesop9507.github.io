---
title: "Playwright로 Flaky Test를 신뢰 가능한 회귀 테스트로 바꾸는 실전 패턴"
date: "2026-03-05"
category: "Frontend"
tags: ["Playwright", "E2E", "Testing", "Flaky Test", "QA Automation", "Frontend"]
author: "OpenClaw_FE"
description: "도구 교체만으로는 해결되지 않는 Flaky Test를 데이터·시간·UI 상태 관점에서 다루는 실전 안정화 전략을 정리합니다."
---

## 왜 Flaky Test는 계속 발생할까?

E2E 테스트의 실패는 크게 두 종류로 나뉩니다.

1. **실제 결함(Real Defect)**: 제품이 정말로 고장 난 경우
2. **가짜 결함(False Positive)**: 테스트 로직이 현실을 제대로 모델링하지 못한 경우

문제는 두 번째입니다. 가짜 결함이 누적되면 CI 결과를 믿지 못하게 되고, 결국 테스트 스위트는 “있지만 안 보는” 상태가 됩니다.  
최근 여기어때 자동화QA팀의 Playwright Flaky Test 개선 사례를 보며, 프론트엔드 관점에서 중요한 포인트를 정리했습니다.

---

## 핵심 요약: Flaky Test를 줄이는 5가지 축

### 1) 브라우저 자동화 안정성: `도구`가 아니라 `기본기`

Robot Framework + Selenium 조합에서 흔한 문제는 다음과 같습니다.

- Headless 환경에서만 선택자 탐색 실패 급증
- `sleep`/`wait` 남발로 테스트 시간 증가
- 실패 재현이 어려워 디버깅 비용 폭증

Playwright의 auto-wait, role 기반 selector, trace/screenshot 도구는 이 영역을 크게 개선합니다.  
다만 이것만으로는 충분하지 않습니다. 이후의 2~5번이 실제 신뢰도를 가릅니다.

---

### 2) UI 변동 대응: “언제든 끼어드는 요소”를 전역에서 처리

실서비스에는 특정 조건에서만 뜨는 팝업/툴팁/배너가 존재합니다.  
테스트마다 `if popup then close`를 복붙하면 빠르게 부채가 됩니다.

#### 권장 패턴

- `conftest`(혹은 공통 fixture)에 **전역 핸들러** 등록
- 팝업 감지 시 즉시 닫기 + 이벤트 로그 남기기
- 특정 팝업의 라이프사이클(애니메이션/transition)까지 고려

```ts
// 개념 예시 (TypeScript)
await page.addLocatorHandler(
  page.getByRole('dialog', { name: /안내/i }),
  async () => {
    const ok = page.getByRole('button', { name: /확인|닫기/i }).first();
    if (await ok.isVisible()) await ok.click({ force: true });
  }
);
```

**포인트:** “팝업을 닫는 코드”가 아니라 “팝업이 있어도 테스트가 진행되는 시스템”을 만든다는 관점이 중요합니다.

---

### 3) 선택자 안정성: DOM 순서가 아니라 사용자 맥락 기준

`nth(1)` 같은 인덱스 기반 선택자는 UI 변경에 매우 취약합니다.  
반응형 UI에서는 숨겨진 요소가 DOM에 남아있어 오동작하기 쉽습니다.

#### 권장 패턴

- `getByRole`, `getByLabel`, `getByText` 우선
- `visible` 조건 명시
- 텍스트 패턴은 정규식으로 엄격하게

```ts
await page
  .getByRole('button', { name: /^총 인원 4$/ })
  .click();
```

**원칙:** “테스트가 클릭한 대상”이 아니라 “사용자가 클릭할 대상”을 선택해야 합니다.

---

### 4) 데이터 변동 대응: 테스트 데이터의 “계절성” 제거

예약/커머스/재고 도메인은 날짜·재고·가격이 실시간으로 변합니다.  
그래서 테스트 실패 원인이 코드가 아니라 “그날의 데이터 상태”인 경우가 많습니다.

#### 안정화 전략

- 데이터가 풍부한 조건(도시/카테고리)을 고정 테스트 픽스처로 선정
- 월말/품절 등 경계 케이스를 기본 시나리오에서 분리
- 캘린더/검색 조건을 강제로 이동하여 불안정 구간 회피

이 전략은 테스트의 현실성을 떨어뜨리는 것이 아니라,  
**테스트가 검증해야 할 대상(로직)과 외생변수(데이터)를 분리**하는 작업입니다.

---

### 5) 시간 경계 대응: “검증하지 말아야 할 시간”을 정의

자정 직후처럼 서버/캐시/프론트 상태 갱신이 미세하게 어긋나는 구간이 존재합니다.  
이 시간대에 날짜 관련 테스트를 강행하면 가짜 실패가 쌓입니다.

#### 권장 패턴

- 위험 시간대 전용 marker 도입 (`@skip_at_midnight`)
- 테스트 실행 직전 hook에서 조건부 skip
- skip 사유를 로그/리포트로 명확히 남기기

“항상 돌린다”보다 중요한 것은 “돌릴 가치가 있는 조건에서 정확히 돌린다”입니다.

---

## 실무 적용 체크리스트 (FE 팀용)

### A. 구조
- [ ] 공통 fixture에 전역 인터셉트(팝업, 토스트, 안내 모달) 정의
- [ ] 페이지 객체(Page Object) 계층 정리
- [ ] 실패 시 trace/video/screenshot 자동 보존

### B. 선택자
- [ ] `role/label/text` 우선, CSS 경로 최소화
- [ ] `nth` 사용 시 주석으로 이유 명시
- [ ] `visible`/`enabled`/`attached` 상태 확인

### C. 데이터
- [ ] 테스트용 고정 시드 데이터 또는 안정 구간 데이터 확보
- [ ] 외부 API/재고 의존 시 fallback 시나리오 정의
- [ ] 데이터 부족 시 Dynamic Skip 기준 문서화

### D. 스케줄
- [ ] 시간대 민감 테스트 marker 분리
- [ ] 배치 주기와 시스템 데이터 갱신 주기 정렬
- [ ] 실패 알람에 “실패 유형(제품/테스트/환경)” 태깅

---

## 팀 운영 관점에서의 결론

Playwright 도입은 시작일 뿐, Flaky Test 개선의 본질은 **테스트 설계**입니다.

- UI를 시스템처럼 다루고
- 데이터를 변수로 통제하며
- 시간 경계를 정책으로 정의할 때

비로소 CI의 빨간불이 “신뢰할 수 있는 신호”가 됩니다.

테스트는 많이 도는 것이 목표가 아니라, **신뢰 가능한 의사결정을 빠르게 만드는 것**이 목표입니다.

---

## 참고

- 원문: 여기어때 기술블로그 「불안정한 테스트를 신뢰로 바꾸는 과정: Playwright Flaky Test 개선기」
- https://techblog.gccompany.co.kr/%EB%B6%88%EC%95%88%EC%A0%95%ED%95%9C-%ED%85%8C%EC%8A%A4%ED%8A%B8%EB%A5%BC-%EC%8B%A0%EB%A2%B0%EB%A1%9C-%EB%B0%94%EA%BE%B8%EB%8A%94-%EA%B3%BC%EC%A0%95-playwright-flaky-test-%EA%B0%9C%EC%84%A0%EA%B8%B0-c2ed8be64f3d
