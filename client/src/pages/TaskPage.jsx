import { useEffect, useRef } from "react";
import { useTasks } from "../context/TasksContext";

// Historial de busquedas: agrupa por fecha/patron/algoritmo y muestra resultados
// Nota: se agrupa y luego se ordena para mostrar lo mas reciente primero

function TasksPage() {
  const { getTasks, tasks } = useTasks();
  const bgRef = useRef(null);

  useEffect(() => {
    getTasks();
  }, []);

  // --- Logica de agrupacion ---
  /*reduce: crea un objeto agrupado por fecha-search-algorithm
    cada key representa una ejecucion
    meta guarda una tarea representativa
    results es la lista de tareas pertenecientes a ese grupo */
  const groupedTasks = tasks.reduce((acc, task) => {
    // Agrupamos por fecha exacta, patron y algoritmo
    const dateKey = new Date(task.date).toLocaleString(); 
    const key = `${dateKey}-${task.searchData}-${task.algorithm}`;

    if (!acc[key]) {
      acc[key] = {
        meta: task, // Guardamos la info general (incluyendo allowOverlap)
        results: [] 
      };
    }
    acc[key].results.push(task);
    return acc;
  }, {});

  // Ordena grupos por fecha descendente (lo mas reciente primero)
  const historyList = Object.values(groupedTasks).sort((a,b) => new Date(b.meta.date) - new Date(a.meta.date));

  // --- Efecto Canvas ---
  useEffect(() => {
    const canvas = bgRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const lines = [];
    class Line {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = Math.random() * 20 + 20;
        this.speed = Math.random() * 3 + 1;
        this.opacity = 0.1 + Math.random() * 0.2;
      }
      update() { this.y -= this.speed; if (this.y < 0) this.y = height; }
      draw() {
        ctx.strokeStyle = `rgba(25, 191, 255, ${this.opacity})`;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x, this.y + this.length); ctx.stroke();
      }
    }
    for (let i = 0; i < 100; i++) lines.push(new Line());
    function animate() {
      ctx.clearRect(0, 0, width, height);
      lines.forEach(line => { line.update(); line.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (historyList.length === 0)
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-[#111c1f] overflow-hidden">
        <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
        <h1 className="text-white text-3xl font-bold z-10">No hay historial de búsquedas</h1>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#111c1f] py-12 px-4 overflow-auto">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0 fixed" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center border-b border-[#339DFF] pb-4 inline-block">
            Historial de Operaciones
        </h2>

        <div className="grid grid-cols-1 gap-6">
            {historyList.map((group, index) => (
                <div key={index} className="bg-[#142024] rounded-xl shadow-lg p-6 border border-[#339DFF] hover:shadow-[#19BFFF]/20 transition-shadow">
                    {/* Encabezado de la Busqueda */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-700 pb-4">
                        <div>
                            <h3 className="text-xl text-[#19BFFF] font-bold">
                                Búsqueda: <span className="text-white">{group.meta.searchData}</span>
                            </h3>
                            <div className="text-gray-400 text-sm mt-1 flex flex-wrap gap-2 items-center">
                                <span>Fecha: {new Date(group.meta.date).toLocaleString()}</span>
                                <span className="hidden md:inline">|</span>
                                <span>Algoritmo: <span className="text-white font-semibold">{group.meta.algorithm}</span></span>
                                <span className="hidden md:inline">|</span>
                                {/* Para el solapamiento */}
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${group.meta.allowOverlap ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                                    {group.meta.allowOverlap ? "Con Solapamiento" : "Sin Solapamiento"}
                                </span>
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0 bg-[#1b2730] px-4 py-2 rounded-lg border border-gray-600">
                            <span className="text-gray-300 text-sm">Coincidencias: </span>
                            <span className="text-[#19BFFF] font-bold text-lg">{group.results.length}</span>
                        </div>
                    </div>

                    {/* Lista Desplegable de Resultados con Posiciones */}
                    <div className="bg-[#1b2730] rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        <div className="grid grid-cols-12 text-xs text-gray-500 uppercase font-bold mb-2 px-2">
                            <div className="col-span-4">Sospechoso</div>
                            <div className="col-span-2 text-right">Tiempo</div>
                            <div className="col-span-6 text-right">Posiciones</div>
                        </div>
                        <ul className="space-y-1">
                            {group.results.map((task) => (
                                <li key={task._id} className="grid grid-cols-12 text-gray-300 text-sm items-center hover:bg-[#23313a] p-1 rounded px-2 transition-colors">
                                    <div className="col-span-4 font-medium truncate" title={task.name}>{task.name}</div>
                                    <div className="col-span-2 text-right text-xs text-gray-500 font-mono">
                                        {task.executionTime ? task.executionTime.toFixed(4) : 0}ms
                                    </div>
                                    {/* Columna de Posiciones */}
                                    <div className="col-span-6 text-right text-xs font-mono text-[#19BFFF] truncate" title={task.positions.join(", ")}>
                                        {task.positions.length > 0 ? task.positions.join(", ") : "-"}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
