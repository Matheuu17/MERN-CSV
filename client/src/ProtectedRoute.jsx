import { Navigate, Outlet} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ProtectedRoute: espera verificacion de auth antes de renderizar rutas privadas
// Si loading es true muestra un mensaje temporal, si no autenticado redirige
function ProtectedRoute(){

    const {loading, isAuthenticated} = useAuth();
    console.log(loading, isAuthenticated)

    // mostrar cargando mientras se verifica el token/cookie
    if(loading) return <h1>Loading...</h1>;

    // si no esta autenticado, redirige al login
    if(!loading && !isAuthenticated) return <Navigate to ='/login' replace/>

    // si esta autenticado, renderiza rutas hijas (Outlet)
    return (
        <Outlet />
    )
}

export default ProtectedRoute