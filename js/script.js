document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const timeDisplay = document.getElementById('timeDisplay');
  const dateDisplay = document.getElementById('dateDisplay');
  const greetingTime = document.getElementById('greetingTime');
  const nameContainer = document.getElementById('nameContainer');
  const nameDisplay = document.getElementById('nameDisplay');
  
  const timerDisplay = document.getElementById('timerDisplay');
  const startTimerBtn = document.getElementById('startTimerBtn');
  const pauseTimerBtn = document.getElementById('pauseTimerBtn');
  const resetTimerBtn = document.getElementById('resetTimerBtn');
  const timerOptBtns = document.querySelectorAll('.timer-opt-btn');

  const addLinkForm = document.getElementById('addLinkForm');
  const linkTitleInput = document.getElementById('linkTitleInput');
  const linkUrlInput = document.getElementById('linkUrlInput');
  const linksContainer = document.getElementById('linksContainer');

  const addTodoForm = document.getElementById('addTodoForm');
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  const taskStats = document.getElementById('taskStats');
  const duplicateWarning = document.getElementById('duplicateWarning');

  // Initial State from LocalStorage
  let todos = JSON.parse(localStorage.getItem('dashboard_todos')) || [];
  let links = JSON.parse(localStorage.getItem('dashboard_links')) || [
    { id: '1', title: 'Google', url: 'https://google.com' },
    { id: '2', title: 'GitHub', url: 'https://github.com' }
  ];
  let userName = localStorage.getItem('dashboard_username') || 'User';
  let currentTheme = localStorage.getItem('dashboard_theme') || 'light';

  // --- Theme Toggle ---
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('dashboard_theme', theme);
  };
  applyTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
  });

  // --- Clock & Greeting ---
  const updateClock = () => {
    const now = new Date();
    timeDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);

    const hours = now.getHours();
    if (hours >= 5 && hours < 12) {
      greetingTime.textContent = 'Good morning';
    } else if (hours >= 12 && hours < 18) {
      greetingTime.textContent = 'Good afternoon';
    } else {
      greetingTime.textContent = 'Good evening';
    }
  };
  setInterval(updateClock, 1000);
  updateClock();

  // --- Edit Nama (Max 50 Karakter) ---
  if (nameDisplay) {
    nameDisplay.textContent = userName;
  }

  if (nameContainer) {
    nameContainer.addEventListener('click', () => {
      if (nameContainer.querySelector('input')) return;

      const currentName = userName;
      
      nameContainer.innerHTML = `
        <input type="text" id="nameInput" value="${escapeHtml(currentName)}" maxlength="50" style="font-size: inherit; font-family: inherit; width: 160px; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--primary-color);">
        <button id="saveNameBtn" style="font-size: 0.8em; padding: 4px 8px; cursor: pointer; border-radius: 4px; background: var(--primary-color); color: white; border: none; margin-left: 4px;">Save</button>
      `;

      const nameInput = document.getElementById('nameInput');
      const saveNameBtn = document.getElementById('saveNameBtn');

      nameInput.focus();
      const len = nameInput.value.length;
      nameInput.setSelectionRange(len, len);

      const saveName = () => {
        let val = nameInput.value.trim();
        if (val.length > 50) val = val.substring(0, 50);
        userName = val !== '' ? val : 'User';
        localStorage.setItem('dashboard_username', userName);
        
        nameContainer.innerHTML = `
          <span id="nameDisplay">${escapeHtml(userName)}</span>
          <i class="fa-solid fa-pen name-edit-icon"></i>
        `;
      };

      saveNameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        saveName();
      });

      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveName();
        }
      });
    });
  }

  // --- Focus Timer ---
  let timerInterval = null;
  let timerDuration = 25 * 60; 
  let timeRemaining = timerDuration;

  const renderTimer = () => {
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
  };

  const startTimer = () => {
    if (timerInterval) return;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;

    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        alert('Focus time ended! Take a break.');
        resetTimer();
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
  };

  const resetTimer = () => {
    pauseTimer();
    timeRemaining = timerDuration;
    renderTimer();
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
  };

  startTimerBtn.addEventListener('click', startTimer);
  pauseTimerBtn.addEventListener('click', pauseTimer);
  resetTimerBtn.addEventListener('click', resetTimer);

  timerOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timerOptBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mins = parseInt(btn.dataset.minutes, 10);
      timerDuration = mins * 60;
      resetTimer();
    });
  });

  // --- Quick Links ---
  const saveAndRenderLinks = () => {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
    linksContainer.innerHTML = '';
    
    links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'quick-link-item';
      item.innerHTML = `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title)}</a>
        <button class="link-delete-btn" data-id="${link.id}" aria-label="Delete link">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      linksContainer.appendChild(item);
    });
  };

  addLinkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = linkTitleInput.value.trim();
    let url = linkUrlInput.value.trim();
    if (!title || !url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    links.push({ id: Date.now().toString(), title, url });
    saveAndRenderLinks();
    linkTitleInput.value = '';
    linkUrlInput.value = '';
  });

  linksContainer.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.link-delete-btn');
    if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      links = links.filter(l => l.id !== id);
      saveAndRenderLinks();
    }
  });

  // --- To-Do List (Max 250 Karakter) ---
  const saveAndRenderTodos = () => {
    localStorage.setItem('dashboard_todos', JSON.stringify(todos));
    todoList.innerHTML = '';
    
    let completedCount = 0;
    todos.forEach(todo => {
      if (todo.completed) completedCount++;

      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', todo.id);

      li.innerHTML = `
        <div class="todo-left" style="flex: 1; display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
        </div>
        <div class="todo-actions">
          <button type="button" class="icon-btn edit-btn" data-id="${todo.id}" aria-label="Edit task">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="icon-btn delete-btn" data-id="${todo.id}" aria-label="Delete task">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      todoList.appendChild(li);
    });

    taskStats.textContent = `${completedCount} / ${todos.length} Done`;
  };

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
  }

  addTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let text = todoInput.value.trim();
    if (!text) return;

    if (text.length > 250) {
      text = text.substring(0, 250);
    }

    const isDuplicate = todos.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      duplicateWarning.classList.remove('hidden');
      return;
    }
    duplicateWarning.classList.add('hidden');

    todos.push({ id: Date.now().toString(), text, completed: false });
    saveAndRenderTodos();
    todoInput.value = '';
  });

  todoInput.addEventListener('input', () => {
    duplicateWarning.classList.add('hidden');
  });

  // Handling To-Do Actions (Inline Edit Mode dengan Max 250 Karakter)
  todoList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      e.stopPropagation();
      const id = editBtn.getAttribute('data-id');
      const todo = todos.find(t => t.id === id);
      const li = todoList.querySelector(`li[data-id="${id}"]`);

      if (todo && li) {
        const todoLeft = li.querySelector('.todo-left');
        todoLeft.innerHTML = `
          <input type="text" class="edit-todo-input" value="${escapeHtml(todo.text)}" maxlength="250" style="flex: 1; padding: 4px 8px; border: 1px solid var(--primary-color); border-radius: 4px; font-family: inherit;">
          <button type="button" class="save-todo-btn" style="padding: 4px 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
        `;

        const editInput = todoLeft.querySelector('.edit-todo-input');
        const saveBtn = todoLeft.querySelector('.save-todo-btn');
        
        editInput.focus();
        const len = editInput.value.length;
        editInput.setSelectionRange(len, len);

        const saveTask = () => {
          let updatedText = editInput.value.trim();
          if (updatedText !== '') {
            if (updatedText.length > 250) {
              updatedText = updatedText.substring(0, 250);
            }
            todo.text = updatedText;
            saveAndRenderTodos();
          }
        };

        saveBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          saveTask();
        });

        editInput.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') {
            saveTask();
          }
        });
      }
      return;
    }

    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      e.stopPropagation();
      const id = deleteBtn.getAttribute('data-id');
      todos = todos.filter(l => l.id !== id);
      saveAndRenderTodos();
      return;
    }

    const checkbox = e.target.closest('.todo-checkbox');
    if (checkbox) {
      const id = checkbox.getAttribute('data-id');
      const todo = todos.find(t => t.id === id);
      if (todo) todo.completed = checkbox.checked;
      saveAndRenderTodos();
      return;
    }
  });

  // Initial renders
  saveAndRenderLinks();
  saveAndRenderTodos();
  renderTimer();
});