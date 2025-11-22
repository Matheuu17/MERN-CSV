import Task from '../models/task.model.js';

// Controllers de tareas (CRUD)

// getTasks: devuelve todas las tareas del usuario logueado
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate('user');
    res.json(tasks);
  } catch (error) {
    console.log(error);
  }
};

// createTask: guarda una nueva tarea en la BD
export const createTask = async (req, res) => {
  try {
    const { searchData, algorithm, executionTime, date } = req.body;
    const newTask = new Task({ searchData, algorithm, executionTime, date, user: req.user.id });
    const saveTask = await newTask.save();
    res.json(saveTask);
  } catch (error) {
    console.log(error);
  }
};

// getTask: devuelve una tarea por id
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('user');
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    console.log(error);
  }
};

// deleteTask: elimina una tarea por id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
};

// updateTask: actualiza campos de una tarea
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    console.log(error);
  }
};
