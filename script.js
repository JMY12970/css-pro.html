// Initialize variables
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearBtn = document.getElementById('clearBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = [];
let currentFilter = 'all';

// Local Storage Key
const STORAGE_KEY = 'todoList';

// Load todos from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
});

// Load todos from localStorage
function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    todos = saved ? JSON.parse(saved) : [];
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Add new todo
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.push(todo);
    saveTodos();
    todoInput.value = '';
    renderTodos();
    todoInput.focus();
}

// Render todos
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one to get started!</p></div>';
        updateStats();
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });

    updateStats();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Clear completed todos
clearBtn.addEventListener('click', () => {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount > 0) {
        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            todos = todos.filter(t => !t.completed);
            saveTodos();
            renderTodos();
        }
    }
});

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos();
    });
});

// Update stats
function updateStats() {
    const activeTodos = todos.filter(t => !t.completed).length;
    const completedTodos = todos.filter(t => t.completed).length;
    const total = todos.length;

    taskCount.textContent = `${activeTodos} of ${total} tasks`;
    
    // Disable clear button if no completed tasks
    clearBtn.disabled = completedTodos === 0;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
