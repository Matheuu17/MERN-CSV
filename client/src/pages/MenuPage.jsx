import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaSignOutAlt, FaHistory } from 'react-icons/fa'; // Agregamos FaHistory
import { useAuth } from '../context/AuthContext';

function MenuPage() {
  const bgRef = useRef(null);
  const { user, logout } = useAuth();
  console.log(user);

  // Efecto de fondo animado (líneas tipo hacker)
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
        this.speed = Math.random() * 2 + 1;
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

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111c1f] relative flex flex-col">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {/* Navbar superior */}
      <div className="relative z-10 w-full flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <img src="https://cdn-icons-png.flaticon.com/512/1055/1055648.png" alt="enigma" className="w-7 h-7" />
          <span className="text-white font-bold text-lg">Proyecto Enigma</span>
        </div>
        <div>
          <span className="bg-[#232b30] px-4 py-2 rounded-lg text-white font-semibold text-sm">
            Agent: {user ? (user.username || user.email || user.id) : "Desconocido"}
          </span>
        </div>
      </div>

      {/* Contenido central con los botones */}
      <div className="flex flex-1 items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-5">
          <span className="text-gray-500 text-center mb-2">System Access</span>
          
          {/* Botón 1: Nueva Búsqueda */}
          <Link
            to="/add-task"
            className="flex items-center justify-center gap-3 bg-[#19BFFF] hover:bg-[#15A9E6] text-black font-semibold py-3 px-8 rounded-md text-lg w-80 transition-colors"
          >
            <FaSearch /> Nueva Búsqueda
          </Link>

          {/* Botón 2: Ver Historial (NUEVO) */}
          <Link
            to="/tasks"
            className="flex items-center justify-center gap-3 bg-[#1b2730] border border-[#19BFFF] hover:bg-[#22313a] text-[#19BFFF] font-semibold py-3 px-8 rounded-md text-lg w-80 transition-colors"
          >
            <FaHistory /> Ver Historial
          </Link>

          {/* Botón 3: Cerrar Sesión */}
          <button
            className="flex items-center justify-center gap-2 bg-[#232b30] hover:bg-[#344148] text-white font-semibold py-3 px-8 rounded-md text-lg w-80 transition-colors"
            onClick={() => {
              logout();
              window.location = "/login";
            }}
          >
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-gray-700 text-center text-xs pb-4">
        CONFIDENTIAL - v1.0.2
      </footer>
    </div>
  );
}

export default MenuPage;
