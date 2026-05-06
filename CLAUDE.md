# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 실행 방법

별도의 빌드 과정 없음. `index.html`을 브라우저에서 직접 열면 동작한다.

```
# 예: VS Code Live Server, 또는 브라우저에서 파일 직접 열기
start index.html
```

## 아키텍처

빌드 도구나 프레임워크 없는 순수 바닐라 JS 앱. 파일 3개로 구성.

- **`index.html`** — 앱 뼈대. `#todo-form`, `#todo-input`, `#todo-list` 세 개의 DOM ID가 `app.js`와 결합점.
- **`style.css`** — 레이아웃 및 스타일. `.todo-item.done` 클래스로 완료 상태 시각화.
- **`app.js`** — 전체 로직. `todos` 배열을 단일 상태로 관리하며, 변경 시마다 `save()` → `render()` 순으로 호출해 `localStorage`와 DOM을 동기화.

### 상태 흐름

```
사용자 액션 → todos 배열 수정 → save() (localStorage) → render() (DOM 전체 재생성)
```

데이터 구조: `{ text: string, done: boolean, priority: 'high' | 'mid' | 'low' }[]`

## 코드 주석 규칙

이 프로젝트는 주석을 적극적으로 작성한다. 모든 함수, 로직 분기, 상수에 주석을 달아 코드의 의도와 동작을 명확히 설명한다.

### 주석 작성 기준

- **함수 위**: 함수가 하는 일, 매개변수, 반환값을 설명
- **상수/데이터 구조**: 값의 의미와 사용 목적 설명
- **로직 분기 (`if`, 삼항, 순환 등)**: 조건의 의미와 이유 설명
- **DOM 조작**: 어떤 요소를 왜 만드는지 설명
- **이벤트 리스너**: 어떤 사용자 액션에 반응하는지 설명

### 주석 예시

```js
// 우선순위 레이블: 버튼에 표시할 한글 텍스트
const PRIORITY = { high: '높음', mid: '보통', low: '낮음' };

// 우선순위 정렬 가중치: 숫자가 작을수록 목록 상단에 표시
const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };

/**
 * todos 배열을 localStorage에 저장한다.
 * 상태 변경 시 항상 render() 전에 호출한다.
 */
function save() { ... }

/**
 * 현재 탭(currentTab)에 따라 todos를 필터링해 반환한다.
 * - 'all': 전체
 * - 'active': 미완료 항목만
 * - 'done': 완료 항목만
 */
function getFiltered() { ... }

/**
 * 필터링된 todos를 우선순위 순으로 정렬 후 DOM을 전체 재생성한다.
 * 상태 변경 시마다 호출되며, 부분 업데이트 없이 항상 전체를 다시 그린다.
 */
function render() { ... }
```
