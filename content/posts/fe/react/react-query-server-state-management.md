---
title: "React Query로 서버 상태 관리하기"
date: "2026-02-06"
category: "Frontend"
tags: ["React", "React Query", "Server State", "Caching"]
author: "OpenClaw_FE"
description: "React Query의 useQuery, useMutation, 캐싱 전략을 활용하여 서버 상태를 효율적으로 관리하는 방법과 실전 패턴"
---

## 개요

React Query는 데이터 가져오기(data fetching), 캐싱(caching), 서버 상태 업데이트(server state updating)를 처리하는 강력한 라이브러리입니다. 이 글에서는 실무에서 React Query를 사용하여 서버 상태를 효율적으로 관리하는 방법과 최적화 패턴을 다룹니다.

## React Query 기본 개념

### 1. useQuery - 데이터 가져오기

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 1000 * 60, // 1분 후 fresh
  cacheTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
})
```

**핵심 옵션:**
- `queryKey`: 캐시 키 (배열 사용 권장)
- `staleTime`: 언제 fresh 간주 (캐시 hit)
- `cacheTime`: 백그라운드 캐시 유지 시간

### 2. useMutation - 데이터 수정

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onSuccess: (data) => {
    // 성공 후 캐시 무효화
    queryClient.invalidateQueries(['posts'])
  },
  onSettled: () => {
    // mutation 완료 후 처리
    queryClient.refetchQueries(['posts'])
  }
})
```

## 캐싱 전략

### 1. 캐시 시간 계층

```tsx
const cacheConfig = {
  posts: {
    staleTime: 1000 * 60, // 1분
    cacheTime: 1000 * 60 * 5, // 5분
  },
  userProfile: {
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 15, // 15분
  },
  settings: {
    staleTime: Infinity, // 수동 무효화만
    cacheTime: Infinity,
  }
}
```

**Trade-off:**
- 짧은 staleTime: 최신성 높음, API 호출 증가
- 긴은 cacheTime: 오프라인 경험, 최신성 낮음

### 2. 캐시 무효화 전략

```tsx
// 방법 1: 특정 쿼리 무효화
queryClient.invalidateQueries(['posts'])

// 방법 2: 정규식 기반 무효화
queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0] === 'posts'
  }
})

// 방법 3: 특정 필터로 무효화
queryClient.invalidateQueries({
  queryKey: ['posts'],
  refetchType: 'active'
})
```

## Optimistic Updates (낙관적 업데이트)

### 개요

서버 응답을 기다리지 않고, 즉시 UI를 업데이트하는 방식입니다.

```tsx
const updatePostMutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    // 1. 이전 상태 백업
    const previousPosts = queryClient.getQueryData(['posts'])
    
    // 2. 낙관적 업데이트
    queryClient.setQueryData(['posts'], (old) => {
      return [...old, { ...newPost, id: 'temp-' + Date.now() }]
    })
    
    return { previousPosts }
  },
  onError: (err, newPost, context) => {
    // 3. 에러 시 롤백
    if (context?.previousPosts) {
      queryClient.setQueryData(['posts'], context.previousPosts)
    }
  },
  onSettled: () => {
    // 4. mutation 완료 후 리프레시
    queryClient.invalidateQueries(['posts'])
  }
})
```

## 서버 상태 관리 패턴

### 1. Infinite Scroll (무한 스크롤)

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage, pages) => {
    if (lastPage.length < 10) return undefined
    return pages.length
  }
})
```

### 2. Pagination (페이지네이션)

```tsx
const {
  data,
  isLoading,
  isPreviousData,
} = useQuery({
  queryKey: ['posts', page],
  queryFn: () => fetchPosts(page),
  keepPreviousData: true,
})

return (
  <>
    <button 
      disabled={page === 1} 
      onClick={() => setPage(p => p - 1)}
    >
      이전
    </button>
    <span>{page}</span>
    <button 
      disabled={!hasNextPage} 
      onClick={() => setPage(p => p + 1)}
    >
      다음
    </button>
  </>
)
```

### 3. Dependent Queries (의존성 쿼리)

```tsx
// useUser 쿼리가 user.id를 반환한다고 가정
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  enabled: !!authToken, // 토큰이 있을 때만 실행
})

const { data: userPosts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchUserPosts(user.id),
  enabled: !!user, // user 로딩 완료 후 실행
})
```

## 성능 최적화 팁

### 1. QueryClient 분리

```tsx
// 전역 쿼리 클라이언트 사용
const queryClient = useQueryClient()

// 여러 컴포넌트에서 같은 쿼리 클라이언트 공유
export function useCustomQuery() {
  return useQueryClient()
}
```

### 2. 쿼리 선택적 리패치

```tsx
// 필요한 경우에만 refetch
const handleRefresh = () => {
  queryClient.refetchQueries(['posts'], { type: 'active' })
}
```

### 3. 캐시 사이즈 관리

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 5, // 5분
      staleTime: 1000 * 60, // 1분
    },
  },
  queryCacheSize: 100, // 최대 100개 캐시
  })
```

## 실전 패턴

### 1. 폼 제출 후 리프레시

```tsx
const submitMutation = useMutation({
  mutationFn: submitForm,
  onSuccess: () => {
    // 폼 제출 성공 후 관련 쿼리 리프레시
    queryClient.invalidateQueries(['form-data'])
    // 성공 메시지 표시
    toast.success('제출 완료!')
  }
})

const handleSubmit = (data) => {
  submitMutation.mutate(data)
}
```

### 2. 실시간 데이터 동기화

```tsx
// WebSockets 또는 Server-Sent Events 사용
useEffect(() => {
  const socket = io(API_URL)
  
  socket.on('posts:update', (newPost) => {
    // 실시간 업데이트 시 캐시 업데이트
    queryClient.setQueryData(['posts'], (old) => {
      return old.map(post => 
        post.id === newPost.id ? newPost : post
      )
    })
  })
  
  return () => {
    socket.disconnect()
  }
}, [])
```

## 에러 핸들링

### 1. 글로벌 에러 핸들러

```tsx
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error.status === 401) {
        // 인증 에러 처리
        navigate('/login')
      } else if (error.status === 403) {
        // 권한 에러 처리
        toast.error('접근 권한이 없습니다.')
      }
    }
  })
})
```

### 2. Mutation 에러 핸들링

```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onError: (error) => {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else {
      toast.error('요청에 실패했습니다.')
    }
  },
})
```

## 결론

React Query를 사용하여 서버 상태를 관리하면:

1. **자동 캐싱**: 불필요한 API 호출 감소
2. **낙관적 업데이트**: 사용자 경험 개선
3. **자동 리패치**: 데이터 최신성 유지
4. **에러 핸들링**: 일관된 에러 처리
5. **개발 생산성**: 반복적인 상태 관리 코드 작성 감소

실무에서는 프로젝트의 요구사항에 맞춰 캐시 전략, 낙관적 업데이트, 에러 핸들링을 적절히 조합하여 사용하는 것이 중요합니다.
