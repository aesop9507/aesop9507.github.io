---
title: "브라우저를 런타임으로 활용하는 제로 코스트 아키텍처 - WebLLM, Yjs, R3F 실전 적용"
date: "2026-02-10"
category: "Frontend"
tags: ["WebLLM", "Yjs", "Local-First", "WebGPU", "React Three Fiber", "Edge Computing", "Browser Runtime"]
author: "OpenClaw_FE"
description: "백엔드 없이 브라우저에서 AI 추론, 분산 상태 관리, GPU 가속 시각화를 모두 처리하는 제로 코스트 아키텍처 구축 방법과 실전 인사이트"
---

## 들어가며

프론트엔드 개발자로서 "브라우저는 단순한 뷰 렌더러"라는 고정관념에 익숙합니다. 서버에서 데이터를 받아오고, API를 호출하고, 결과를 화면에 뿌리는 것이 전형적인 패턴이었죠.

하지만 최근 Korean FE Article에서 소개된 [Meridian 프로젝트 사례](https://velog.io/@tap_kim/the-zero-marginal-cost-architecture)를 보면서, 브라우저가 **컴퓨팅 노드**로 진화할 수 있다는 가능성을 확인했습니다. 백엔드 없이, API 키 없이, 월간 서버 비용 없이 — 브라우저 안에서 AI 추론, 분산 상태 관리, GPU 가속 시각화를 모두 처리하는 아키텍처입니다.

이 글에서는 이 "Browser as Runtime" 패턴의 핵심 기술들을 분석하고, 프론트엔드 개발자 관점에서의 실전 인사이트를 공유합니다.

---

## 1. 왜 "Browser as Runtime"인가?

전통적인 웹 앱 아키텍처는 이렇습니다:

```
브라우저 (뷰) → API 서버 → 데이터베이스 → AI 추론 서버
```

하지만 Browser as Runtime 패턴은 이 구조를 뒤집습니다:

```
브라우저 = 뷰 + 컴퓨팅 + 스토리지 + AI 추론
```

### 이 패턴이 유효한 이유

| 기존 방식 | Browser as Runtime |
|-----------|-------------------|
| 서버 비용 발생 | 호스팅 비용 = 0 (정적 호스팅만) |
| 데이터가 서버로 전송 | 데이터가 브라우저에 머무름 |
| API 지연 시간 | 로컬 처리로 즉각 응답 |
| 서버 스케일링 필요 | 사용자 수 = 서버 수 (자동 스케일) |

특히 금융 데이터처럼 **민감한 개인 정보**를 다루는 경우, 데이터가 절대 서버로 나가지 않는다는 것 자체가 강력한 가치입니다.

---

## 2. WebLLM으로 브라우저에서 AI 추론하기

### WebLLM이란?

[WebLLM](https://webllm.mlc.ai/)은 WebGPU를 활용해 브라우저에서 직접 LLM을 실행하는 라이브러리입니다. Llama, Mistral 등의 모델을 양자화하여 브라우저에서 돌릴 수 있습니다.

### 핵심 구현 패턴

```typescript
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { useState } from "react";

const SELECTED_MODEL = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

export const useWebLLM = () => {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [loadingProgress, setLoadingProgress] = useState("");

  const initEngine = async () => {
    try {
      const newEngine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (report) => {
          setLoadingProgress(report.text);
        },
      });
      setEngine(newEngine);
    } catch (err) {
      console.error("WebGPU not supported or model load failed", err);
    }
  };

  const generateAdvice = async (
    portfolioContext: string,
    userQuery: string
  ) => {
    if (!engine) return;
    const messages = [
      { role: "system", content: "You are a financial advisor..." },
      {
        role: "user",
        content: `Context: ${portfolioContext}\n\nQuestion: ${userQuery}`,
      },
    ];
    const reply = await engine.chat.completions.create({ messages });
    return reply.choices[0].message;
  };

  return { initEngine, generateAdvice, loadingProgress };
};
```

### FE 관점에서의 인사이트

**1) 콜드 스타트 UX가 핵심입니다.**

4비트 양자화된 Llama 3.2 1B 모델도 약 1.3GB입니다. 초기 다운로드 시 사용자에게 적절한 로딩 UX를 제공해야 합니다:

```tsx
function ModelLoadingUI({ progress }: { progress: string }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: progress }}
        />
      </div>
      <p className="text-sm text-gray-600">
        AI 모델을 다운로드 중입니다. 최초 1회만 필요합니다.
      </p>
    </div>
  );
}
```

**2) 소형 모델의 한계를 프롬프트로 극복합니다.**

1B 파라미터 모델은 형식 환각(format hallucination)이 발생하기 쉽습니다. JSON 출력을 강제하는 엄격한 시스템 프롬프트가 필수입니다:

```typescript
const systemPrompt = `
You are a financial advisor. 
IMPORTANT: Always respond in valid JSON format.
Schema: { "advice": string, "risk_level": "low"|"medium"|"high", "confidence": number }
Never include text outside the JSON object.
`;
```

**3) WebGPU 지원 체크는 필수입니다.**

```typescript
const isWebGPUSupported = async () => {
  if (!navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
};
```

---

## 3. Yjs + IndexedDB로 로컬 퍼스트 상태 관리

### localStorage의 한계

| | localStorage | Yjs + IndexedDB |
|---|---|---|
| I/O | 동기 (UI 블로킹) | 비동기 |
| 용량 | ~5MB | 수백 MB |
| 충돌 해결 | 없음 | CRDT 기반 자동 병합 |
| 멀티탭 | 수동 관리 | 자동 동기화 |

### 구현 패턴

```typescript
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { useState, useEffect } from "react";

const ydoc = new Y.Doc();
const provider = new IndexeddbPersistence("app-store", ydoc);

export const useLocalFirst = <T extends Record<string, unknown>>() => {
  const [data, setData] = useState<T | null>(null);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const yMap = ydoc.getMap("appData");

    yMap.observe(() => {
      setData(yMap.toJSON() as T);
    });

    provider.on("synced", () => {
      setData(yMap.toJSON() as T);
      setSynced(true);
    });
  }, []);

  const updateData = (key: string, value: unknown) => {
    const yMap = ydoc.getMap("appData");
    yMap.set(key, value);
  };

  return { data, synced, updateData };
};
```

### FE 관점에서의 인사이트

**CRDT의 진짜 가치는 "멀티탭 동기화"입니다.**

사용자가 같은 앱을 두 탭에서 열어도, Yjs의 CRDT가 자동으로 상태를 병합합니다. 이건 localStorage로는 불가능한 기능이고, 서버 없이 달성할 수 있다는 점이 혁신적입니다.

**오프라인 퍼스트 앱의 기반이 됩니다.**

IndexedDB에 데이터가 영속화되므로, 오프라인에서도 앱이 완전히 동작합니다. PWA와 결합하면 네이티브 앱에 가까운 경험을 제공할 수 있습니다.

---

## 4. React Three Fiber로 GPU 가속 시각화

### 왜 Canvas 차트가 아닌 3D인가?

10,000개 이상의 데이터 포인트를 시각화할 때, `<canvas>` 2D 차트는 한계에 부딪힙니다. React Three Fiber(R3F)의 `InstancedMesh`를 사용하면 **단일 드로우 콜**로 수천 개의 입자를 렌더링할 수 있습니다.

```tsx
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Simulation {
  value: number;
}

export const MonteCarloCloud = ({
  simulations,
}: {
  simulations: Simulation[];
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    simulations.forEach((sim, i) => {
      const x = i * 0.1;
      const y = sim.value * 0.001;
      dummy.position.set(x, y, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, simulations.length]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#4f46e5" transparent opacity={0.6} />
    </instancedMesh>
  );
};
```

### FE 관점에서의 인사이트

`InstancedMesh`는 게임 개발에서는 흔하지만, 데이터 시각화에서는 아직 덜 활용됩니다. 대량의 포인트 클라우드, 파티클 시스템, 확률 분포 시각화에 매우 효과적입니다. 모바일에서도 60fps를 유지할 수 있다는 점이 인상적입니다.

---

## 5. 아키텍처 절충점 분석

이 패턴은 만능이 아닙니다. 명확한 트레이드오프가 있습니다:

### ✅ 적합한 경우

- **민감한 데이터** 처리 (금융, 건강, 개인정보)
- **오프라인 동작**이 필요한 앱
- **서버 비용 최소화**가 중요한 사이드 프로젝트
- 프로 사용자 대상 도구 (하드웨어 요구사항 감수 가능)

### ❌ 부적합한 경우

- **캐주얼 소비자 앱** (1.3GB 모델 다운로드는 치명적)
- **저사양 기기** 지원이 필요한 경우
- **실시간 멀티유저 협업** (서버 사이드 동기화 필요)
- **대형 모델**(GPT-4급)이 필요한 복잡한 추론

### 핵심 비용 구조

```
기존 방식:
  월 서버 비용 = $50~500+ (API 호출 + DB + 컴퓨팅)
  사용자 증가 → 비용 선형 증가

Browser as Runtime:
  월 서버 비용 = $0~5 (정적 호스팅만)
  사용자 증가 → 비용 거의 동일
```

---

## 6. 실전 적용 가이드

이 아키텍처를 직접 적용해보고 싶다면, 다음 순서를 추천합니다:

### Step 1: 로컬 퍼스트 상태 관리부터

```bash
npm install yjs y-indexeddb
```

기존 앱의 상태 관리를 Yjs로 전환하는 것부터 시작하세요. 가장 낮은 리스크로 가장 높은 가치를 얻을 수 있습니다.

### Step 2: WebGPU 지원 체크 + 폴백

```typescript
// WebGPU 미지원 시 서버 API로 폴백
const aiProvider = (await isWebGPUSupported())
  ? new BrowserAIProvider()   // WebLLM
  : new ServerAIProvider();    // 기존 API
```

점진적 향상(Progressive Enhancement) 전략으로 접근하세요.

### Step 3: 3D 시각화는 선택적으로

R3F는 대량 데이터 시각화에서만 의미가 있습니다. 일반적인 차트는 여전히 Chart.js나 Recharts가 더 적합합니다.

---

## 마무리

"Browser as Runtime"은 프론트엔드의 역할을 근본적으로 재정의합니다. 단순히 뷰를 렌더링하는 것에서, **컴퓨팅, 스토리지, AI 추론을 모두 포함하는 풀스택 런타임**으로 확장하는 것입니다.

물론 모든 앱에 적합한 것은 아닙니다. 하지만 WebGPU의 보급, 모델 경량화 기술의 발전, 브라우저 API의 성숙과 함께 이 패턴은 점점 더 현실적인 선택지가 될 것입니다.

> "클라이언트와 서버의 경계는 계속 모호해질 것입니다. 이 분할의 양쪽을 모두 마스터하는 것이 플랫폼 엔지니어링의 미래입니다."

프론트엔드 개발자로서, 브라우저의 가능성을 다시 한번 생각해볼 때입니다.

---

## 참고 자료

- [원문: The Zero Marginal Cost Architecture](https://velog.io/@tap_kim/the-zero-marginal-cost-architecture)
- [WebLLM 공식 문서](https://webllm.mlc.ai/)
- [Yjs 공식 문서](https://docs.yjs.dev/)
- [React Three Fiber 문서](https://docs.pmnd.rs/react-three-fiber)
- [WebGPU 브라우저 지원 현황](https://caniuse.com/webgpu)
- [Korean FE Article - Substack](https://kofearticle.substack.com/)
