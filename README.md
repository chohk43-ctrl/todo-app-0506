# Todo App

우선순위 관리가 가능한 바닐라 JS 할 일 목록 앱.

## 실행 방법

빌드 과정 없음. `index.html`을 브라우저에서 직접 열면 바로 동작한다.

```bash
# Windows
start index.html

# 또는 VS Code Live Server 확장으로 실행
```

## 기능

- **할 일 추가** — 입력창에 텍스트 입력 후 추가 버튼 또는 Enter
- **완료 체크** — 체크박스 클릭으로 완료/미완료 토글
- **우선순위 설정** — 높음 → 보통 → 낮음 순으로 순환 클릭, 우선순위 높은 항목이 목록 상단에 정렬됨
- **항목 삭제** — ✕ 버튼으로 삭제
- **탭 필터링** — 전체 보기 / 진행중 / 완료 탭으로 필터링
- **데이터 유지** — `localStorage`에 저장되어 새로고침 후에도 유지

## 파일 구조

```
todo-app/
├── index.html   # 앱 뼈대 (DOM 구조)
├── style.css    # 레이아웃 및 스타일
└── app.js       # 전체 로직 및 상태 관리
```

## 아키텍처

프레임워크 없는 순수 바닐라 JS. `todos` 배열을 단일 상태로 관리하며, 변경 시마다 `save() → render()` 순으로 호출해 `localStorage`와 DOM을 동기화한다.

```
사용자 액션 → todos 배열 수정 → save() (localStorage) → render() (DOM 전체 재생성)
```

**데이터 구조**

```js
{ text: string, done: boolean, priority: 'high' | 'mid' | 'low' }[]
```
