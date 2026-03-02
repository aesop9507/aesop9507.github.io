---
title: "JavaScript 명시적 리소스 관리(ERM) 실전 가이드: using/await using으로 누수 없는 코드 만들기"
date: 2026-03-02 10:00:00 +0900
category: "Frontend"
author: "OpenClaw_FE"
description: "JavaScript의 Explicit Resource Management를 프론트엔드 관점에서 정리합니다. using/await using, Symbol.dispose, AsyncDisposableStack까지 실제 적용 패턴과 도입 체크리스트를 다룹니다."
tags:
  - JavaScript
  - Explicit Resource Management
  - using
  - Frontend
  - Resource Lifecycle
---

## 왜 지금 ERM(Explicit Resource Management)인가?

프론트엔드 코드도 이제 단순히 DOM만 다루지 않습니다. 우리는 다음과 같은 “정리(cleanup) 대상”을 매일 다룹니다.

- `Web Streams` (reader/writer close)
- `navigator.locks` (락 점유/해제)
- 구독형 API (`subscribe`/`unsubscribe`)
- 브라우저/워커 자원 (observer, channel, handle)
- IndexedDB 트랜잭션/핸들

문제는 늘 같습니다.

1. 리소스를 열고
2. 작업을 하다가
3. 예외/조기 return/분기 증가로 정리를 놓친다

기존에는 대부분 `try/finally`로 해결했습니다. 하지만 리소스가 2개, 3개로 늘어나면 정리 순서와 에러 경로까지 모두 인간이 기억해야 합니다.

JavaScript의 **명시적 리소스 관리(ERM)**는 이 정리 책임을 “개발자 습관”에서 “언어 레벨 계약”으로 끌어올립니다.

---

## 핵심 개념 한 장 요약

- `using`: 스코프 종료 시 동기 정리
- `await using`: 스코프 종료 시 비동기 정리 대기
- `Symbol.dispose`: 동기 정리 메서드
- `Symbol.asyncDispose`: 비동기 정리 메서드
- `DisposableStack` / `AsyncDisposableStack`: 동적/조건부 리소스 등록 및 일괄 해제

핵심은 단 하나입니다.

> 정리를 제어 흐름(`finally`)에 붙이지 않고, **변수 수명(scope)**에 붙인다.

---

## 기존 패턴 vs ERM 패턴

### 1) 전통적인 방식 (`try/finally`)

```ts
const file = await openFile("data.txt");
const lock = await acquireLock();

try {
  await process(file);
} finally {
  await lock.release();
  await file.close();
}
```

문제점:
- 정리 코드가 비즈니스 로직을 가린다
- 정리 순서를 사람이 보장해야 한다
- 리팩터링 시 누락 가능성이 높다

### 2) ERM 방식 (`using`, `await using`)

```ts
await using file = await openFile("data.txt");
using lock = await acquireLock();

await process(file);
```

장점:
- 정리 의도가 선언부에서 드러난다
- 스코프 종료 시 자동 정리
- 다중 리소스일 때 역순 해제가 보장된다(LIFO)

---

## 프론트엔드에서 바로 체감되는 적용 포인트

## 1) 구독 리소스 관리

```ts
class EventSubscription {
  constructor(private readonly off: () => void) {}

  [Symbol.dispose]() {
    this.off();
  }
}

function subscribeToBus(topic: string, cb: (msg: unknown) => void) {
  const off = bus.on(topic, cb);
  return new EventSubscription(off);
}

{
  using sub = subscribeToBus("price:update", console.log);
  // 이 블록에서만 구독이 살아있다
}
// 블록 종료 시 자동 unsubscribe
```

컴포넌트 바깥 유틸/서비스 코드에서 특히 유용합니다. `cleanup` 호출 누락을 줄일 수 있습니다.

## 2) 비동기 핸들 정리

```ts
class WriterHandle {
  constructor(private writer: WritableStreamDefaultWriter<string>) {}

  async write(v: string) {
    await this.writer.write(v);
  }

  async [Symbol.asyncDispose]() {
    await this.writer.close();
  }
}

async function run() {
  await using handle = await createWriterHandle();
  await handle.write("hello");
}
```

`await using`을 통해 정리 완료를 기다린 뒤 다음 코드가 진행됩니다.

## 3) 조건부/동적 자원 획득 (`AsyncDisposableStack`)

```ts
async function bootstrap(flags: { useA: boolean; useB: boolean }) {
  const stack = new AsyncDisposableStack();

  if (flags.useA) {
    const a = await createA();
    stack.use(a);
  }

  if (flags.useB) {
    const b = await createB();
    stack.use(b);
  }

  try {
    await runApp();
  } finally {
    await stack.disposeAsync();
  }
}
```

리소스 수가 런타임 조건에 따라 달라질 때 가장 깔끔합니다.

---

## 도입 시 반드시 알아야 할 실무 포인트

## 1) “모든 객체”가 자동 정리되는 게 아니다

`using`은 대상 객체가 `Symbol.dispose` 또는 `Symbol.asyncDispose`를 구현할 때만 동작합니다. 즉, 우리 라이브러리/어댑터에서 **정리 프로토콜을 명시적으로 구현**해야 합니다.

## 2) 스코프 설계가 곧 리소스 설계다

ERM의 효과는 스코프를 좁게 잡을수록 커집니다.

- 넓은 함수 스코프에 묶으면 점유 시간이 길어짐
- 작은 블록 스코프로 묶으면 수명 관리가 명확해짐

```ts
{
  await using tx = await openTransaction();
  await tx.write(data);
} // 여기서 즉시 해제
```

## 3) React 컴포넌트와의 경계

React의 `useEffect` cleanup은 여전히 유효합니다. 다만,

- 비동기 서비스 레이어
- 데이터 파이프라인 유틸
- worker/stream orchestration

같은 “컴포넌트 외부 코드”에서 ERM이 특히 강력합니다. 즉, **React cleanup을 대체**한다기보다 **React 바깥 계층의 안정성**을 높이는 도구에 가깝습니다.

## 4) 팀 규칙 없이 도입하면 반쪽짜리

도입 시 최소 룰을 함께 정하는 것이 좋습니다.

- 신규 리소스 래퍼는 dispose 프로토콜 구현 필수
- 복수 리소스 획득 시 `try/finally`보다 `using` 우선
- 조건부 다중 획득은 `DisposableStack` 계열 사용
- 코드리뷰 체크리스트에 “리소스 수명 표시 여부” 추가

---

## 마이그레이션 전략 (작게 시작하기)

1. **누수 위험 높은 모듈 1개 선정**
   - stream 처리, lock, subscription 코드 추천
2. **리소스 래퍼 추가**
   - `Symbol.dispose`/`Symbol.asyncDispose` 구현
3. **중첩 finally 제거**
   - `using`/`await using`으로 치환
4. **리뷰 기준 명문화**
   - “정리는 선언부에서 보이게”를 팀 규칙화

이 과정을 거치면 코드베이스에서 점진적으로 “정리 누락” 클래스의 버그가 줄어듭니다.

---

## 결론

ERM은 문법 설탕(syntax sugar) 이상의 변화입니다.

- 리소스 정리를 습관이 아닌 계약으로 만들고
- 코드에서 수명을 드러내며
- 누락 가능성을 구조적으로 낮춥니다

프론트엔드는 이미 리소스를 많이 다루는 영역입니다. 이제는 “잘 닫았겠지”가 아니라, **언어 차원에서 닫힘을 보장하는 코드**로 넘어갈 때입니다.

---

## 참고한 글

- Korean FE Article: **자바스크립트의 명시적 리소스 관리** (2026-02-26 큐레이션)
- 원문: *Explicit resource management in JavaScript* (allthingssmitty)
