(function () {
  const listEl = document.getElementById("todo-list");
  const newInput = document.getElementById("new-todo");
  const addBtn = document.getElementById("add-btn");
  const tabs = document.querySelectorAll(".tab");
  const countEl = document.getElementById("count");
  const clearBtn = document.getElementById("clear-completed");
  const logoutBtn = document.getElementById("logout");
  const userEmailEl = document.getElementById("user-email");

  let todos = [];
  let filter = "all"; // 'all' | 'active' | 'completed'

  // Guard: require auth
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "./auth.html";
  }

  userEmailEl.textContent = localStorage.getItem("email") || "";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.href = "./auth.html";
  });

  function applyFilter(items, f) {
    if (f === "active") return items.filter((t) => !t.completed);
    if (f === "completed") return items.filter((t) => t.completed);
    return items;
  }

  function render() {
    const filtered = applyFilter(todos, filter);
    listEl.innerHTML = "";

    filtered.forEach((t) => {
      const li = document.createElement("li");
      li.className = "todo";
      li.dataset.id = t._id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!t.completed;
      checkbox.setAttribute("aria-label", "Toggle completed");

      const text = document.createElement("div");
      text.className = "text";
      text.textContent = t.text;
      text.tabIndex = 0;
      text.setAttribute("role", "textbox");

      const actions = document.createElement("div");
      actions.className = "actions";

      const delBtn = document.createElement("button");
      delBtn.className = "btn subtle";
      delBtn.textContent = "Delete";
      delBtn.setAttribute("aria-label", "Delete task");

      actions.appendChild(delBtn);
      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(actions);
      listEl.appendChild(li);

      checkbox.addEventListener("change", async () => {
        try {
          const updated = await API.patch(`/todos/${t._id}`, {
            completed: checkbox.checked,
          });
          const idx = todos.findIndex((x) => x._id === t._id);
          if (idx > -1) todos[idx] = updated;
          render();
        } catch (err) {
          alert(err.message);
          checkbox.checked = !checkbox.checked;
        }
      });

      // Inline edit on click or Enter
      function enterEdit() {
        text.setAttribute("contenteditable", "true");
        text.focus();
        placeCaretAtEnd(text);
      }

      text.addEventListener("click", enterEdit);
      text.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          text.blur();
        } else if (e.key === "Escape") {
          text.textContent = t.text;
          text.blur();
        }
      });

      text.addEventListener("blur", async () => {
        const newText = text.textContent.trim();
        if (!newText || newText === t.text) {
          text.textContent = t.text; // reset if empty or unchanged
          text.removeAttribute("contenteditable");
          return;
        }
        try {
          const updated = await API.patch(`/todos/${t._id}`, { text: newText });
          const idx = todos.findIndex((x) => x._id === t._id);
          if (idx > -1) todos[idx] = updated;
          text.textContent = updated.text;
        } catch (err) {
          alert(err.message);
          text.textContent = t.text;
        } finally {
          text.removeAttribute("contenteditable");
          render();
        }
      });

      delBtn.addEventListener("click", async () => {
        if (!confirm("Delete this task?")) return;
        try {
          await API.del(`/todos/${t._id}`);
          todos = todos.filter((x) => x._id !== t._id);
          render();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    // Count (remaining active)
    const remaining = todos.filter((t) => !t.completed).length;
    countEl.textContent = `${remaining} item${remaining !== 1 ? "s" : ""} left`;
  }

  function placeCaretAtEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  async function loadTodos() {
    try {
      todos = await API.get("/todos");
      render();
    } catch (err) {
      alert(err.message || "Failed to load todos");
      if (err.message === "Unauthorized" || err.message === "Invalid token") {
        localStorage.removeItem("token");
        window.location.href = "./auth.html";
      }
    }
  }

  async function addTodo() {
    const text = newInput.value.trim();
    if (!text) return;
    try {
      const created = await API.post("/todos", { text });
      todos.unshift(created);
      newInput.value = "";
      render();
    } catch (err) {
      alert(err.message);
    }
  }

  addBtn.addEventListener("click", addTodo);
  newInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      filter = tab.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", async () => {
    const completed = todos.filter((t) => t.completed);
    if (!completed.length) return;
    if (!confirm("Clear all completed tasks?")) return;

    try {
      // Sequentially delete to keep API minimal
      for (const t of completed) {
        await API.del(`/todos/${t._id}`);
      }
      todos = todos.filter((t) => !t.completed);
      render();
    } catch (err) {
      alert(err.message);
    }
  });

  loadTodos();
})();
