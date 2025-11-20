import { useTasks } from "../context/TasksContext";


function TaskCard({ task }) {
  const { deleteTask } = useTasks();

  return (
    <div className="bg-[#142024] rounded-2xl shadow-lg p-8 border border-[#339DFF] flex flex-col justify-between min-h-[200px]">
      <header className="mb-4">
        <p className="text-lg text-white font-bold mb-2">Dato buscado: <span className="text-[#19BFFF]">{task.searchData}</span></p>
      </header>
      <div className="text-gray-300 mb-4">
        <p className="mb-1">Algoritmo usado: <span className="text-[#19BFFF]">{task.algorithm}</span></p>
        <p className="mb-1">Tiempo (ms): <span className="text-[#19BFFF]">{task.executionTime}</span></p>
      </div>
      <footer className="flex items-center justify-between text-sm text-gray-400">
        <span>{new Date(task.date).toLocaleDateString()}</span>
        <div className="flex gap-x-2">
          <button
            onClick={() => deleteTask(task._id)}
            className="text-[#19BFFF] hover:underline"
          >
            Delete
          </button>
        </div>
      </footer>
    </div>
  );
}
export default TaskCard;
