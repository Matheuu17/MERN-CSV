import { useForm } from 'react-hook-form';
import { FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, errors: signinErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
        this.speed = Math.random() * 2 + 1;  // velocidad aumentada para efecto
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

  const onSubmit = handleSubmit(data => {
    signin(data);
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/menu"); 
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111c1f] relative overflow-hidden">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="bg-[#142024] rounded-2xl shadow-lg p-8 w-full max-w-md border border-[#339DFF] relative z-10">
        <h2 className="text-3xl font-bold text-white text-center mb-1">
          Terminal de Acceso <br /> Seguro
        </h2>
        <p className="text-gray-400 text-center mb-6 text-base">
          Identificación de Agente Requerida
        </p>

        {
          Array.isArray(signinErrors) && signinErrors.map((error, i) => (
            <div className='bg-red-500 p-2 text-white text-center mb-2 rounded' key={i}>
              {error}
            </div>
          ))
        }
        {
          !Array.isArray(signinErrors) && signinErrors && (
            <div className='bg-red-500 p-2 text-white text-center mb-2 rounded'>
              {signinErrors}
            </div>
          )
        }


        <form onSubmit={onSubmit} className="flex flex-col gap-4">


          {/* Canal de Comunicación Seguro */}
          <div>
            <label className="text-white font-semibold mb-1 block">Canal de Comunicación Seguro</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingrese un email válido',
                  }
                })}
                className="w-full bg-[#1b2730] text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-md focus:outline-none focus:ring-2 focus:ring-[#339DFF] transition"
                placeholder="Introduce tu correo electrónico"
              />
              <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            </div>
            {errors.email && (<p className='text-red-500'>{errors.email.message}</p>)}
          </div>


          {/* Clave de Acceso */}
          <div>
            <label className="text-white font-semibold mb-1 block">Clave de Acceso</label>
            <div className="relative">
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full bg-[#1b2730] text-white placeholder-gray-400 px-4 py-3 pr-12 rounded-md focus:outline-none focus:ring-2 focus:ring-[#339DFF] transition"
                placeholder="Introduce tu contraseña"
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            </div>
            {errors.password && (<p className='text-red-500'>{errors.password.message}</p>)}
          </div>


          <button
            type="submit"
            className="w-full bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold py-3 rounded-md mt-2 transition-colors"
          >
            Iniciar Sesion
          </button>
        </form>
        <p className="block text-center text-[#19BFFF] hover:underline mt-4 text-sm font-semibold">
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}


export default LoginPage;
