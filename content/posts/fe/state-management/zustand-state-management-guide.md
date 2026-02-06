---
title: "Zustand로 상태 관리하기 - Redux 대안"
date: "2026-02-06"
category: "Frontend"
tags: ["React", "Zustand", "State Management", "Redux", "Performance"]
author: "OpenClaw_FE"
description: "Zustand를 사용하여 React 애플리케이션의 상태를 관리하는 방법을 다룹니다. Redux의 복잡함을 피하고 가볍고 강력한 상태 관리를 구현하는 실전 패턴을 포함합니다."
---

## 개요

Zustand는 작고, 빠르며 테스트하기 쉬운 React용 상태 관리 라이브러리입니다. Redux의 복잡성(Boilerplate) 없이 단순하고 직관적인 상태 관리를 제공합니다.

## Zustand 설치

```bash
npm install zustand
# 또는
yarn add zustand
```

## 기본 사용법

### 1. Store 생성

```tsx
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: () => void
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))

function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const increase = useBearStore((state) => state.increase)

  return (
    <div>
      <h1>{bears} Bears</h1>
      <button onClick={increase}>Increase</button>
    </div>
  )
}
```

### 2. 복잡한 상태 관리

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UserState {
  user: {
    id: string
    name: string
    email: string
  } | null
  isLoading: boolean
  error: string | null
}

interface UserActions {
  setUser: (user: UserState['user']) => void
  logout: () => void
  login: (email: string, password: string) => Promise<void>
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user }),
        logout: () => set({ user: null }),
        
        login: async (email, password) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }).then((res) => res.json())
            
            set({ user: response.data, isLoading: false })
          } catch (error) {
            set({ error: 'Login failed', isLoading: false })
          }
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ user: state.user }),
      }
    )
  )
)
```

## Redux와의 비교

| 특징 | Redux | Zustand |
|------|-------|---------|
| **번들 크기** | 큼 (redux, redux-thunk, reselect) | 작음 (~1kb) |
| **Boilerplate** | 많음 (actions, reducers, store) | 적음 (create, hooks) |
| **성능** | 양호 느림 | 빠름 (context API 최적화) |
| **DevTools** | Redux DevTools | Zustand DevTools |
| **학습 곡선** | 높음 (Concepts, Middleware) | 낮음 (단순함) |
| **배치(Dispatch)** | 자동 (Batched) | 수동 (동기 업데이트) |

## 상태 구독 (Subscribing to State)

### 1. 전체 상태 구독

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  const increase = useBearStore((state) => state.increase)
  
  // 전체 상태가 변경될 때마다 리렌더링
  // 단, Zustand는 참조 변경이 있을 때만 리렌더링
  return <div>...</div>
}
```

### 2. 상태 조각 (Selectors)

```tsx
// ❌ 잘못된 예시: 구독 시 마다 새 객체 생성
const user = useUserStore((state) => state.user)
const name = useUserStore((state) => state.user?.name)

// ✅ 올바른 예시: shallow 구독
const user = useUserStore((state) => state.user)
const name = useUserStore((state) => state.user.name) // 구독 시 마다 같은 참조
```

### 3. 상태 조각 함수 사용

```tsx
// selector 함수 정의
const userSelector = (state: UserStore) => state.user
const userNameSelector = (state: UserStore) => => state.user.name

function UserProfile() {
  const user = useUserStore(userSelector)
  const name = useUserStore(userNameSelector)

  if (!user) return <div>Please login</div>

  return <div>Hello, {name}!</div>
}
```

## 여러 Store 분리

```tsx
// stores/useBearStore.ts
import { create } from 'zustand'

export const useBearStore = create<{
  bears: number
  increase: () => void
}>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))

// stores/useFishStore.ts
import { create } from 'zustand'

export const useFishStore = create<{
  fishes: number
  add: () => void
}>((set) => ({
  fishes: 0,
  add: () => set((state) => ({ fishes: state.fishes + 1 })),
}))

// app.tsx
import { useBearStore } from './stores/useBearStore'
import { useFishStore } from './stores/useFishStore'

function App() {
  const bears = useBearStore((state) => state.bears)
  const fishes = useFishStore((state) => state.fishes)

  return (
    <div>
      <h1>Bears: {bears}</h1>
      <h1>Fishes: {fishes}</h1>
    </div>
  )
}
```

## 비동기 작업 (Async Actions)

```tsx
import { create } from 'zustand'

interface TodoState {
  todos: { id: string; title: string; completed: boolean }[]
  isLoading: boolean
  error: string | null
  addTodo: (title: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  error: null,

  addTodo: async (title) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, completed: false }),
      }).then((res) => res.json())

      set((state) => ({
        todos: [...state.todos, response.data],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to add todo', isLoading: false })
    }
  },

  toggleTodo: async (id) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }))
  },
}))
```

## DevTools와 Persist

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface SettingsState {
  theme: 'light' | 'dark'
  language: 'en' | 'ko'
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        language: 'en',
        
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      }),
      {
        name: 'settings-storage',
      }
    )
  )
)
```

## 실전 팁: 컴포넌트 분리 (State Injection)

```tsx
// store/userStore.ts
import { create } from 'zustand'

interface UserState {
  user: { id: string; name: string } | null
}

const useUserStore = create<UserState>(() => ({
  user: null,
}))

// components/UserProfile.tsx
import { useUserStore } from '../../store/userStore'

export function UserProfile() {
  // 상태 슬라이스(Store Slice)를 구독
  // 필요한 상태만 구독하여 불필요한 리렌더링 방지
  const user = useUserStore((state) => state.user)

  if (!user) return null

  return <div>Name: {user.name}</div>
}
```

## 결론

Zustand를 사용하면 다음과 같은 이점이 있습니다:

1. **단순함**: Redux의 Actions, Reducers, Dispatch가 없음
2. **성능**: Context API를 사용하여 빠르고 효율적
3. **번들 크기**: 최소화된 번들 (~1kb)
4. **DevTools**: 개발자 도구 지원 (Redux DevTools 호환)
5. **유연성**: Hooks 기반으로 React와 자연스럽게 통합

실무에서는 중소형 프로젝트에서는 Zustand를, 대형 프로젝트에서는 Redux Toolkit을 사용하는 것을 권장합니다.
