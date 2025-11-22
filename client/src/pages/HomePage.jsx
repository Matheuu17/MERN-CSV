import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

// Pagina de inicio: bienvenida y enlaces a login/register
function HomePage() {
  const bgRef = useRef(null);

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

      // Mueve la linea hacia arriba y reinicia su posicion al salir
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.y = height;
      }
      
      // Dibuja la linea en el canvas con la opacidad dada
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

    // Loop de animacion, que actualiza y dibuja todas las lineas continuamente
    function animate() {
      ctx.clearRect(0, 0, width, height);
      lines.forEach(line => {
        line.update();
        line.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    // Ajusta el canvas cuando cambia el tamano de la ventana
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#111c1f] overflow-hidden">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="relative z-10 bg-[#142024] max-w-xl w-full rounded-2xl shadow-lg p-10 border border-[#339DFF] text-center">
        <h1 className="text-white text-4xl font-extrabold mb-3">
          Bienvenido a <span className="text-[#19BFFF]">ENIGMA</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Plataforma de acceso seguro para agentes autorizados. 
          Accede a tu panel y administra tus tareas con confianza.
        </p>

        <div className="mb-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1055/1055648.png" 
            alt="Seguridad"
            className="mx-auto w-28 h-28 opacity-70"
          />
        </div>

        <Link
          to="/login"
          className="inline-block bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold py-3 px-8 rounded-md transition-colors transform hover:scale-105"
        >
          Iniciar Sesión
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          ¿No tienes usuario? <Link to="/register" className="text-[#19BFFF] hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default HomePage;
