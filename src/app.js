import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();

// App server: configura middlewares y monta rutas
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev')); // logs de peticiones
app.use(express.json()); // parsea JSON en el body
app.use(cookieParser()); // parsea cookies

// Rutas de la API
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use('/api/search', searchRoutes);

export default app;