import {BrowserRouter, Routes, Route} from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import TaskFormPage from './pages/TaskFormPage';

import ProtectedRoute from './ProtectedRoute';
import TasksPage from './pages/TaskPage';
import { TaskProvider } from './context/TasksContext';
import Navbar from './components/Navbar';


function App(){
  return(
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
            {/* Navbar visible en todas las paginas */}
            <Navbar/>
          <Routes>
            <Route path='/' element={<HomePage /> }/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>

            {/* Rutas protegidas: requieren autenticacion (ProtectedRoute) */}
            <Route element={<ProtectedRoute/>}> 
              <Route path='/menu' element={<MenuPage/>}/>
  
        
              <Route path='/tasks' element={<TasksPage/>}/>
              <Route path='/add-task' element={<TaskFormPage/>}/>
              <Route path='/tasks/:id' element={<TaskFormPage/>}/>

            </Route>
        
           </Routes>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
    
  ) 
}

export default App