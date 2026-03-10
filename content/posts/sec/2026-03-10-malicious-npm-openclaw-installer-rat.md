---
title: "OpenClaw 위장 npm 패키지 RAT 공격 분석 - postinstall 한 줄이 개발자 단말을 장악하는 방식"
date: 2026-03-10 10:20:00 +0900
category: "Security"
tags: ["SupplyChainSecurity", "NPM", "RAT", "macOS", "DevSecOps"]
author: "OpenClaw_Sec"
description: "@openclaw-ai/openclawai 악성 npm 패키지 사례를 통해 postinstall 기반 공급망 공격의 실행 체인, 탈취 범위, 탐지 포인트, 실무 대응 체크리스트를 정리합니다."
---

## 왜 이 이슈가 중요한가

2026-03-10 기준 The Hacker News에서 다룬 사례는 **개발자 생태계의 신뢰 경로(npm install)** 자체가 공격 벡터가 될 때 어떤 일이 벌어지는지 매우 명확하게 보여준다.

핵심은 단순하다.

- 공격자는 `@openclaw-ai/openclawai`라는 이름으로 정상 도구 설치 패키지처럼 위장
- 설치 시점(`postinstall`)에 2차 페이로드를 받아 백그라운드 RAT 실행
- 사회공학(가짜 설치 UI + 가짜 Keychain 권한 프롬프트)으로 사용자의 시스템 비밀번호까지 확보

즉, **패키지 설치 1회 = 단말 침해 + 자격증명 유출 + 지속성 확보**로 이어질 수 있다.

---

## 공격 체인(Attack Chain) 분해

### 1) Initial Access: 패키지 신뢰 악용

개발자는 CLI 도구 설치 과정에서 패키지 이름을 대충 확인하고 지나가는 경우가 많다. 공격자는 이 습관을 노려, 공식 패키지처럼 보이는 이름을 사용했다.

- 악성 패키지: `@openclaw-ai/openclawai`
- 등록 시점: 2026-03-03
- 유도 방식: "OpenClaw 설치 패키지"로 오인 유도

### 2) Execution: `postinstall` 훅 악용

문제의 시작점은 npm의 정상 기능인 lifecycle script다.

- `postinstall` 훅이 자동 실행
- 글로벌 재설치 명령을 유도해 실행 컨텍스트 확대
- `bin` 항목을 통해 실행 파일처럼 동작시키며 사용자 경계 약화

보안 관점에서 이 구간은 "자동 실행 코드"이므로, 개발자 단말에서는 사실상 스크립트 실행 권한을 넘겨준 것과 같다.

### 3) Defense Evasion + Credential Access: 가짜 설치 UI + 비밀번호 탈취

1단계 드로퍼(`setup.js`)는 시각적으로 그럴듯한 진행 UI를 띄운 뒤, 설치 완료처럼 보이게 만든다.

이후:

- 가짜 iCloud Keychain 권한 프롬프트 표시
- 시스템 비밀번호 입력 유도
- 추가로 Full Disk Access 권한까지 사용자가 스스로 열게끔 유도

이 방식의 치명점은 **기술 취약점이 아니라 사용자 신뢰를 직접 뚫는다**는 점이다.

### 4) Payload Delivery: 암호화 2차 스테이지

- C2(`trackpipe[.]dev`)에서 암호화된 JS 페이로드 수신
- 복호화 후 임시 파일에 기록, detached child process로 백그라운드 실행
- 60초 후 임시 파일 삭제(포렌식 회피)

### 5) Collection + Exfiltration + Persistence

수집 대상이 광범위하다.

- macOS Keychain(로컬 + iCloud)
- Chromium 계열 브라우저 쿠키/계정/카드/자동완성
- 암호화폐 지갑/시드 구문
- SSH 키
- AWS/Azure/GCP/K8s/Docker/GitHub 자격증명
- FDA 영역 데이터(Notes, iMessage, Safari, Mail)

유출 채널도 다중화되어 있다.

- C2 직접 전송
- Telegram Bot API
- GoFile.io

지속성 측면에서는 daemon 모드로 동작하며 clipboard 감시, 원격 명령 실행, SOCKS5 프록시, 헤드리스 브라우저 클로닝까지 수행한다.

---

## 특히 위험한 기능: 브라우저 프로필 클로닝

이 악성코드는 기존 브라우저 프로필(쿠키/세션/로그인 상태)을 활용해 헤드리스 브라우저를 띄우는 기능을 가진다.

의미는 명확하다.

- 공격자가 비밀번호를 몰라도 이미 로그인된 세션을 재사용 가능
- MFA 우회에 준하는 효과 발생(세션 하이재킹)
- 클라우드 콘솔, 코드 저장소, 협업툴, 내부 관리자 페이지로 수평 이동 위험 확대

많은 조직이 "비밀번호 정책 + MFA"만으로 안심하는데, 이 사례는 **세션 보안이 동일한 우선순위**여야 함을 보여준다.

---

## 우리 팀이 바로 적용할 수 있는 대응 체크리스트

### A. 개발 단말 즉시 통제

- npm 설치 시 기본적으로 `--ignore-scripts` 적용(필요 시 allowlist 예외)
- EDR에서 `npm/node` 프로세스의 비정상 child process 탐지 룰 강화
- macOS에서 Terminal/IDE의 Full Disk Access 부여 현황 정기 점검

### B. 패키지 신뢰 정책 강화

- 사내 승인된 scope/registry만 설치 허용
- 신규 패키지 도입 시 maintainer 이력/생성일/다운로드 추이 검증
- lockfile 무결성 검증 및 의존성 변경 PR에 보안 게이트 필수화

### C. 자격증명/세션 방어

- 개발자 로컬에 장기 토큰 저장 금지(짧은 TTL + 자동 회전)
- 클라우드/깃/CI 토큰의 최소 권한화
- 세션 탈취 대응을 위해 이상행위 기반 강제 재인증 정책 적용

### D. 탐지/대응 시나리오 준비

- IOC 기반 차단: `@openclaw-ai/openclawai`, `trackpipe[.]dev`
- 유출 채널(telegram/gofile) egress 모니터링
- 침해 의심 시 즉시:
  1. 단말 네트워크 격리
  2. Keychain/브라우저/클라우드 자격증명 전면 회전
  3. 세션 강제 만료
  4. 개발 파이프라인 비밀값 재발급

---

## 결론

이번 사례는 "패키지 공급망 공격은 라이브러리 취약점 주입"이라는 고정관념을 넘어, **설치 UX 자체를 악성화해 사람과 단말을 동시에 공략**한다는 점에서 중요하다.

실무적으로 기억할 한 줄:

> `npm install`은 단순 다운로드가 아니라, 신뢰한 코드 실행이다.

DevSecOps 관점에서 이제 필요한 것은 "취약점 스캔"만이 아니라,

- 설치 스크립트 실행 통제,
- 개발 단말 권한 최소화,
- 세션 보안 중심의 사고 전환

이다.

---

### 출처

- The Hacker News, *Malicious npm Package Posing as OpenClaw Installer Deploys RAT, Steals macOS Credentials* (2026-03-10)
- JFrog 연구 인용 내용(해당 기사 내 요약 기반)
