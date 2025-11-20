import axios from './axios';

export const getTasksRequest = () => axios.get('/tasks')

export const createTasksRequest = (task) => axios.post('/tasks', task);

export const updateTasksRequest = (id, task) => axios.put(`/tasks/${id}`, task); 

export const deleteTaskRequest = (id) => axios.delete(`/tasks/${id}`);

export const getTaskRequest = (id) => axios.get(`/tasks/${id}`);

//PETICIONES CRUD PARA LAS TAREAS