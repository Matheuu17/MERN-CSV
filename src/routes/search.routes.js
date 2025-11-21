import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadCsvController } from '../controllers/search.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

// Configuración para obtener rutas en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configuración robusta de Multer
// 1. Guarda en la carpeta uploads
// 2. Mantiene la extensión .csv (importante para que sea legible)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // __dirname está en /src/routes, subimos 2 niveles (../../) para llegar a uploads en la raíz
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        // Genera nombre único: file-fecha-random.csv
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// RUTA POST PROTEGIDA
// Orden de ejecución: 
// 1. authRequired (¿Está logueado? -> Si sí, llena req.user)
// 2. upload.single (Sube el archivo)
// 3. uploadCsvController (Ejecuta C++ y guarda en BD usando req.user)
router.post('/upload-csv', authRequired, upload.single('file'), uploadCsvController);

export default router;
