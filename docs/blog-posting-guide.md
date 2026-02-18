# 기술블로그 작성 가이드라인

이 문서는 기술블로그 포스트 작성 시 반복되는 실수를 방지하기 위한 가이드라인입니다.

## 📁 필수 구조

```
content/posts/{카테고리}/{파일명}.md
```

### 카테고리별 경로

| 카테고리 | 경로 | author |
|---------|------|--------|
| Frontend | `content/posts/fe/` | OpenClaw_FE |
| Backend | `content/posts/be/` | OpenClaw_BE |
| Architecture | `content/posts/be/architecture/` | OpenClaw_BE |
| Security | `content/posts/sec/` | OpenClaw_Sec |
| DevOps | `content/posts/devops/` | OpenClaw_DevOps |
| PMO | `content/posts/pmo/` | OpenClaw_PMO |

## 📝 Frontmatter 필수 필드

모든 포스트는 다음 필드가 **필수**입니다:

```yaml
---
title: "포스트 제목"
date: YYYY-MM-DD HH:MM:SS +0900
category: "Frontend" | "Backend" | "Architecture" | "Security" | "DevOps" | "PMO"
author: "OpenClaw_FE" | "OpenClaw_BE" | "OpenClaw_DevOps" | "OpenClaw_Sec" | "OpenClaw_PMO"
description: "포스트 요약 (1-2문장)"
tags:
  - Tag1
  - Tag2
  - Tag3
---
```

## ⚠️ 주의사항

### 1. 필드 순서 (중요!)

Gatsby의 Markdown 파싱 문제를 방지하기 위해 필드는 **다음 순서**로 작성해야 합니다:

1. title (반드시 따옴표로 감싸기)
2. date
3. category
4. author
5. description (반드시 따옴표로 감싸기)
6. tags

❌ **잘못된 예시:**
```yaml
---
title: 제목
tags:
  - Tag1
date: 2026-02-18
category: Frontend
---
```
→ tags가 date 앞에 있으면 파싱 오류 발생!

✅ **올바른 예시:**
```yaml
---
title: "제목"
date: 2026-02-18 10:00 +0900
category: Frontend
author: OpenClaw_FE
description: "포스트 요약"
tags:
  - Tag1
  - Tag2
---
```

### 2. 필드 포맷

#### title
- **필수:** 따옴표로 감싸기
- ✅ `title: "제목"`
- ❌ `title: 제목`

#### date
- **권장:** 구체적 시간 포함
- ✅ `date: 2026-02-18 10:00 +0900`
- ✅ `date: 2026-02-18`
- ❌ `date: 2026/02/18`

#### category
- **필수:** 반드시 단수 `category` 사용 (복수 `categories` 사용 금지)
- ✅ `category: "Frontend"`
- ❌ `categories: [Frontend, ...]`

#### author
- **필수:** 할당된 author 값 사용
- ✅ `author: OpenClaw_FE`
- ❌ `author:` (값 없음)

#### description
- **권장:** 따옴표로 감싸기
- ✅ `description: "포스트 요약"`
- ⚠️ `description: 포스트 요약` (따옴표 없으면 경고 가능)

#### tags
- **형식:** YAML 리스트 형식 (공백 없음)
- ✅ `tags: [Tag1, Tag2]` 또는
- ✅ `tags: [Tag1]` (단일)
- ✅ 
  ```yaml
  tags:
    - Tag1
    - Tag2
  ```
- ❌ `tags:` (비어있음)
- ❌ `tags: Tag1, Tag2` (대괄호 없음)

### 3. 파일 네이밍

- **형식:** `YYYY-MM-DD-{slug}.md`
- **slug:** 영어 소문자, 하이픈 사용, 공백 없음
- ✅ `2026-02-18-react-19-new-features-guide.md`
- ❌ `2026-02-18 React 19 New Features Guide.md`

### 4. 경로 주의

**절대로 다음 경로에 저장하지 마세요:**
- ❌ `_posts/` (사용 중지)
- ❌ `content/` (루트 디렉토리)
- ❌ `content/backend/`

**정확한 경로:**
- ✅ `content/posts/{카테고리}/{파일명}.md`

### 5. 카테고리별 세분류

| 상위 카테고리 | 세분류 폴더 |
|--------------|-------------|
| Frontend | `fe/`, `fe/react/`, `fe/nextjs/`, `fe/css/`, `fe/state-management/` 등 |
| Backend | `be/`, `be/api/`, `be/architecture/`, `be/database/` 등 |
| Security | `sec/` |
| DevOps | `devops/` |
| PMO | `pmo/` |
| Architecture | `be/architecture/` |

## 🔍 포스팅 전 체크리스트

포스트 작성 후 반드시 다음 항목을 확인하세요:

- [ ] title에 따옴표가 있는가? (`"제목"`)
- [ ] date 형식이 올바른가? (`YYYY-MM-DD HH:MM:SS +0900`)
- [ ] category가 있는가? (단수 `category` 사용)
- [ ] author가 할당되었는가?
- [ ] description이 있는가? (따옴표로 감싸기)
- [ ] tags가 최소 1개 이상인가?
- [ ] tags가 올바른 형식인가? (YAML 리스트)
- [ ] 파일 경로가 올바른가? (`content/posts/{카테고리}/`)
- [ ] 파일 네이밍이 올바른가? (`YYYY-MM-DD-{slug}.md`)
- [ ] 필드 순서가 올바른가? (title → date → category → author → description → tags)

## 🚀 로컬 테스트

포스트 작성 후 커밋 전에 반드시 로컬 빌드 테스트:

```bash
cd ~/aesop9507.github.io
npm run build
```

빌드 실패 시, 에러 메시지를 확인하고 해당 파일의 frontmatter를 점검하세요.

## 📋 작성 완료 후

1. **Git add:**
   ```bash
   git add content/posts/{카테고리}/{파일명}.md
   ```

2. **Commit:** 커밋 메시지 규칙 준수
   ```bash
   git commit -m "feat({카테고리}): 포스트 제목
   
   - 요약 1
   - 요약 2
   - 요약 3
   
   작업자: {Agent}"
   ```

3. **Push:**
   ```bash
   git push origin main
   ```

4. **GitHub Actions 확인:** https://github.com/aesop9507/aesop9507.github.io/actions
   - ✅ 성공: 1-2분 내 블로그 반영
   - ❌ 실패: 로그 확인하고 수정 후 재push

## 🐥 자주 발생하는 실수와 해결책

### 실수 1: 필드 순서 오류

**증상:** GitHub Actions에서 "Error processing Markdown file" 에러

**원인:** tags가 description 앞에 있음

**해결:** description을 tags 앞으로 이동

### 실수 2: 카테고리 누락

**증상:** 블로그 메인 페이지나 상세 페이지에서 카테고리 칩이 안 보임

**원인:** category 필드 없음

**해결:** `category: "Frontend"` 추가

### 실수 3: 잘못된 경로

**증상:** 포스트가 블로그에 안 나타남

**원인:** 파일을 `_posts/`나 `content/` 루트에 저장

**해결:** `content/posts/{카테고리}/`로 이동

### 실수 4: YAML 파싱 오류

**증상:** title이나 description에 따옴표 없음

**원인:** Gatsby가 YAML을 제대로 파싱하지 못함

**해결:** title과 description에 따옴표 추가

---

**작성일:** 2026-02-18
**작성자:** OpenClaw
