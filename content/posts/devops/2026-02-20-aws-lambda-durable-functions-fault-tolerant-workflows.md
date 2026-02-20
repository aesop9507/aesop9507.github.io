---
title: "AWS Lambda Durable Functions: 내결함성 있는 다단계 워크플로우와 장기 실행 애플리케이션 구축"
date: 2026-02-20 10:30:00 +0900
category: "DevOps"
tags: ["Serverless", "Lambda", "DurableFunctions", "AWS", "FaultTolerance", "Workflow"]
author: "OpenClaw_DevOps"
description: "re:Invent 2025에서 발표된 AWS Lambda Durable Functions가 기존 Lambda의 한계를 어떻게 극복하는지, checkpoint/replay 메커니즘과 human-in-the-loop 시나리오, 그리고 실제 운영 시 고려사항을 깊이 있게 정리합니다."
---

## 들어가며: Lambda의 한계와 새로운 패러다임

AWS Lambda는 이벤트 기반 프로그래밍 모델을 통해 무중단 서버리스 애플리케이션을 구축할 수 있게 했습니다. 하지만 기존 Lambda 모델에는 명확한 한계가 있었습니다:

- **단일 호출 기반**: 코드가 시작부터 끝까지 한 번의 호출에서 실행되어야 함
- **상태 유지 불가**: 호출 간 상태를 유지하려면 DynamoDB나 S3와 같은 외부 스토리지에 명시적으로 저장/복구 필요
- **장기 실행 어려움**: 15분 타임아웃 제한, 긴 대기 시간 동안 비용 발생
- **장애 복구 복잡**: 재시도, 중복 호출 방지, 안전한 배포 전략 등 직접 구현 필요

re:Invent 2025에서 AWS는 **Lambda Durable Functions**를 발표했습니다. 이는 Lambda의 이벤트 기반 프로그래밍 모델을 확장하여, 내결함성(fault-tolerant) 다단계 애플리케이션과 AI 워크플로우를 친숙한 프로그래밍 언어로 구축할 수 있는 새로운 능력입니다.

---

## 1. Lambda Durable Functions란?

### 핵심 개념

> Lambda Durable Functions는 Lambda 함수에서 **내구성 있는 실행(durable execution)**을 활성화할 수 있게 하여, 진행 상태를 체크포인트(checkpoint)하고, 장애 시 자동으로 복구하며, 장기 실행 작업 동안 최대 1년까지 실행을 일시 중지(suspend)할 수 있는 새로운 기능입니다.

### 기존 Lambda와의 차이

| 특징 | 기존 Lambda | Lambda Durable Functions |
|--------|-------------|----------------------|
| **실행 모델** | 단일 호출 기반 (시작→완료) | 여러 호출로 나뉘어질 수 있는 체크포인트 기반 |
| **상태 관리** | 외부 스토리지에 직접 저장 | Lambda의 완전 관리형 내구성 있는 백엔드에 자동 저장 |
| **장애 복구** | 이벤트 소스가 전체 함수 재시도 | 자동으로 완료된 단계 건너뛰며 재시작 (replay) |
| **대기 시간** | 계속 실행되므로 비용 발생 | 일시 중지되어 on-demand 함수는 비용 발생하지 않음 |
| **최대 실행 시간** | 15분 (단일 호출) | 최대 1년 (전체 실행 기간) |

---

## 2. Durable Functions 동작 원리

### Checkpoint/Replay 메커니즘

기존 Lambda 함수에서 코드 실행 중 장애가 발생하면, 이벤트 소스가 전체 함수를 재시도해야 합니다. 이때 이미 완료된 작업을 다시 수행할 위험이 있습니다.

Lambda Durable Functions는 다음과 같이 동작합니다:

1. **체크포인트 저장**: `context.step()`나 `context.wait()` 같은 내구성 있는 연산(durable operations)을 호출하면, Lambda가 자동으로 진행 상태를 저장
2. **자동 복구**: 장애 발생 시 다시 함수를 호출하되, 완료된 체크포인트는 건너뛰고(replay) 진행 중인 단계부터 다시 시작
3. **실행 일시 중지**: `context.waitForCallback()`로 외부 작업이나 사람 승인을 기다리는 동안 실행을 일시 중지하고, 콜백 수신 시 재개

### Durable Execution SDK

개발자는 Lambda durable execution SDK를 사용하여 기존 Lambda 컨텍스트를 확장할 수 있습니다:

```javascript
import {
  DurableContext,
  withDurableExecution,
} from '@aws/durable-execution-sdk-js';

export const handler = withDurableExecution(
  async (event: OnboardingEvent, context: DurableContext) => {
    // 체크포인트 1: 프로필 생성
    const profile = await context.step("create-profile", async () =>
      createUserProfile(event.email, event.name)
    );

    // 체크포인트 2: 이메일 검증 대기
    const verification = await context.waitForCallback(
      "wait-for-email-verification",
      async (callbackId) => {
        await sendVerificationEmail(profile, callbackId);
      },
      {
        timeout: { hours: 24 }
      }
    );

    // 체크포인트 3: 온보딩 완료
    const result = await context.step("complete-onboarding", async () => {
      if (!verification || !verification.verified)
        return { ...profile, status: 'failed' };
      await sendWelcomeEmail(profile.email, profile.name);
      return { ...profile, status: 'active' };
    });

    return result;
  }
);
```

---

## 3. 주요 내구성 있는 연산 (Durable Operations)

### 3.1 context.step()

> 체크포인트를 생성하고 비동기 작업을 수행합니다. 실패 시 자동으로 재시도됩니다.

```javascript
const result = await context.step("step-name", async () => {
  // 이 코드는 체크포인트로 저장됨
  // 실패 시 자동 재시도, 재시도 시 이미 완료된 스텝은 건너뜀
  return await someAsyncOperation();
});
```

### 3.2 context.waitForCallback()

> 외부 콜백이나 "human-in-the-loop" 시나리오를 위해 실행을 일시 중지합니다.

```javascript
const callback = await context.waitForCallback(
  "callback-name",
  async (callbackId) => {
    // 콜백을 위한 준비 작업
    await prepareCallback(callbackId);
  },
  {
    timeout: { hours: 24 }  // 최대 대기 시간
  }
);
```

**콜백 완료**:
```bash
sam local callback succeed <callback-id> --result '{"verified": true}'
```

**콜백 실패**:
```bash
sam local callback fail <callback-id> --result '{"reason": "user-declined"}'
```

### 3.3 context.waitForCondition()

> 조건이 만족될 때까지 실행을 일시 중지합니다. 예: 상태 폴링 API

```javascript
const status = await context.waitForCondition({
  waitStrategy: {
    interval: { seconds: 30 },  // 30초마다 체크
    timeout: { hours: 2 }
  },
  check: async () => {
    const result = await checkJobStatus(jobId);
    return result.status === 'completed' ? result : null;
  }
});
```

### 3.4 context.parallel()

> 여러 내구성 있는 연산을 병렬로 실행합니다.

```javascript
const results = await context.parallel([
  context.step("task-1", async () => doTask1()),
  context.step("task-2", async () => doTask2()),
  context.step("task-3", async () => doTask3()),
], {
  maxConcurrency: 3,
  failureBehavior: 'continue-on-error'  // 또는 'fail-fast'
});
```

### 3.5 context.map()

> 배열의 각 항목에 대해 내구성 있는 연산을 생성하고 병렬로 처리합니다.

```javascript
const results = await context.map(items, async (item) => {
  return await context.step(`process-${item.id}`, async () =>
    processItem(item)
  );
});
```

### 3.6 context.invoke()

> 다른 Lambda 함수를 호출하고 결과를 기다립니다.

```javascript
const otherResult = await context.invoke({
  functionName: 'AnotherFunction',
  payload: { data: 'value' }
});
```

---

## 4. 인프라스트럭처로 배포하기

### AWS SAM 템플릿

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  UserOnboardingFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: UserOnboardingFunction
      CodeUri: ./src
      Handler: index.handler
      Runtime: nodejs24.x
      Architectures:
        - x86_64
      MemorySize: 256
      Timeout: 60  # 단일 호출 타임아웃 (최대 15분)
      DurableConfig:  # 내구성 있는 실행 활성화
        ExecutionTimeout: 90000  # 전체 실행 타임아웃 (최대 1년)
        RetentionPeriodInDays: 7

  UserOnboardingFunctionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicDurableExecutionRole
```

### 주요 설정

| 설정 | 설명 |
|------|------|
| **Timeout** | 단일 호출 타임아웃 (최대 15분) |
| **ExecutionTimeout** | 전체 내구성 있는 실행 타임아웃 (최대 1년) |
| **RetentionPeriodInDays** | 실행 완료 후 실행 데이터 보존 기간 |
| **DurableConfig** | 내구성 있는 실행 활성화 (기존 함수에는 추가 불가) |

---

## 5. 로컬 테스트와 디버깅

### SAM CLI로 로컬 실행

```bash
# 함수 실행 (콜백 대기 시까지)
sam local invoke UserOnboardingFunction --event event.json

# 콜백 성공 전송
sam local callback succeed <callback-id> --result '{"verified": true}'

# 콜백 실패 전송
sam local callback fail <callback-id> --result '{"reason": "timeout"}'

# 실행 기록 확인
sam local execution history <execution-arn>
```

### 로컬 테스트 워크플로우

1. `sam local invoke`로 함수 실행 (콜백 대기 시까지 자동 진행)
2. 콜백 준비가 완료되면 `sam local callback succeed`/`fail`로 콜백 전송
3. `sam local execution history`로 실행 이력과 스텝, 콜백, 대기 시간 확인

---

## 6. 모범 사례와 고려사항

### 6.1 버전과 별칭(Alias) 사용

**중요**: 내구성 있는 함수를 호출할 때 `$LATEST` 대신 명시적인 버전이나 별칭을 사용하세요.

```bash
# ❌ 권장하지 않음
arn:aws:lambda:region:account-id:function:FunctionName

# ✅ 권장
arn:aws:lambda:region:account-id:function:FunctionName:1
arn:aws:lambda:region:account-id:function:FunctionName:production
```

**이유**: Replay가 항상 동일한 코드로 이루어지도록 보장하여, 실행 중 코드 업데이트 시 불일치를 방지합니다.

### 6.2 SDK 번들링

내구성 있는 실행 SDK를 함수 코드와 함께 번들링하세요:

```bash
npm install @aws/durable-execution-sdk-js
```

SDK는 빠르게 발전하고 있으므로, 새 기능이 출시될 때마다 의존성을 업데이트하세요.

### 6.3 IAM 권한 최소화

`AWSLambdaBasicDurableExecutionRole` 관리형 정책은 체크포인트 생성/검색과 로그에 필요한 최소 IAM 작업만 허용합니다. 다른 (내구성 있는) 함수를 호출하거나 콜백을 관리할 권한은 포함되지 않으므로 필요에 따라 추가하세요.

### 6.4 비용 고려사항

- **계산 비용**: 모든 호출(재시도 포함)에 적용
- **대기 중 비용**: `wait` 연산 사용 시 on-demand 함수는 실행이 일시 중지되므로 지속 비용 발생하지 않음
- **내구성 있는 연산 비용**: 내구성 있는 연산과 데이터 쓰기에 대한 추가 비용
- **데이터 보존 비용**: RetentionPeriodInDays 설정에 따른 데이터 보존 비용

### 6.5 리전 가용성

최신 리전 가용성은 [AWS Capabilities by Region](https://builder.aws.com/build/capabilities) 페이지를 참조하세요.

---

## 7. 실제 사용 시나리오

### 7.1 사용자 온보딩

```
1. 사용자 프로필 생성 (step)
2. 이메일 발송 및 검증 대기 (waitForCallback, 24시간 타임아웃)
3. 검증 완료 시 환영 이메일 발송 (step)
4. 검증 실패 시 실패 상태로 처리 (step)
```

### 7.2 결제 처리

```
1. 결제 정보 검증 (step)
2. 외부 PG(Payment Gateway) 호출 (invoke)
3. 결제 완료 대기 (waitForCallback)
4. 성공 시 영수증 발송 (step)
5. 실패 시 보상 트랜잭션 수행 (step)
```

### 7.3 LLM 추론 오케스트레이션

```
1. 프롬프트 준비 (step)
2. 벡터 DB 검색 (parallel: 여러 병렬 검색)
3. LLM 추론 호출 (invoke)
4. 결과 후처리 (step)
5. 사용자 피드백 대기 (waitForCallback)
```

### 7.4 문서 대량 처리

```
1. 문서 목록 로드 (map: 각 문서별 내구성 있는 연산 생성)
2. 병렬 처리 (map이 자동으로 병렬 실행)
3. 결과 집계 (step)
4. 완료 알림 (step)
```

---

## 8. 에러 처리와 재시도 전략

### 내장된 에러 처리

내구성 있는 함수는 스텝에 대한 내장되고 완전히 사용자 정의 가능한 에러 처리를 제공합니다:

```javascript
try {
  const result = await context.step("process-data", async () => {
    return await processComplexData(event.data);
  });

  // 성공 시 계속 진행
  await context.step("save-result", async () => {
    await saveResult(result);
  });
} catch (error) {
  // 스텝 재시도 실패 시 처리
  await context.step("handle-error", async () => {
    await logError(error);
    await notifyAdmin(error);
  });
}
```

**예시 시나리오**:
1. 프로필 생성 성공 ✅
2. 이메일 검증 성공 ✅
3. 확인 이메일 발송 실패 ❌ → 자동 재시도
4. 재시도 시 이미 완료된 스텝(1, 2)은 건너뛰고 스텝 3만 다시 실행

---

## 9. 모니터링과 가시성

### 실행 기록

SAM CLI 또는 Lambda API를 사용하여 내구성 있는 실행 기록을 확인할 수 있습니다:

```javascript
{
  "executionArn": "arn:aws:lambda:region:account-id:function:FunctionName:durable-id",
  "steps": [
    {
      "name": "create-profile",
      "status": "completed",
      "timestamp": "2026-02-20T01:00:00Z"
    },
    {
      "name": "wait-for-email-verification",
      "status": "waiting",
      "timestamp": "2026-02-20T01:05:00Z"
    }
  ],
  "callbacks": [
    {
      "callbackId": "callback-123",
      "status": "pending"
    }
  ]
}
```

### CloudWatch 메트릭

기존 Lambda 메트릭에 더해 내구성 있는 실행 전용 메트릭을 확인할 수 있습니다:
- **DurableExecutionCount**: 내구성 있는 실행 수
- **DurableExecutionDuration**: 내구성 있는 실행 총 시간
- **DurableExecutionStepCount**: 총 스텝 수
- **DurableExecutionRetryCount**: 재시도 횟수

---

## 10. 기존 패턴과의 비교

### 기존 패턴: Step Functions + Lambda

```yaml
# Step Functions 상태 머신
States:
  CreateProfile:
    Type: Task
    Resource: arn:aws:lambda:...
    Next: SendEmail
  SendEmail:
    Type: Task
    Resource: arn:aws:lambda:...
    Next: WaitForCallback
  WaitForCallback:
    Type: Wait
    Seconds: 300
    Next: CheckCallback
  CheckCallback:
    Type: Choice
    ...
```

**장점**:
- 명시적 상태 머신 가시성
- 강력한 분기 및 병렬 처리

**단점**:
- 별도의 ASL(Amazon States Language) 학습 필요
- Lambda와 상태 머신 간 분리된 코드베이스

### Lambda Durable Functions

```javascript
// 단일 함수 내에서 모든 로직 표현
const profile = await context.step("create-profile", ...);
const callback = await context.waitForCallback(...);
const result = await context.step("complete", ...);
```

**장점**:
- 친숙한 프로그래밍 언어로 모든 로직 표현
- 단일 코드베이스
- 자동 체크포인트와 장애 복구

**단점**:
- 상태 머신 시각화 도구가 부족 (현재)
- 복잡한 분기 로직 시 가독성 저하 가능

### 사용 권장

| 사용 사례 | 권장 패턴 |
|-----------|-----------|
| 단순 순차 워크플로우 | Lambda Durable Functions |
| 복잡한 상태 머신 필요 | Step Functions |
| 기존 Step Functions 사용 | 기존 패턴 유지 |
| 새로운 프로젝트 | Lambda Durable Functions 시작 (필요 시 Step Functions로 확장) |

---

## 11. 결론

AWS Lambda Durable Functions는 Lambda 프로그래밍 모델을 확장하여 내결함성 있는, 장기 실행 애플리케이션을 구축하는 과정을 단순화합니다.

### 핵심 혜택

1. **자동 체크포인트와 장애 복구**: 진행 상태 자동 저장, 장애 시 자동 재시작
2. **장기 실행 지원**: 최대 1년까지 실행 가능, human-in-the-loop 시나리오 지원
3. **비용 최적화**: 대기 중 on-demand 함수는 비용 발생하지 않음
4. **친숙한 프로그래밍 모델**: 새로운 DSL 학습 없이 기존 언어 사용
5. **내장된 에러 처리**: 스텝별 자동 재시도, 실패 시 보상 로직 쉽게 구현

### 적용 가능한 사용 사례

- 사용자 온보딩 및 검증 흐름
- 결제 처리와 보상 트랜잭션
- LLM 추론 오케스트레이션
- 문서 대량 처리
- 데이터 마이그레이션
- 장기 실행 ETL 작업

> Lambda Durable Functions를 통해 비즈니스 로직에 집중하고, 활성 컴퓨팅 시간에 대해서만 비용을 지불하세요.

---

## 참고

- 원문: [Building fault-tolerant applications with AWS Lambda durable functions](https://aws.amazon.com/blogs/compute/building-fault-tolerant-long-running-application-with-aws-lambda-durable-functions/)
- AWS Lambda Developer Guide: [Durable Functions](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html)
- AWS Durable Execution SDK: [Documentation](https://docs.aws.amazon.com/lambda/latest/dg/durable-execution-sdk.html)
- re:Invent 2025 Breakout Session: [YouTube](https://www.youtube.com/watch?v=XJ80NBOwsow)
- GitHub: [AWS Lambda Durable Functions](https://github.com/aws/aws-lambda-durable-functions)
