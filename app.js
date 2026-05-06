const viewTitle   = document.getElementById('view-title');
const backBtn     = document.getElementById('back-btn');
const calendarView = document.getElementById('calendar-view');
const dateView    = document.getElementById('date-view');
const calDays     = document.getElementById('cal-days');
const calLabel    = document.getElementById('cal-month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const form        = document.getElementById('todo-form');
const input       = document.getElementById('todo-input');
const list        = document.getElementById('todo-list');
const tabs        = document.querySelectorAll('.tab');

// 우선순위 레이블: 버튼에 표시할 한글 텍스트
const PRIORITY = { high: '높음', mid: '보통', low: '낮음' };

// 우선순위 정렬 가중치: 숫자가 작을수록 목록 상단에 표시
const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };

// 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환한다.
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * localStorage에서 todos를 불러온다.
 * 이전 버전 데이터에 date 필드가 없으면 오늘 날짜로 마이그레이션한다.
 */
function loadTodos() {
  const raw = JSON.parse(localStorage.getItem('todos') || '[]');
  const today = getToday();
  return raw.map(t => ({ ...t, date: t.date || today }));
}

/**
 * todos 배열을 localStorage에 저장한다.
 * 상태 변경 시 항상 render 전에 호출한다.
 */
function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

let todos = loadTodos();
let currentTab = 'all';

// 현재 달력이 표시 중인 연/월
const now = new Date();
let calYear  = now.getFullYear();
let calMonth = now.getMonth(); // 0-indexed

// 현재 선택된 날짜 (상세 뷰에서 사용)
let selectedDate = null;

/**
 * 'YYYY-MM-DD' 날짜를 달력 헤더용 한글 문자열로 변환한다.
 * 오늘이면 'Today' 접두어를 붙인다.
 */
function formatDateTitle(dateStr) {
  const today = getToday();
  const d = new Date(dateStr + 'T00:00:00');
  const label = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return dateStr === today ? `Today · ${label}` : label;
}

// ── 달력 렌더링 ──────────────────────────────────────────

/**
 * 현재 calYear/calMonth 기준으로 월 달력을 렌더링한다.
 * 각 날짜 셀에 해당 날의 할일 요약(완료/전체)을 표시한다.
 */
function renderCalendar() {
  calendarView.style.display = 'block';
  dateView.style.display = 'none';
  backBtn.style.display = 'none';
  viewTitle.textContent = 'Todo';

  calLabel.textContent = `${calYear}년 ${calMonth + 1}월`;
  calDays.innerHTML = '';

  const today = getToday();
  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=일
  const lastDate = new Date(calYear, calMonth + 1, 0).getDate();

  // 첫 날 요일만큼 빈 셀 삽입
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-cell empty';
    calDays.appendChild(blank);
  }

  // 날짜 셀 생성
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTodos = todos.filter(t => t.date === dateStr);
    const total = dayTodos.length;
    const done  = dayTodos.filter(t => t.done).length;

    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateStr === today) cell.classList.add('today');

    // 날짜 숫자
    const dateNum = document.createElement('span');
    dateNum.className = 'cal-date-num';
    dateNum.textContent = d;
    cell.appendChild(dateNum);

    // 할일 요약 배지: 할일이 있는 날만 표시
    if (total > 0) {
      const badge = document.createElement('span');
      // 모두 완료면 녹색, 진행 중이면 파란색 배지
      badge.className = done === total ? 'cal-badge all-done' : 'cal-badge';
      badge.textContent = `${done}/${total}`;
      cell.appendChild(badge);

      // 미완료 할일의 우선순위 점 표시 (최대 3개)
      const activeTodos = dayTodos.filter(t => !t.done).slice(0, 3);
      if (activeTodos.length > 0) {
        const dots = document.createElement('div');
        dots.className = 'cal-dots';
        activeTodos.forEach(t => {
          const dot = document.createElement('span');
          dot.className = `cal-dot priority-dot-${t.priority || 'mid'}`;
          dots.appendChild(dot);
        });
        cell.appendChild(dots);
      }
    }

    // 날짜 셀 클릭 시 해당 날짜 상세 뷰로 이동
    cell.addEventListener('click', () => {
      selectedDate = dateStr;
      currentTab = 'all';
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelector('[data-tab="all"]').classList.add('active');
      renderDateView();
    });

    calDays.appendChild(cell);
  }
}

// ── 날짜 상세 뷰 렌더링 ──────────────────────────────────

/**
 * 선택된 날짜(selectedDate)의 할일 목록을 렌더링한다.
 * 탭 필터와 우선순위 정렬이 적용된다.
 */
function renderDateView() {
  calendarView.style.display = 'none';
  dateView.style.display = 'block';
  backBtn.style.display = 'inline-flex';
  viewTitle.textContent = formatDateTitle(selectedDate);

  list.innerHTML = '';

  const filtered = todos
    .filter(t => t.date === selectedDate)
    .filter(t => {
      if (currentTab === 'active') return !t.done;
      if (currentTab === 'done')   return t.done;
      return true;
    })
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority || 'mid'] - PRIORITY_ORDER[b.priority || 'mid']);

  // 빈 상태 메시지
  if (filtered.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-msg';
    empty.textContent =
      currentTab === 'done'   ? '완료된 항목이 없습니다.' :
      currentTab === 'active' ? '진행 중인 항목이 없습니다.' :
                                '할 일을 추가해보세요!';
    list.appendChild(empty);
    return;
  }

  filtered.forEach(todo => {
    const index = todos.indexOf(todo);
    const priority = todo.priority || 'mid';

    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => {
      todos[index].done = checkbox.checked;
      save();
      renderDateView();
    });

    const span = document.createElement('span');
    span.textContent = todo.text;

    const priorityBtn = document.createElement('button');
    priorityBtn.className = `priority-btn priority-${priority}`;
    priorityBtn.textContent = PRIORITY[priority];
    priorityBtn.addEventListener('click', () => {
      const cycle = { high: 'mid', mid: 'low', low: 'high' };
      todos[index].priority = cycle[priority];
      save();
      renderDateView();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      todos.splice(index, 1);
      save();
      renderDateView();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(priorityBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// ── 이벤트 리스너 ────────────────────────────────────────

// 이전 달 버튼
prevMonthBtn.addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

// 다음 달 버튼
nextMonthBtn.addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

// 뒤로가기: 달력으로 돌아가며 달력도 갱신한다
backBtn.addEventListener('click', () => {
  renderCalendar();
});

// 탭 필터 전환
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderDateView();
  });
});

// 할일 추가: 선택된 날짜로 저장
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false, priority: 'mid', date: selectedDate });
  save();
  currentTab = 'all';
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="all"]').classList.add('active');
  renderDateView();
  input.value = '';
});

// 초기 진입: 월 달력 표시
renderCalendar();
