import {createContext, useState, useContext, useEffect } from "react";
import {registerRequest, loginRequest, verifyTokenRequest} from '../api/auth';
import Cookies from "js-cookie";

// Contexto de autenticacion, que maneja el user, estado de login y errores
export const AuthContext = createContext();

export const useAuth =() => {
    // Se declara en constante para acceder al contexto facilmente desde componentes
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Registrar usuario y actualizar estado
    const signup = async (user) => {
        try{
            const res = await registerRequest(user);
            console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);
            setLoading(false);
        }catch(error){
            setErrors(error.response.data);
        }
    };

    // Iniciar sesion y guardar usuario
    const signin = async (user) => {

        try{
        const res = await loginRequest(user);
        console.log(res);
        setIsAuthenticated(true);
        setUser(res.data);
        }catch(error)
        {
            if(Array.isArray(error.response.data))
            {
                return setErrors(error.response.data);
            }

            setErrors([error.response.data.message])
            
        }
    }

    // Cerrar sesion, que elimina el token localmente y resetea el estado
    const logout = async (user) => {
        try{
            Cookies.remove("token");
            setIsAuthenticated(false);
            setUser(null);

        }catch(error){
            console.log(error)
        }
    }

    // Limpiar errores automaticamente despues de 3s
    useEffect(()=>{
        if(errors.length>0){
            const timer = setTimeout(()=>{
                setErrors([])
            },3000)

            return () => clearTimeout(timer);
        }
    },[errors])

    // Al montar, verificar si hay cookie/token y validarlo con la API
    useEffect(()=>{
        async function checkLogin(){
            const cookies = Cookies.get();

            if(!cookies.token){
                setIsAuthenticated(false);
                setLoading(false);
                return setUser(null);
            }
            try{
                const res = await verifyTokenRequest();
                if(!res.data) {
                    setIsAuthenticated(false)
                    setLoading(false);  
                    return ; 
                }
                setIsAuthenticated(true) 
                setUser(res.data)
                setLoading(false);
            }catch(error)
            {   
                console.log(error);
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
            }
        }
        checkLogin();
    },[])
    


    return (
        <AuthContext.Provider value = {{
            signup,
            signin,
            logout,
            loading,
            user,
            isAuthenticated,
            errors,
        }}>
            {children}
        </AuthContext.Provider>
    )
}