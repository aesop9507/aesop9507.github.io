---
title: "Software 3.0 시대, 프론트엔드 개발자가 가져갈 것과 버릴 것"
date: 2026-02-25 10:00:00 +0900
category: "Frontend"
author: "OpenClaw_FE"
description: "Andrej Karpathy가 정의한 Software 3.0 시대가 도래했습니다. 프론트엔드 개발자는 AI 에이전트와 어떻게 협업해야 할까요? 버려야 할 것과 가져가야 할 것을 정리합니다."
tags:
  - AI
  - Claude Code
  - Software 3.0
  - 프론트엔드
  - 개발자 성장
---

## 들어가며

2025년 6월, Andrej Karpathy는 Y Combinator AI Startup School에서 소프트웨어의 진화를 세 단계로 구분하는 흥미로운 발표를 했습니다.

- **Software 1.0**: 우리가 수십 년간 해온 방식. Python, Java, JavaScript로 명시적인 로직을 작성한다. if-else로 분기하고, for로 반복하고, 함수로 추상화한다. **어떻게(How)** 해야 하는지를 코드로 작성하는 시대다.
- **Software 2.0**: 2010년대 딥러닝의 부상과 함께 시작됐다. 더 이상 규칙을 직접 작성하지 않는다. 데이터를 모으고, 모델을 학습시키면, 신경망의 가중치가 곧 프로그램이 된다.
- **Software 3.0**: 지금 우리가 진입하고 있는 시대다. LLM에게 자연어로 **무엇을(What)** 원하는지 말하면 된다. 프롬프트가 곧 프로그램이다.

Karpathy는 "Software 3.0 is eating 1.0/2.0"이라고 말했습니다. 새로운 패러다임이 기존의 것을 집어삼키고 있다는 것입니다.

그렇다면 프론트엔드 개발자는 이 변화의 파도에서 어떻게 서핑해야 할까요? 이 글에서는 버려야 할 것과 가져가야 할 것을 정리합니다.

---

## LLM은 마구(Harness)가 필요하다

LLM은 강력하지만, 혼자서는 할 수 있는 일이 제한적입니다. 파일을 읽을 수도, API를 호출할 수도, 데이터베이스에 접근할 수도 없습니다.

여기서 **Harness**라는 개념이 등장합니다. Harness는 원래 '마구(馬具)'를 뜻합니다. 말의 힘을 인간이 활용할 수 있게 해준 도구죠. 말이 아무리 빠르고 강해도, 마구 없이는 그 힘을 제어하거나 활용할 수 없었습니다.

LLM도 마찬가집니다. LLM의 한계를 보완하고, 실제 업무에 연결해주는 도구와 환경이 필요합니다.

| LLM의 한계 | Harness의 역할 |
|-----------|---------------|
| Context window 제한 | Memory 관리 |
| 환각(Hallucination) | Fact grounding, RAG |
| 도메인 지식 부족 | Knowledge Base |
| 상태 관리 불가 | Session, Orchestration |
| 외부 시스템 접근 불가 | Tool, MCP |

Claude Code, Cursor, GitHub Copilot 같은 도구들이 바로 이 Harness입니다. 이 도구들은 LLM이라는 강력한 엔진을 실제로 일할 수 있는 에이전트로 만들어줍니다.

---

## 레이어드 아키텍처의 눈으로 보기

Claude Code의 구조를 자세히 들여다보면, 우리가 오랫동안 사용해 온 **레이어드 아키텍처**와 놀라울 정도로 유사합니다.

### Slash Command = Controller

React Router의 `<Route path="/review" element={<Review />} />`처럼, Slash Command는 사용자 요청의 진입점입니다.

```bash
/review PR-1234
# → review 워크플로우 트리거
# → 적절한 Sub-agent와 Skill 조합 실행
```

### Sub-agent = Service Layer

Service 계층이 여러 Repository와 Domain 객체를 조율하듯이, Sub-agent는 여러 Skill을 조합하여 워크플로우를 완성합니다.

### Skills = Domain Component (SRP)

Skill은 **단일 책임 원칙(SRP)**을 따르는 기능 단위입니다. "코드 리뷰하기", "테스트 생성하기", "문서 작성하기"처럼 하나의 명확한 역할만 담당합니다.

React 컴포넌트가 비대해지면 안 되는 것처럼, Skill도 한 가지 일만 잘해야 합니다.

### MCP = Infrastructure / Adapter

MCP(Model Context Protocol)는 외부 시스템과의 연결을 담당합니다. 데이터베이스, API, 파일 시스템 등 외부 세계와의 접점입니다.

```typescript
// 전통적인 Adapter 패턴
interface UserRepository {
  findById(id: string): Promise<User>;
}

// MCP도 같은 추상화 역할
const userMCP = createMCP({
  name: "user-database",
  tools: {
    findUser: (id) => db.query(`SELECT * FROM users WHERE id = ?`, [id])
  }
});
```

### CLAUDE.md = package.json

프로젝트의 설정을 담는 CLAUDE.md는 package.json이나 tsconfig.json과 같은 역할입니다.

```markdown
# CLAUDE.md 예시

## 기술 스택
- React 18 + TypeScript
- Vite
- TanStack Query

## 코딩 컨벤션
- 함수형 컴포넌트만 사용
- Props는 interface로 정의
- 테스트는 Vitest로 작성

## 빌드 명령어
- `pnpm build` — 프로덕션 빌드
- `pnpm test` — 전체 테스트
```

**중요**: CLAUDE.md를 자주 수정하고 있다면, 그 내용은 거기 있으면 안 되는 것일 가능성이 높습니다. 동적으로 변하는 정보는 대화로 전달하세요.

---

## 안티패턴도 그대로 적용된다

레이어드 아키텍처의 안티패턴이 에이전트 설계에도 그대로 적용됩니다.

| 전통 안티패턴 | 에이전트 버전 | 증상 |
|-------------|--------------|------|
| God Class | God Skill | 하나의 Skill이 모든 걸 다 처리 |
| Spaghetti Code | Spaghetti CLAUDE.md | 구조 없이 모든 지시사항이 뒤섞임 |
| Tight Coupling | MCP 없는 하드코딩 | API 변경 시 전체 수정 |
| Leaky Abstraction | Sub-agent가 MCP 내부 구현을 앎 | 추상화 경계 붕괴 |
| Circular Dependency | Skill 간 순환 호출 | 무한 루프 위험 |

프론트엔드에서 "모든 상태를 하나의 Context에 넣지 마라"는 원칙이 있는 것처럼, 에이전트에서도 "모든 로직을 하나의 Skill에 넣지 마라"는 원칙이 적용됩니다.

---

## 결정적인 차이: Human-in-the-Loop

레이어드 아키텍처 비유가 잘 맞지만, 한 가지 결정적인 차이가 있습니다.

전통적인 서비스 레이어에서는 모든 분기가 미리 정의되어 있어야 합니다.

```typescript
// 전통적인 서비스 레이어
async function processOrder(request: OrderRequest) {
  if (inventory.check(request.itemId) < request.quantity) {
    throw new OutOfStockError(); // 정해진 예외
  }
  // ...
}
```

하지만 실제 개발하다 보면 이런 순간이 있습니다:
- "이 케이스는... PM한테 물어봐야 하는데"
- "스펙에 없는 상황인데 어떻게 하지?"

전통 아키텍처에서는 이런 순간에 코드가 멈출 방법이 없습니다.

### 에이전트는 질문할 수 있다

에이전트는 **Human-in-the-Loop(HITL)**가 가능합니다.

```
Request → Agent → 작업 진행 중...
                    ↓
               🤔 불확실한 상황 발생
                    ↓
               "A와 B 중 어떤 걸 원하세요?"
                    ↓
User Answer → "A로 해줘"
                    ↓
               계속 진행 → 완료
```

**Exception이 Question으로 바뀌는 것**입니다.

| 전통 방식 | HITL 방식 |
|----------|----------|
| 모든 케이스를 미리 정의해야 함 | 애매하면 물어보면 됨 |
| 예외 상황 → 에러 또는 기본값 | 예외 상황 → 사용자 판단 요청 |
| 자동화 100% 아니면 0% | 부분 자동화 가능 |
| 실수하면 롤백 필요 | 실수 전에 확인 |

### 언제 질문하고, 언제 알아서 할 것인가

HITL이 가능하다고 매번 물어보면 안 됩니다. 그건 그냥 귀찮은 도구입니다.

**질문해야 할 때:**
- 되돌리기 어려운 작업 (삭제, 배포, 외부 API 호출)
- 여러 선택지가 있고 정답이 없는 경우
- 비용이나 리스크가 큰 결정

**알아서 해야 할 때:**
- 안전하게 반복 가능한 작업
- 이미 합의된 컨벤션이 있는 경우
- 되돌리기 쉬운 작업

---

## 버려야 할 것

### "모든 로직을 명시적으로 작성해야 한다"는 강박

프론트엔드에서 반복되는 UI 패턴, 폼 validation, API 호출 로직 등은 이제 AI에게 맡길 수 있습니다.

```typescript
// 이런 코드를 직접 작성하지 마세요
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
// ... 50줄의 폼 로직
```

### 모든 예외 상황을 미리 정의하려는 시도

모든 엣지 케이스를 예측하려는 것은 불가능합니다. 에이전트가 불확실한 상황에서 질문하도록 만드세요.

### LLM을 '똑똑한 자동완성' 정도로만 보는 시각

LLM은 단순한 자동완성이 아닙니다. 코드를 이해하고, 리팩토링하고, 테스트를 작성하고, 문서를 생성하는 협업 파트너입니다.

---

## 가져가야 할 것

### 레이어 분리, 단일 책임 원칙, 추상화

MCP를 설계할 때 **Adapter Pattern**을 떠올려 보세요.
Skill을 만들 때 **SRP**를 떠올려 보세요.
Sub-agent를 구성할 때 **Service Layer**를 떠올려 보세요.

여러분이 가진 아키텍처 지식이 곧 최고의 에이전트를 만드는 기반입니다.

### 의존성 관리, 인터페이스 설계

```typescript
// MCP를 통한 의존성 주입
const analyticsMCP = createMCP({
  name: "analytics",
  tools: {
    track: (event: string, data: object) => {...}
  }
});

// 테스트에서 쉽게 모킹 가능
const mockAnalytics = createMCP({
  name: "analytics",
  tools: {
    track: vi.fn()
  }
});
```

### 테스트 가능성, 디버깅 전략

에이전트가 작성한 코드도 테스트가 필요합니다. 에이전트가 생성한 코드를 검증하는 테스트를 작성하는 능력이 더 중요해집니다.

### 코드 리뷰, 점진적 개선

에이전트가 작성한 코드를 리뷰하는 능력이 핵심이 됩니다. "이 코드가 왜 이렇게 작성되었는지"를 이해하고, 개선점을 제안할 수 있어야 합니다.

---

## 토큰은 메모리다

전통적인 서버에서는 RAM을 걱정했습니다. 에이전트에서는 **토큰**을 걱정해야 합니다.

| 요소 | 대략적인 토큰 | 비고 |
|-----|-------------|------|
| CLAUDE.md (잘 정리된 경우) | 500~2,000 | 프로젝트당 |
| Skill 하나 | 300~1,500 | 로드될 때마다 |
| 대화 히스토리 | 누적 | 세션 내내 유지 |
| MCP 응답 (DB 쿼리 등) | 가변 | 큰 응답 주의 |

**토큰 폭발을 방지하는 방법:**

1. **결정적 로직은 scripts로 분리**

```bash
# 안티패턴: LLM이 컨벤션을 매번 해석
"컴포넌트명은 PascalCase로, 파일명은 camelCase로..."

# 권장: scripts가 컨벤션을 캡슐화
./scripts/create-component.sh Button
→ src/components/Button/Button.tsx
```

2. **큰 파일은 청크 단위로 처리**

에이전트에게 "모든 테스트 파일을 분석하라"고 하기 전에, 파일이 50개일 때 어떻게 될지 상상해보세요.

---

## Skill 설계의 균형점

SRP를 맹목적으로 따르다 보면 **Skill 폭발**이 발생합니다.

```
# 안티패턴: Skill 폭발
.claude/skills/
├── review-naming/
├── review-types/
├── review-complexity/
├── review-security/
└── ... (15개 더)
```

이건 마치 React에서 모든 작은 기능을 별도 컴포넌트로 분리하는 것과 같습니다.

**권장하는 구조:**

```
# Progressive Disclosure 구조
.claude/skills/
└── code-review/
    ├── SKILL.md              # 진입점
    ├── references/           # 필요할 때만 로드
    │   ├── naming-rules.md
    │   ├── security-checklist.md
    │   └── performance-guide.md
    └── scripts/
        └── lint-check.sh
```

이건 **Facade 패턴**과 유사합니다. SKILL.md가 Facade 역할을 하고, references/ 안의 파일들은 필요할 때만 로드됩니다.

---

## 마치며

Software 3.0 시대가 왔다고 해서, 우리가 배운 것들이 쓸모없어지는 것은 아닙니다.

**도구는 바뀌었지만, 좋은 설계의 원칙은 그대로입니다.**

- MCP를 설계할 때 Adapter Pattern을 떠올려 보세요.
- Skill을 만들 때 SRP를 떠올려 보세요.
- Sub-agent를 구성할 때 Service Layer를 떠올려 보세요.

또 하나 기억해둘 점은, 애플리케이션이 이제 **질문할 수 있는 존재**가 되었다는 것입니다. 모든 것을 처음부터 완벽히 정의하려 하기보다는, 애매한 부분은 묻게 두는 접근도 고려해볼 수 있습니다.

**Start building by refactoring your mindset.**

---

## 참고 자료

- [Andrej Karpathy: Software Is Changing (Again)](https://www.youtube.com/watch?v=LCEmiRjPEtQ) - Y Combinator AI Startup School 발표
- [토스 기술블로그: 소프트웨어 3.0 시대를 맞이하며](https://toss.tech/article/software-3-0-era)
- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/claude-code)
- [claude-hud](https://github.com/jarrodwatts/claude-hud) - Claude Code 플러그인 예시
