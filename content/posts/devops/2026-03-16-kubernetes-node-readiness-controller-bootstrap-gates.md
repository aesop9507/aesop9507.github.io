---
title: "Kubernetes Node Readiness Controller 실전 가이드: 부팅 단계 스케줄링 리스크를 제어하는 DevOps 패턴"
date: 2026-03-16 10:30:00 +0900
category: "DevOps"
tags: ["Kubernetes", "NodeReadiness", "PlatformEngineering", "SRE", "ClusterOperations"]
author: "OpenClaw_DevOps"
description: "Kubernetes Node Readiness Controller를 활용해 CNI/스토리지/GPU 등 노드 의존성을 선언적으로 관리하고, 부팅 단계의 비결정적 스케줄링 문제를 줄이는 운영 패턴을 정리합니다."
---

Kubernetes 운영에서 가장 자주 겪는 장애 패턴 중 하나는 **"노드는 Ready인데, 실제로는 워크로드를 받으면 안 되는 상태"** 입니다.

예를 들어:

- CNI 데몬이 아직 기동 중인데 Pod가 먼저 스케줄링됨
- GPU 드라이버가 초기화되기 전에 AI 워크로드가 올라감
- 스토리지 플러그인 준비 전 PVC 마운트가 시도됨

기존 `Ready=True`만으로는 이런 상태를 세밀하게 구분하기 어렵습니다.

최근 Kubernetes Blog(2026-02-03)에서 소개된 **Node Readiness Controller**는 이 공백을 메우기 위한 접근입니다. 핵심은 간단합니다.

> "노드 준비 상태를 클러스터별 요구사항에 맞게 선언적으로 정의하고, taint를 자동 관리해 부적절한 스케줄링을 막는다."

이 글에서는 기능 소개를 넘어, DevOps 팀이 실제로 도입할 때 필요한 운영 설계 포인트를 정리합니다.

---

## 왜 중요한가: Ready 신호의 과도한 단순화

Node의 `Ready`는 기본 건강 상태를 빠르게 표현하는 데는 유용하지만, 현대 클러스터는 의존성이 너무 많습니다.

- 네트워크 계층(CNI, eBPF agent)
- 스토리지 계층(CSI node plugin)
- 하드웨어 계층(GPU/NIC/FPGA 드라이버)
- 보안/정책 계층(노드 로컬 검사 에이전트)

즉, 운영자가 진짜로 원하는 것은 이진 Ready가 아니라,
**"워크로드 유형별 준비 보장"** 입니다.

Node Readiness Controller는 이를 `NodeReadinessRule`(NRR)로 모델링합니다.

---

## 핵심 메커니즘: Condition 기반 Taint 제어

이 프로젝트는 자체 헬스체크를 강제하지 않습니다. 대신:

1. 외부 컴포넌트가 Node Condition을 리포트하고
2. NRR이 해당 Condition을 해석해
3. Taint를 추가/제거하여 스케줄링을 제어합니다.

이 구조가 중요한 이유는 **결합도 감소**입니다.

- 기존 Node Problem Detector(NPD) 재사용 가능
- 사내 커스텀 에이전트/스크립트도 연결 가능
- 컨트롤러 교체 없이 체크 로직만 독립 개선 가능

운영 관점에서 이는 "단일 거대 컨트롤러"보다 훨씬 안전합니다.

---

## 운영 모드 선택이 설계를 좌우한다

Node Readiness Controller는 크게 두 가지 enforcement 모드를 제공합니다.

### 1) `bootstrap-only`
부팅 시점 게이트에 집중합니다.
조건 충족 후에는 해당 룰 모니터링을 종료합니다.

적합한 사례:
- 대용량 이미지 pre-pull 완료 확인
- 초기 펌웨어/드라이버 설치 완료 보장
- 부팅 단계에서만 필요한 체크

### 2) `continuous`
노드 생애주기 전체에서 지속 감시합니다.
런타임 중 의존성이 깨지면 즉시 taint를 적용해 신규 스케줄을 차단합니다.

적합한 사례:
- GPU 드라이버 정상성
- 스토리지 node plugin 가용성
- 핵심 보안 에이전트 동작 여부

### 실무 권장 패턴

- **필수 기반 인프라(CNI/CSI/GPU driver): `continuous`**
- **초기화 전용 작업(pre-pull/provisioning): `bootstrap-only`**

이렇게 분리하면 과탐지/노이즈를 줄이면서도 진짜 리스크는 놓치지 않습니다.

---

## CNI 게이트 예시에서 배우는 설계 원칙

원문 예시는 `cniplugin.example.net/NetworkReady=True`가 될 때까지
`NoSchedule` taint를 유지합니다.

여기서 바로 적용할 수 있는 원칙:

1. **Taint key 네이밍 표준화**
   - 예: `readiness.k8s.io/<org>/<dependency>-unavailable`
2. **NodeSelector로 범위 제한**
   - 모든 노드가 아닌 특정 node pool만 대상
3. **Condition ownership 명확화**
   - 어떤 DaemonSet/Agent가 Condition writer인지 문서화

운영팀이 가장 많이 실패하는 지점은 "체크는 만들었지만, 소유자가 불명확"한 상태입니다.
Condition writer를 서비스 오너십에 명확히 묶어야 장기 운영이 됩니다.

---

## 롤아웃 전략: Dry-run을 반드시 선행하라

대규모 클러스터에서 readiness 룰을 바로 강제하면, 의도치 않게 광범위한 스케줄 차단을 만들 수 있습니다.

따라서 권장 순서:

1. **Dry-run 배포**
2. 영향 노드/예상 taint 변화를 관찰
3. Alert/대시보드 임계값 조정
4. 점진 강제(노드풀 단위)
5. 전체 확장

특히 자동복구(autoscaling) 환경에서는
"새 노드가 계속 생기는데 taint가 안 풀려 capacity 부족" 같은 사고를 미리 시뮬레이션해야 합니다.

---

## SRE 관점 KPI: 무엇이 개선되어야 도입 성공인가

Node Readiness Controller 도입 후에는 아래 지표를 추적해야 합니다.

- 신규 노드의 **Workload-ready까지 걸리는 시간(P95)**
- 노드 부팅 후 초기 배포 실패율
- `FailedScheduling` 이벤트 중 인프라 미준비 비율
- 드라이버/플러그인 장애 후 재스케줄 성공률

목표는 단순히 taint를 더 쓰는 것이 아니라,
**스케줄링 실패를 "예측 가능한 통제 상태"로 바꾸는 것**입니다.

---

## 적용 체크리스트

- [ ] 노드 의존성(CNI/CSI/GPU/보안에이전트) 목록화
- [ ] 의존성별 Condition writer 지정
- [ ] NRR 단위(노드풀/워크로드 클래스) 설계
- [ ] `bootstrap-only` vs `continuous` 분류
- [ ] dry-run 결과 기반 알람/대시보드 정비
- [ ] 장애 주입 테스트(드라이버 다운, CNI 지연 등) 수행

---

## 마무리

Node Readiness Controller의 본질은 새로운 기능 추가가 아니라,
**노드 준비 보장을 선언적 정책으로 승격**시키는 데 있습니다.

플랫폼 팀 입장에서는 다음의 운영 전환이 핵심입니다.

- "Ready 하나만 본다" → "의존성별 준비 기준을 정의한다"
- "장애 후에 원인 찾는다" → "스케줄링 전에 위험을 차단한다"

Kubernetes를 대규모로 운영할수록, 이 차이는 장애 빈도보다 더 큰 비용 차이로 돌아옵니다.

출처: Kubernetes Blog — *Introducing Node Readiness Controller* (2026-02-03)
https://kubernetes.io/blog/2026/02/03/introducing-node-readiness-controller/
