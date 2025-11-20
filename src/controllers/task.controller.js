import Task from '../models/task.model.js';

// Obtener tareas del usuario
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).populate('user');
    res.json(tasks);
  } catch (error) {
    console.log(error);
  }
};

// Crear nueva tarea (búsqueda)
export const createTask = async (req, res) => {
  try {
    const { searchData, algorithm, executionTime, date } = req.body;
    const newTask = new Task({
      searchData,
      algorithm,
      executionTime,
      date,
      user: req.user.id
    });
    const saveTask = await newTask.save();
    res.json(saveTask);
  } catch (error) {
    console.log(error);
  }
};

// Obtener una tarea específica
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('user');
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    console.log(error);
  }
};

// Eliminar tarea
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
  }
};

// Actualizar tarea
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    console.log(error);
  }
};
