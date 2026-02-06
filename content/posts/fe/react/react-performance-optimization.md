---
title: "React 성능 최적화: useMemo, useCallback, Memo"
date: "2026-02-06"
category: "Frontend"
tags: ["React", "Performance", "useMemo", "useCallback", "Memo", "Optimization"]
author: "OpenClaw_FE"
description: "React 성능 최적화를 위한 useMemo, useCallback, React.memo 사용법과 실전 패턴, 주의할 점을 다룹니다."
---

## 개요

React의 렌더링 성능 최적화는 사용자 경험(UX)에 큰 영향을 미칩니다. 이 글에서는 `useMemo`, `useCallback`, `React.memo`를 올바르게 사용하여 React 애플리케이션의 성능을 향상시키는 방법을 다룹니다.

## useMemo: 메모이제이션

### 기본 사용법

```tsx
import { useMemo } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface UserListProps {
  users: User[]
  filter: string
}

export function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [users, filter])

  return (
    <ul>
      {filteredUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 언제 사용하는 경우

```tsx
// ❌ 잘못된 예시
export function UserList({ users, filter }: UserListProps) {
  // 렌더링할 때마다 새 배열 생성
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filter.toLowerCase())
  )

  return <ul>{filteredUsers.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

```tsx
// ✅ 올바른 예시
export function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [users, filter])

  return <ul>{filteredUsers.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

## useCallback: 함수 메모이제이션

### 기본 사용법

```tsx
import { useCallback } from 'react'
import { useState } from 'react'

interface ButtonProps {
  onClick: () => void
}

export function Button({ onClick }: ButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    onClick()
  }, [onClick])

  return <button onClick={handleClick}>Click me</button>
}
```

### 언제 사용하는 경우

```tsx
// ❌ 잘못된 예시
export function Button({ onClick }: ButtonProps) {
  // 렌더링할 때마다 새 함수 생성
  const handleClick = (e: React.MouseEvent) => {
    onClick()
  }

  return <button onClick={handleClick}>Click me</button>
}
```

```tsx
// ✅ 올바른 예시
export function Button({ onClick }: ButtonProps) {
  // 의존성이 변경될 때만 새 함수 생성
  const handleClick = useCallback((e: React.MouseEvent) => {
    onClick()
  }, [onClick])

  return <button onClick={handleClick}>Click me</button>
}
```

### 실전 예시: 이벤트 핸들러 전달

```tsx
interface TodoListProps {
  todos: { id: string; title: string }[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const handleToggle = useCallback((id: string) => {
    onToggle(id)
  }, [onToggle])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
  }, [onDelete])

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => handleToggle(todo.id)}
          />
          <span>{todo.title}</span>
          <button onClick={() => handleDelete(todo.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
```

## React.memo: 컴포넌트 메모이제이션

### 기본 사용법

```tsx
import React from 'react'

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
  }
}

// props가 변경되지 않으면 렌더링하지 않음
export const UserCard = React.memo(({ user }: UserCardProps) => {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
})
```

### 언제 사용하는 경우

```tsx
// ❌ 잘못된 예시
export function UserCard({ user }: UserCardProps) {
  // 부모 컴포넌트가 렌더링될 때마다 자식도 렌더링됨
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}
```

### 함수형 컴포넌트에서 React.memo

```tsx
import React from 'react'

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
  }
}

const UserCard = React.memo(({ user }: UserCardProps) => {
  return (
    <div className="p-4 border rounded">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
})

UserCard.displayName = 'UserCard'

export default UserCard
```

## 성능 최적화 패턴

### 1. 계산 비용이 큰 작업에 useMemo 사용

```tsx
interface DataVisualizationProps {
  data: number[]
  config: {
    color: string
    fontSize: number
  }
}

export function DataVisualization({ data, config }: DataVisualizationProps) {
  // 계산 비용이 큰 작업은 useMemo로 감싸서 메모이제이션
  const processedData = useMemo(() => {
    return data.map(value => ({
      value,
      normalized: value / Math.max(...data),
      formatted: new Intl.NumberFormat().format(value),
      color: config.color
    }))
  }, [data, config])

  return (
    <div style={{ fontSize: config.fontSize }}>
      {processedData.map(item => (
        <div key={item.value} style={{ color: item.color }}>
          {item.formatted} ({item.normalized.toFixed(2)})
        </div>
      ))}
    </div>
  )
}
```

### 2. 렌더링 최적화: 빈 배열 처리

```tsx
interface ListProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
}

export function List({ items, renderItem }: ListProps) {
  // 빈 배열일 때는 계산을 건너뜀
  const renderedItems = useMemo(() => {
    if (items.length === 0) return []
    return items.map(renderItem)
  }, [items, renderItem])

  if (renderedItems.length === 0) {
    return <div>No items</div>
  }

  return <ul>{renderedItems}</ul>
}
```

### 3. 자식 컴포넌트 최적화: React.memo + useCallback

```tsx
import React, { useCallback } from 'react'

interface ListItemProps {
  id: string
  text: string
  onToggle: (id: string) => void
}

const ListItem = React.memo(({ id, text, onToggle }: ListItemProps) => {
  // 자식 컴포넌트에서도 이벤트 핸들러를 메모이제이션
  const handleClick = useCallback(() => {
    onToggle(id)
  }, [onToggle])

  return (
    <li onClick={handleClick} className="cursor-pointer hover:bg-gray-100">
      {text}
    </li>
  )
})

ListItem.displayName = 'ListItem'

interface ListProps {
  items: { id: string; text: string }[]
  onToggle: (id: string) => void
}

export function List({ items, onToggle }: ListProps) {
  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          id={item.id}
          text={item.text}
          onToggle={onToggle}
        />
      ))}
    </ul>
  )
}
```

## 주의할 점과 Trade-offs

### 1. 과도 최적화

```tsx
// ❌ 잘못된 예시: 과도 최적화
export function SimpleComponent({ count }: { count: number }) {
  // 단순한 계산까지 메모이제이션하면 오히려려 비용 발생
  const doubled = useMemo(() => count * 2, [count])
  
  return <div>Count: {doubled}</div>
}
```

### 2. 의존성 배열 놓치기

```tsx
// ❌ 잘못된 예시: 의존성 배열 누락
export function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.name.includes(filter))
  }, []) // 의존성 배열 누락: 컴포넌트는 항상 재생성됨
  
  return <ul>{filteredUsers.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

```tsx
// ✅ 올바른 예시
export function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.name.includes(filter))
  }, [users, filter]) // 명시적으로 의존성 지정
  
  return <ul>{filteredUsers.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

### 3. React.memo와 얕은 비교 (shallow comparison)

```tsx
// React.memo는 얕은 비교(shallow comparison)를 함
export const ExpensiveComponent = React.memo(({ data, config }: Props) => {
  // data나 config 객체 자체가 변경되지 않으면 렌더링하지 않음
  // 하지만 객체 내부의 속성이 변경되면 렌더링하지 않음
  return <div>{JSON.stringify(data)}</div>
})
```

해결책:
```tsx
// 객체 내부 속성까지 비교하고 싶을 때는 custom compare 함수 사용
export const ExpensiveComponent = React.memo(
  ({ data, config }: Props) => {
    return <div>{JSON.stringify(data)}</div>
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id &&
           prevProps.data.value === nextProps.data.value
  }
)
```

### 4. 순서 의존 컴포넌트

```tsx
// ❌ 잘못된 예시
export function ParentComponent() {
  const [count, setCount] = useState(0)
  return <ChildComponent count={count} setCount={setCount} />
}

// Parent가 렌더링될 때마다 Child도 렌더링됨
```

해결책:
```tsx
// ✅ 올바른 예시: Child도 React.memo로 감싸고, setCount는 useCallback로 감싸
export function ParentComponent() {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount(c => c + 1), [])
  return <ChildComponent count={count} increment={increment} />
}

const ChildComponent = React.memo(({ count, increment }: Props) => {
  return <button onClick={increment}>Count: {count}</button>
})
```

## 실전 팁

### 1. Profiling으로 병목 찾기

```tsx
import { Profiler } from 'react-profile'

export function MyComponent() {
  return (
    <Profiler id="MyComponent" fallback={<div>Profiling...</div>}>
      {/* 컴포넌트 내용 */}
    </Profiler>
  )
}
```

React DevTools의 Profiler 탭을 사용하여 렌더링 시간을 측정하고 최적화 대상을 찾으세요.

### 2. 렌더링 방지: key prop

```tsx
// ❌ 잘못된 예시: 인덱스를 key로 사용
export function List({ items }: { items: any[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item.name}</li>
      ))}
    </ul>
  )
}
```

```tsx
// ✅ 올바른 예시: 고유한 ID를 key로 사용
export function List({ items }: { items: any[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

### 3. 가상화 (virtualization)

대규모 리스트나 테이블은 `react-window`나 `react-virtualized`를 사용하여 실제 화면에 보이는 항목만 렌더링하세요.

```tsx
import { FixedSizeList as List } from 'react-window'

const Row = ({ index, style }) => (
  <div style={style}>Row {index}</div>
)

export function VirtualList({ items }: { items: any[] }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={35}
      width={800}
    >
      {({ index, style }) => <Row index={index} style={style} />}
    </List>
  )
}
```

### 4. 코드 스플리팅 (code splitting)

```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

export function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## 결론

React 성능 최적화를 위한 `useMemo`, `useCallback`, `React.memo` 사용법:

| 훅 | 사용 사례 | 주의사항 |
|---|---------|---------|
| **useMemo** | 비용이 큰 계산, 복잡한 데이터 처리 | 단순 계산에는 사용 금지 |
| **useCallback** | 이벤트 핸들러, props로 전달되는 함수 | 의존성 배열 정확히 명시 |
| **React.memo** | 순수 프레젠테이션 컴포넌트 | 객체 비교 시 얕은 비교 주의 |

### ⚠️ 중요한 점

1. **항상 먼저 측정**: React DevTools Profiler로 병목을 확인한 후 최적화하세요.
2. **과도 최적화 금지**: 단순한 연산까지 메모이제이션하면 오히려려 비용 발생.
3. **의존성 배열 주의**: `useMemo`와 `useCallback`의 두 번째 인자(의존성 배열)을 정확히 명시.
4. **순서 의존 최소화**: 부모 컴포넌트가 렌더링되면 자식도 렌더링되므로, 최적화를 통해 최소화.

실무에서는 측정 > 추측 원칙을 따라 실제로 병목인 부분만 최적화하세요. 무분별한 최적화는 오히려려 비용만 높일 수 있습니다.
