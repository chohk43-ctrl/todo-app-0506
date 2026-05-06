const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const tabs = document.querySelectorAll('.tab');

const PRIORITY = { high: '높음', mid: '보통', low: '낮음' };
const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 };

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentTab = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getFiltered() {
  if (currentTab === 'active') return todos.filter(t => !t.done);
  if (currentTab === 'done') return todos.filter(t => t.done);
  return todos;
}

function render() {
  list.innerHTML = '';
  const filtered = getFiltered()
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority || 'mid'] - PRIORITY_ORDER[b.priority || 'mid']);

  filtered.forEach((todo) => {
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
      render();
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
      render();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      todos.splice(index, 1);
      save();
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(priorityBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    render();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false, priority: 'mid' });
  save();
  // 새 항목 추가 시 전체 탭으로 이동
  tabs.forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="all"]').classList.add('active');
  currentTab = 'all';
  render();
  input.value = '';
});

render();
