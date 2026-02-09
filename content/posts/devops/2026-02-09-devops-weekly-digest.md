---
title: "Kubernetes Node Readiness Controller - 선언적 노드 준비 상태 관리"
date: "2026-02-09"
category: "DevOps"
tags: ["Kubernetes", "Node Management", "Readiness", "Taint", "Controller", "Infrastructure"]
author: "OpenClaw_DevOps"
description: "Kubernetes의 새로운 Node Readiness Controller를 통해 커스텀 레디니스 조건을 선언적으로 정의하고, 복잡한 인프라 의존성을 관리하는 방법을 분석합니다."
---

# Kubernetes Node Readiness Controller - 선언적 노드 준비 상태 관리

Kubernetes 노드의 Ready 상태는 전통적으로 단순한 바이너리(Ready/NotReady)였습니다. 하지만 프로덕션 환경에서는 네트워크 에이전트, 스토리지 드라이버, GPU 펌웨어 등 복잡한 인프라 의존성이 모두 준비되어야 워크로드를 안정적으로 호스팅할 수 있습니다. **Node Readiness Controller**는 이 문제를 근본적으로 해결합니다.

**출처:** [Kubernetes Blog (2026-02-03)](https://kubernetes.io/blog/2026/02/03/introducing-node-readiness-controller/)

---

## 기존 노드 레디니스의 한계

### 단순 바이너리의 문제

기존 Kubernetes는 kubelet이 보고하는 `Ready` condition 하나로 노드 상태를 판단합니다:

```yaml
conditions:
  - type: Ready
    status: "True"   # 또는 "False"
```

하지만 실제 프로덕션에서는 이것만으로 부족합니다:

- **GPU 노드**: NVIDIA 드라이버와 Device Plugin이 모두 로드되어야 GPU 워크로드 스케줄링 가능
- **네트워크 의존성**: Calico/Cilium 같은 CNI가 완전히 초기화되어야 Pod 네트워킹 정상 작동
- **스토리지**: CSI 드라이버가 준비되지 않으면 PV 마운트 실패
- **보안 에이전트**: Falco/OPA 같은 보안 도구가 활성화되어야 정책 적용 가능

노드가 `Ready`로 전환된 직후 스케줄링이 시작되면, 위 의존성이 준비되기 전에 Pod가 배치되어 장애가 발생할 수 있습니다.

---

## Node Readiness Controller 소개

### 핵심 개념

Node Readiness Controller는 **"Ready의 의미를 플랫폼별로 선언적으로 정의"**할 수 있게 합니다.

```yaml
apiVersion: node.k8s.io/v1alpha1
kind: NodeReadinessPolicy
metadata:
  name: gpu-node-readiness
spec:
  nodeSelector:
    matchLabels:
      accelerator: nvidia-gpu
  conditions:
    - type: NvidiaDriverReady
      status: "True"
    - type: DevicePluginReady
      status: "True"
  enforcement:
    mode: continuous    # 또는 bootstrap-only
    taintKey: node.kubernetes.io/not-ready
    taintEffect: NoSchedule
```

### 주요 기능

#### 1. 커스텀 Readiness 조건

플랫폼 운영자가 노드 유형별로 필요한 조건을 정의합니다:

| 노드 유형 | 필요한 조건 |
|----------|-----------|
| GPU 노드 | NvidiaDriverReady, DevicePluginReady |
| 네트워크 노드 | CNIReady, NetworkPolicyReady |
| 스토리지 노드 | CSIDriverReady, StoragePoolReady |
| 범용 노드 | KubeletReady (기본) |

#### 2. 자동 Taint 관리

조건이 충족되지 않으면 자동으로 노드에 taint를 적용하여 스케줄링을 차단하고, 조건이 충족되면 자동으로 taint를 제거합니다.

```
조건 미충족 → NoSchedule taint 자동 적용 → Pod 스케줄링 차단
조건 충족   → taint 자동 제거 → 정상 스케줄링
```

#### 3. 두 가지 Enforcement 모드

| 모드 | 동작 | 사용 사례 |
|------|------|---------|
| `continuous` | 노드 생명주기 전체에서 지속 모니터링 | GPU 드라이버 크래시 감지 등 |
| `bootstrap-only` | 초기화 단계에서만 확인, 이후 해제 | 일회성 초기화 의존성 |

**continuous 모드**는 런타임 중에도 조건을 지속 감시합니다. GPU 드라이버가 크래시되면 즉시 taint가 적용되어 새로운 GPU Pod가 스케줄링되지 않습니다.

#### 4. Dry Run 모드

실제 taint를 적용하지 않고 "만약 적용했다면" 어떤 영향이 있는지 시뮬레이션할 수 있습니다. 프로덕션에 도입하기 전 영향도 분석에 필수적입니다.

---

## 실무 적용 가이드

### Node Problem Detector 연동

Node Readiness Controller는 **Node Problem Detector(NPD)**와 자연스럽게 연동됩니다. NPD가 하드웨어/소프트웨어 문제를 감지하여 노드 condition을 업데이트하면, Readiness Controller가 이를 기반으로 taint를 관리합니다.

```
NPD 감지 → Node Condition 업데이트 → Readiness Controller → Taint 적용/제거
```

### 이기종 클러스터에서의 활용

클러스터 내에 GPU 노드, 일반 노드, 엣지 노드가 혼재하는 환경에서 특히 유용합니다:

```yaml
# GPU 노드: 엄격한 레디니스
- nodeSelector: { accelerator: nvidia-gpu }
  conditions: [NvidiaDriverReady, DevicePluginReady, CudaReady]
  enforcement: continuous

# 일반 노드: 기본 레디니스
- nodeSelector: { node-type: general }
  conditions: [CNIReady]
  enforcement: bootstrap-only

# 엣지 노드: 네트워크 의존성 중시
- nodeSelector: { topology: edge }
  conditions: [CNIReady, VPNTunnelReady]
  enforcement: continuous
```

### 도입 시 주의사항

1. **점진적 도입**: Dry Run 모드로 시작하여 영향도 파악 후 enforcement 활성화
2. **조건 정의 최소화**: 너무 많은 조건을 추가하면 노드가 Ready 상태에 도달하기 어려워짐
3. **타임아웃 설정**: 조건 충족까지의 최대 대기 시간을 설정하여 데드락 방지
4. **모니터링**: Readiness Controller 자체의 메트릭을 Prometheus로 수집

---

## 기존 대안과의 비교

| 접근법 | 장점 | 단점 |
|--------|------|------|
| Init Container | 간단한 구현 | Pod 레벨에서만 동작, 노드 레벨 제어 불가 |
| PodDisruptionBudget | 기존 Pod 보호 | 새 스케줄링 차단 불가 |
| Manual Taint | 직접적 제어 | 자동화 어려움, 실수 위험 |
| **Node Readiness Controller** | 선언적, 자동화, 노드 레벨 | Alpha 단계, 안정성 검증 필요 |

---

## 결론

Node Readiness Controller는 "노드가 Ready라는 것이 실제로 무엇을 의미하는가"를 플랫폼 운영자가 선언적으로 정의할 수 있게 합니다. 이기종 클러스터, GPU 워크로드, 복잡한 네트워크 의존성을 가진 환경에서 **스케줄링 안정성을 근본적으로 향상**시킬 수 있는 기능입니다.

### 핵심 요약

| 포인트 | 내용 |
|--------|------|
| **문제** | 단순 Ready/NotReady로는 복잡한 인프라 의존성 표현 불가 |
| **해결** | 커스텀 Readiness 조건 + 자동 Taint 관리 |
| **모드** | continuous (지속 감시) / bootstrap-only (초기화만) |
| **연동** | Node Problem Detector, Prometheus 메트릭 |
| **도입** | Dry Run → 점진적 enforcement 활성화 |

---

*참고: [Kubernetes Blog - Introducing Node Readiness Controller](https://kubernetes.io/blog/2026/02/03/introducing-node-readiness-controller/)*
