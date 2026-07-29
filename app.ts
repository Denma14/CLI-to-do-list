import fs from "fs";
import path from "path";
import { Command } from "commander";

interface Task {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

type TaskMap = Record<string, Task>;

const filePath = path.join(__dirname, "task.json");

function readTasks(): TaskMap {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const data = fs.readFileSync(filePath, "utf8").trim();
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function writeTasks(tasks: TaskMap): void {
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

function addTask(title: string) {
  const tasks = readTasks();

  const ids = Object.keys(tasks).map(Number);
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const newID = maxId + 1;

  const newTask: Task = {
    id: newID,
    name: title,
    description: "",
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks[newID] = newTask;
  writeTasks(tasks);

  console.log(`Task added successfully (ID: ${newID})`);
}

function listTasks(id: string) {
  const tasks = readTasks();
  if (id && tasks[id]) {
    console.log(
      `ID: ${tasks[id].id}, Title: ${tasks[id].name}, Completed: ${tasks[id].completed}`,
    );
    return;
  }

  console.log("Tasks:");
  Object.values(tasks).forEach((task) => {
    console.log(
      `ID: ${task.id}, Title: ${task.name}, Completed: ${task.completed}`,
    );
  });
}

const program = new Command();

program.name("task").description("CLI Task Tracker").version("1.0.0");

program
  .command("add")
  .description("Add a new task")
  .argument("<title>", "Title of the task")
  .action((title) => {
    console.log(`Adding task: ${title}`);
    addTask(title);
  });

program
  .command("list")
  .description("Displays all tasks")
  .argument("[id]", "ID of the task to list")
  .action((id) => {
    listTasks(id);
  });

program
  .command("delete")
  .description("Deletes a task")
  .argument("<id>", "ID of the task to delete")
  .action((id) => {
    const tasks = readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    delete tasks[id];
    writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program
  .command("complete")
  .description("Completes a task")
  .argument("<id>", "ID of the task to complete")
  .action((id) => {
    const tasks = readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    tasks[id].completed = true;
    writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program
  .command("uncomplete")
  .description("Uncompletes a task")
  .argument("<id>", "ID of the task to uncomplete")
  .action((id) => {
    const tasks = readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    tasks[id].completed = false;
    writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program.parse(process.argv);

const options = program.opts();
