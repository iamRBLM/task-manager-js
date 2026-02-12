const tasks = [];
const ul = document.querySelector("#taskList");

// save task event
document.querySelector("#addBtn").addEventListener("click", (e) => {
  const taskInput = document.querySelector("#taskInput").value;
  const taskDate = document.querySelector("#dateInput").value;

  saveTasks(taskInput, taskDate);

  e.preventDefault();
});

// save task logic
const saveTasks = (taskInput, taskDate) => {
  if (taskInput && taskDate) {
    tasks.push({
      id: Date.now(),
      text: taskInput,
      dueDate: taskDate,
      completed: false,
    });
  }

  if (tasks.length === 0) {
    localStorage.removeItem("tasks");
  } else {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  rendertasks();
};

// get task
const getTasks = () => {
  const tasksSaved = localStorage.getItem("tasks");

  if (tasksSaved) {
    tasks.length = 0;
    tasks.push(...JSON.parse(tasksSaved));
  }
};
getTasks();

// render task
const rendertasks = (tasksToRender = tasks) => {
  ul.innerHTML = "";
  tasksToRender.forEach((task) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <span>${task.text} <br> <span>- Due time: ${task.dueDate}</span></span>
      <div class="task-actions">
        <button class="complete-btn" data-id="${task.id}">Mark as Complete</button>
        <button class="remove-btn" data-id="${task.id}">Remove Task</button>
      </div>
    `;

    ul.appendChild(li);
  });
};
rendertasks();

document.querySelector("ul").addEventListener("click", (e) => {
  const clickedId = Number(e.target.dataset.id);

  // mark task as complete
  if (e.target.classList.contains("complete-btn")) {
    const task = tasks.find((task) => task.id === clickedId);
    task.completed = !task.completed;
  }

  // remove task
  if (e.target.classList.contains("remove-btn")) {
    const index = tasks.findIndex((task) => task.id === clickedId);
    tasks.splice(index, 1);
  }

  saveTasks();
});

document.querySelector(".controls").addEventListener("click", (e) => {
  // show all tasks
  if (e.target.id === "showAll") {
    rendertasks(tasks);
  }

  // show completed tasks
  if (e.target.id === "showCompleted") {
    const showCompleted = tasks.filter((task) => task.completed === true);

    rendertasks(showCompleted);
  }

  // show active tasks
  if (e.target.id === "showActive") {
    const showActive = tasks.filter((task) => task.completed === false);

    rendertasks(showActive);
  }

  // sort tasks by date
  if (e.target.id === "sortDate") {
    const sortDate = [...tasks].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);

      return dateA - dateB;
    });
    rendertasks(sortDate);
  }
});

// fetch initial tasks from api
async function fetchInitialTasks() {
  if (localStorage.getItem("tasks")) return;

  const limit = 5;
  const apiUrl = `https://jsonplaceholder.typicode.com/todos?_limit=${limit}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    data.forEach((item) => {
      tasks.push({
        id: Date.now() + Math.random() * 1000,
        text: item.title,
        dueDate: new Date().toJSON().slice(0, 10),
        completed: item.completed,
      });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    rendertasks();
  } catch (err) {
    console.warn("Failed to fetch initial tasks:", err);
  }
}
fetchInitialTasks();
