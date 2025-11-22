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

// Multer: guarda uploads en la carpeta uploads/ y mantiene extension
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Ruta POST protegida que primero verifica auth, luego sube archivo y luego procesa
router.post('/upload-csv', authRequired, upload.single('file'), uploadCsvController);

export default router;
