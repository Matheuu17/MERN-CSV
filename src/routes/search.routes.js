import { Router } from 'express';
import { uploadCsvController } from '../controllers/search.controller.js';
import multer from 'multer';

// Define almacenamiento temporal
const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/upload-csv', upload.single('csv'), uploadCsvController);

export default router;
