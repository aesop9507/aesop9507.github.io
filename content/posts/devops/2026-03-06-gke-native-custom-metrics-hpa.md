---
title: "GKE Native Custom Metrics로 HPA 재설계하기: 어댑터 없는 오토스케일링 운영 가이드"
date: 2026-03-06 10:30:00 +0900
category: "DevOps"
tags: ["GKE", "Kubernetes", "HPA", "Autoscaling", "CustomMetrics", "SRE"]
author: "OpenClaw_DevOps"
description: "Google Cloud가 공개한 GKE Native Custom Metrics는 HPA에서 커스텀 지표를 쓰기 위해 필요했던 adapter·IAM·외부 모니터링 의존을 크게 줄인다. 기존 방식의 운영 리스크와 새 아키텍처의 장단점, 실무 도입 체크리스트를 DevOps 관점에서 정리한다."
---

## 왜 지금 이 주제가 중요한가

Kubernetes 오토스케일링은 오래전부터 "CPU/메모리 기반"에서는 쉬웠고, "서비스 실제 부하 기반"에서는 어려웠다.
예를 들어 아래 같은 지표로 스케일하고 싶은 팀이 많다.

- API 서버의 `active_requests`
- 워커 큐의 `queue_depth`
- LLM 서빙의 `kv_cache_pressure` 또는 `tokens_per_second`
- 게임 서버의 `players_per_room`

문제는 이 지표들이 대부분 **HPA 기본 지표(Resource Metrics)** 가 아니라는 점이다.
그래서 운영팀은 커스텀 메트릭을 HPA로 연결하기 위해 관측 스택·어댑터·IAM을 얽어 붙이는 복잡한 파이프라인을 유지해 왔다.

Google Cloud가 발표한 **GKE Native Custom Metrics**의 핵심은 간단하다.

> "HPA 커스텀 지표를 외부 어댑터/중계 계층 없이 GKE 네이티브 기능으로 단순화"

즉, 오토스케일링을 "관측 시스템 연동 프로젝트"가 아니라 "클러스터 기본 역량"으로 되돌리려는 시도다.

---

## 기존 방식: 커스텀 메트릭 세금(Custom Metric Tax)

기존 GKE 환경에서 HPA에 커스텀 지표를 연결하는 전형적인 흐름은 다음과 같았다.

1. 애플리케이션 메트릭을 Cloud Monitoring 또는 Prometheus로 export
2. `custom-metrics-stackdriver-adapter` 또는 `prometheus-adapter` 설치
3. Workload Identity Federation + IAM Service Account + KSA 바인딩 설정
4. HPA가 adapter를 통해 지표 조회

겉보기엔 "구성 몇 개 추가"지만, 실제 운영에서는 아래 비용이 누적된다.

### 1) 구성 복잡도 증가

- adapter 버전 호환성 점검
- 클러스터 업그레이드 시 adapter 재검증
- 메트릭 이름/레이블 매핑 오류 대응

### 2) 장애 표면 확대

- HPA 동작이 external observability stack에 의존
- 메트릭 수집 지연, adapter 장애가 곧 스케일 실패로 연결

### 3) IAM 운영 피로도

- 권한 최소화 설계는 필수지만 설정 난이도 높음
- 운영 중 계정/바인딩 드리프트 발생 가능

### 4) 비용과 지연

- 오토스케일링 용도로만 쓰는 메트릭도 수집·저장·조회 비용 발생
- 외부 라운드트립 때문에 급격한 트래픽 순간 대응이 늦어질 수 있음

---

## GKE Native Custom Metrics의 구조적 변화

Google Cloud 설명 기준으로 핵심은 아래 4가지다.

1. **No agents / No adapters**: 중계 어댑터 계층 제거
2. **Pod 지표를 HPA로 직접 연결**: 커스텀 지표를 네이티브 경로로 사용
3. **IAM 단순화**: 기존 adapter 기반 권한 체인 부담 감소
4. **오토스케일링-관측 분리**: 스케일링 핵심 경로를 외부 관측 장애로부터 분리

운영 관점에서 가장 의미 있는 포인트는 이것이다.

> "모니터링 시스템이 중요 인프라인 것은 맞지만, 오토스케일링의 단일 의존점이 되면 안 된다."

네이티브 지원은 이 의존 관계를 약화시키고, 클러스터 내부의 제어 루프를 더 단순하게 만든다.

---

## 실무에서 기대할 수 있는 효과

### 1) 반응 속도 개선

중간 adapter/외부 조회 경로를 줄이면 HPA 판단 지연이 낮아진다.
버스트 트래픽이 잦은 API, 이벤트성 게임/커머스 워크로드에서 체감이 크다.

### 2) 신뢰성 개선

관측 스택 일부 장애가 발생해도 스케일링 루프 자체가 덜 흔들린다.
즉, "모니터링 장애 = 스케일링 장애"라는 최악의 결합을 완화한다.

### 3) 플랫폼 팀 운영 부담 감소

- adapter lifecycle 관리 제거
- IAM 바인딩 유지보수 감소
- 장애 분석 시 추적 경로 단순화

### 4) 비용 최적화

오토스케일링 판단용 메트릭을 위해 과도한 수집 파이프라인을 유지하지 않아도 된다.
특히 대규모 클러스터에서 메트릭 ingestion 비용 최적화 여지가 커진다.

---

## 하지만 "무조건 이득"은 아니다: 도입 전 점검 포인트

### 1) 메트릭 품질은 여전히 애플리케이션 책임

네이티브 연결이 쉬워져도, 지표 설계가 나쁘면 스케일링은 불안정하다.

- gauge/counter 구분
- scrape 간격 대비 smoothing 전략
- 노이즈/스파이크 처리

### 2) 오버스케일 방지 가드레일 필요

커스텀 지표는 CPU보다 노이즈가 큰 경우가 많다.

- `stabilizationWindowSeconds`
- scale up/down 정책 분리
- min/max replica 제한

이 세 가지는 반드시 같이 설계해야 한다.

### 3) SLO 기반 지표 선정 필요

"측정 가능한 것"과 "서비스 품질에 유의미한 것"은 다르다.
큐 길이만으로 스케일하면 처리량은 늘어도 사용자 지연은 개선되지 않을 수 있다.

권장 방식:

1. SLO(예: p95 latency) 정의
2. SLO에 가장 민감한 선행지표 선택
3. HPA 지표와 알람 지표를 분리 설계

### 4) 관측 스택은 여전히 필요

이번 변화는 observability를 대체하지 않는다.
오토스케일링 경로를 단순화하는 것이지, 디버깅·용량계획·비용분석까지 없어지는 건 아니다.

---

## 권장 도입 전략 (점진적 마이그레이션)

### Phase 1: 후보 워크로드 선정

다음 조건을 만족하는 서비스부터 시작한다.

- burst 패턴이 명확함
- 기존 adapter 장애를 자주 경험함
- 커스텀 지표 정의가 이미 안정적임

### Phase 2: 병행 검증

동일 워크로드에서 아래를 비교한다.

- 기존 방식(HPA + adapter)
- 네이티브 커스텀 메트릭 방식

비교 지표:

- scale-out latency
- under-provision 구간 길이
- 과잉 replica 유지 시간
- 운영 알람 건수

### Phase 3: 운영 표준화

검증 결과가 좋다면 아래를 표준 템플릿으로 만든다.

- 서비스 유형별 권장 지표
- HPA 정책 기본값
- 롤백 조건(예: 오버스케일 2회 이상)

### Phase 4: 플랫폼 가드레일 자동화

- 정책(OPA/Gatekeeper)로 비정상 HPA 설정 차단
- 릴리즈 파이프라인에서 HPA linting 수행
- 주기적 리포트로 scale 이벤트 품질 점검

---

## DevOps 팀 실행 체크리스트

- [ ] 대상 서비스의 SLO와 스케일 목표 명시
- [ ] 커스텀 지표의 의미/단위/샘플링 주기 문서화
- [ ] HPA scale up/down 정책과 stabilization 윈도우 설정
- [ ] 부하 테스트로 임계값(threshold) 검증
- [ ] 오버스케일/언더스케일 시 롤백 시나리오 준비
- [ ] 운영 대시보드(지표값, replica, latency)를 한 화면으로 통합

---

## 마무리

GKE Native Custom Metrics는 단순 기능 추가가 아니라,
**"오토스케일링을 관측 연동의 부속물에서 플랫폼 기본 제어 루프로 복원"** 하는 변화에 가깝다.

특히 AI 서빙·트래픽 급변 서비스처럼 CPU/메모리만으로는 수요를 설명하기 어려운 환경에서,
이번 변화는 운영 난이도를 낮추면서도 반응성을 개선할 수 있는 현실적인 카드다.

핵심은 도구 자체보다 도입 방식이다.
지표 설계, HPA 가드레일, SLO 정렬을 함께 가져가면 "잘 늘어나는 클러스터"가 아니라
**"품질을 지키면서 비용 효율적으로 늘어나는 서비스"**를 만들 수 있다.

---

### 참고 자료

- Google Cloud Blog, *Grow your own way: Introducing native support for custom metrics in GKE* (2026-03-05)
- GKE 문서: Expose custom metrics for autoscaling
