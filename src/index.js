import app from './app.js';
import { connectDB } from './db.js';
import fs from 'fs';
import path from 'path';

// Asegurar que exista la carpeta uploads/ para Multer
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
	console.log('Created uploads directory:', uploadsDir);
}

// Inicio del servidor: conectar DB y arrancar app
connectDB();
app.listen(4000);
console.log('Server is running on http://localhost:4000');
