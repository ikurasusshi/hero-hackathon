// ToDoスライド→ToDo管理への自動反映
import { state } from "./state.js";

function renderTodos() {
  const ul = document.getElementById("todoList");
  if (!ul) return;
  ul.innerHTML = "";
  state.todos.forEach((td) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (td.done ? " completed" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = td.done;
    cb.addEventListener("change", () => {
      td.done = cb.checked;
      li.className = "todo-item" + (td.done ? " completed" : "");
    });

    const span = document.createElement("span");
    span.textContent = td.title;
    span.style.flex = "1";

    const del = document.createElement("button");
    del.className = "btn";
    del.textContent = "削除";
    del.addEventListener("click", () => {
      const i = state.todos.findIndex((x) => x.id === td.id);
      if (i >= 0) {
        state.todos.splice(i, 1);
        renderTodos();
      }
    });

    li.appendChild(cb);
    li.appendChild(span);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function syncFromTextarea() {
  const ta = document.getElementById("todoContent");
  if (!ta) return;
  const lines = ta.value
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set(state.todos.map((t) => t.title));
  lines.forEach((line) => {
    if (!set.has(line)) {
      state.todos.push({
        id: "td_" + Math.random().toString(36).slice(2, 9),
        title: line,
        done: false,
      });
    }
  });
  renderTodos();
}

export function initTodos() {
  const ta = document.getElementById("todoContent");
  if (ta) {
    ta.addEventListener("input", syncFromTextarea);
  }
  renderTodos();
}
