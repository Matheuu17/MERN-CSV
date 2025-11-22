import { createContext, useContext, useState } from "react";
import { createTasksRequest, getTasksRequest, deleteTaskRequest, getTaskRequest, updateTasksRequest} from '../api/tasks'

// Contexto de tareas, que provee las funciones CRUD y lista local de tareas
const TaskContext = createContext();

export const useTasks = () => {
    // Se declara constante para usar el contexto de tareas
    const context = useContext(TaskContext);

    if(!context){
        throw new Error("useTasks must be used within a TaskProvider");
    }

    return context; 
}

export function TaskProvider({ children }){

    const [tasks, setTasks ] = useState([]); 

    // para btener todas las tareas desde la API y guardarlas en estado
    const getTasks = async (task) => {
        try{
            const res = await getTasksRequest(task);   
            setTasks(res.data)

        }catch(error){
            console.log(error)
        }
    };

    // Crear una nueva tarea
    const createTask =  async (task) => {
        const res = await createTasksRequest(task)
        console.log(res);
    };

    // para borrar tarea que si es exitoso, se remueve del estado local
    const deleteTask = async (id) => {
        try{
            const res = await deleteTaskRequest(id);
            if(res.status===204) setTasks(tasks.filter((task) => task._id !== id ));

        }catch(error){
            console.log(error)
        }
        
    };
    
    // Obtener una tarea por id (devuelve los datos)
    const getTask = async(id) => {
        try{
            const res = await getTaskRequest(id)
            return res.data;
        }catch(error){
            console.log(error);
        }
    };

    // Actualizar tarea en la API
    const updateTask = async(id, task) =>
    {
        try{
            await updateTasksRequest(id, task)

        }catch(error)
        {
            console.log(error)
        }
    }

    return (<TaskContext.Provider 
        value={{
        tasks,
        createTask,
        getTasks,
        getTask,
        deleteTask,
        updateTask,
        }}
    >{children}</TaskContext.Provider>
    );
}