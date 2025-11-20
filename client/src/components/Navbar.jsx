import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-[#142024] mt-4 flex justify-between items-center py-4 px-10 rounded-2xl shadow-md border border-[#339DFF]">
      <Link to='/'>
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
            <li>
              <Link
                to='/add-task'
                className="bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold px-4 py-2 rounded-md transition-colors transform hover:scale-105 shadow"
              >
                Nueva Búsqueda
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="bg-transparent border border-[#19BFFF] hover:bg-[#22313a] text-[#19BFFF] font-bold px-4 py-2 rounded-md transition-colors"
              >
                Salir
              </button>
            </li>
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
