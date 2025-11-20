import { useEffect, useRef } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/TaskCard";

function TasksPage() {
  const { getTasks, tasks } = useTasks();
  const bgRef = useRef(null);

  useEffect(() => {
    getTasks();
  }, []);

  // Fondo animado detective
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
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.y = height;
      }
      draw() {
        ctx.strokeStyle = `rgba(25, 191, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 100; i++) {
      lines.push(new Line());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      lines.forEach(line => {
        line.update();
        line.draw();
      });
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

  if (tasks.length === 0)
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-[#111c1f] overflow-hidden">
        <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
        <h1 className="text-white text-3xl font-bold z-10">No hay tareas</h1>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#111c1f] py-12 px-4 overflow-hidden">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map(task => (
          <TaskCard task={task} key={task._id} />
        ))}
      </div>
    </div>
  );
}

export default TasksPage;
