import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Barra de navegacion: muestra enlaces segun autenticacion y ruta (donde esta ubicado)
function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-[#142024] mt-4 flex justify-between items-center py-4 px-10 rounded-2xl shadow-md border border-[#339DFF] relative z-50">
      <Link to={isAuthenticated ? '/menu' : '/'}>
        <h1 className="text-3xl font-extrabold tracking-wide text-white">
          <span className="text-[#19BFFF]">ENIGMA</span> <span className="text-white">Manager</span>
        </h1>
      </Link>
      <ul className="flex gap-x-4 items-center">
        {isAuthenticated ? (
          <>
            <li className="hidden sm:block text-gray-200 font-semibold">
              Bienvenido, <span className="text-[#19BFFF]">{user.username}</span>
            </li>

            {/* Opciones segun la ruta: volver desde 'add-task' o mostrar acciones normales */}
            {location.pathname === '/add-task' ? (
                // CASO 1: Se esta en Nueva Busqueda -> El boton Volver te lleva al Menu
                <li>
                    <Link
                        to='/menu' 
                        className="bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-800 font-bold px-4 py-2 rounded-md transition-colors"
                    >
                        Volver
                    </Link>
                </li>
            ) : (
                // CASO 2: Se etsa en el Menu u otro lado -> Mostrar opciones normales
                <>
                    <li>
                    {location.pathname !== '/menu' && (
                        <Link
                            to='/add-task'
                            className="bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold px-4 py-2 rounded-md transition-colors transform hover:scale-105 shadow"
                        >
                            Nueva Busqueda
                        </Link>
                    )}
                    </li>
                    <li>
                    <button
                        onClick={() => {
                            logout();
                            window.location.href = "/login";
                        }}
                        className="bg-transparent border border-[#19BFFF] hover:bg-[#22313a] text-[#19BFFF] font-bold px-4 py-2 rounded-md transition-colors"
                    >
                        Salir
                    </button>
                    </li>
                </>
            )}
          </>
        ) : (
          <>
            <li>
              <Link
                to='/login'
                className="bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold px-4 py-2 rounded-md transition-colors shadow"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to='/register'
                className="bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold px-4 py-2 rounded-md transition-colors shadow"
              >
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
