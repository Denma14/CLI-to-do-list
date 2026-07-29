import fs from "fs/promises";
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

async function readTasks(): Promise<TaskMap> {
  try {
    await fs.access(filePath);

    const data = await fs.readFile(filePath, "utf8");
    const trimmed = data.trim();

    return trimmed ? JSON.parse(trimmed) : {};
  } catch {
    return {};
  }
}

async function writeTasks(tasks: TaskMap): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(tasks, null, 2), "utf8");
}

async function addTask(title: string) {
  const tasks = await readTasks();

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
  await writeTasks(tasks);

  console.log(`Task added successfully (ID: ${newID})`);
}

async function listTasks(id: string) {
  const tasks = await readTasks();
  if (id && tasks[id]) {
    const task = tasks[id];
    const status = task.completed ? "[✓]" : "[ ]";
    // Formats timestamp nicely or takes the ISO date portion
    const date = task.createdAt.split("T")[0];
    console.log(`${status} #${task.id} - ${task.name} (Created: ${date})`);
    return;
  }

  console.log("Tasks:");
  Object.values(tasks).forEach((task) => {
    const status = task.completed ? "[✓]" : "[ ]";
    const date = task.createdAt.split("T")[0];
    console.log(`${status} #${task.id} - ${task.name} (Created: ${date})`);
  });
}

const program = new Command();

program.name("task").description("CLI Task Tracker").version("1.0.0");

program
  .command("add")
  .description("Add a new task")
  .argument("<title>", "Title of the task")
  .action(async (title) => {
    console.log(`Adding task: ${title}`);
    await addTask(title);
  });

program
  .command("list")
  .description("Displays all tasks")
  .argument("[id]", "ID of the task to list")
  .action(async (id) => {
    await listTasks(id);
  });

program
  .command("delete")
  .description("Deletes a task")
  .argument("<id>", "ID of the task to delete")
  .action(async (id) => {
    const tasks = await readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    delete tasks[id];
    await writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program
  .command("done")
  .description("Completes a task")
  .argument("<id>", "ID of the task to complete")
  .action(async (id) => {
    const tasks = await readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    tasks[id].completed = true;
    await writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program
  .command("uncomplete")
  .description("Uncompletes a task")
  .argument("<id>", "ID of the task to uncomplete")
  .action(async (id) => {
    const tasks = await readTasks();
    if (!tasks[id]) {
      console.error(`Task with ID ${id} not found`);
      return;
    }
    tasks[id].completed = false;
    await writeTasks(tasks);
    console.log(`Completing task: ${id}`);
  });

program.parse(process.argv);
