import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import Task from '../models/task.model.js';

// Configuracion para obtener rutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploadCsvController: recibe CSV, ejecuta motor C++ y guarda resultados en BD
export const uploadCsvController = async (req, res) => {
    try {
        // 1) Validaciones basicas
        if (!req.file) return res.status(400).json({ error: 'No se envió archivo CSV.' });

        // Recibir campos del form
        const { searchData, algorithm, allowOverlap } = req.body;

        if (!searchData) {
            try { fs.unlinkSync(req.file.path); } catch(e){}
            return res.status(400).json({ error: 'Falta el dato a buscar (searchData).' });
        }
        if (!algorithm) {
            try { fs.unlinkSync(req.file.path); } catch(e){}
            return res.status(400).json({ error: 'Falta seleccionar el algoritmo.' });
        }

        // 2) Preparar llamada al ejecutable C++ (ruta absoluta)
        const filePath = path.resolve(req.file.path);
        const exePath = path.join(__dirname, '../bin/motor_busqueda.exe');

        // allowOverlap viene como string desde el frontend, se pasa como esta
        const overlapArg = allowOverlap ? allowOverlap.toString() : "true";

        console.log(`[Backend] Ejecutando C++: ${exePath}`);
        console.log(`[Backend] Params: Patrón="${searchData}", Archivo="${filePath}", Algo="${algorithm}"`);

        // 3) Ejecutar proceso hijo (C++) y procesar su salida
        execFile(exePath, [searchData, filePath, algorithm, overlapArg], async (error, stdout, stderr) => {

            // Limpieza: Borrar el archivo CSV temporal después de usarlo
            try { fs.unlinkSync(filePath); } catch (err) { console.error("Error borrando temp:", err); }

            if (error) {
                console.error('[Backend] Error crítico al ejecutar C++:', error);
                return res.status(500).json({ error: "Error ejecutando el motor de búsqueda", details: stderr });
            }

            // 4) Parsear JSON retornado por el C++
            try {
                const sospechososEncontrados = JSON.parse(stdout);
                console.log(`[Backend] Resultados encontrados: ${sospechososEncontrados.length}`);

                // 5) Guardar resultados en MongoDB (un documento por coincidencia)
                const savedTasks = [];
                if (sospechososEncontrados.length > 0) {
                    for (const item of sospechososEncontrados) { // 'item' tiene toda la info
                        const newTask = new Task({
                            name: item.name,
                            sequence: item.sequence,
                            searchData: searchData,
                            algorithm: algorithm,
                            allowOverlap: (overlapArg === "true"),
                            positions: item.positions,
                            executionTime: item.executionTime,
                            date: new Date(),
                            user: req.user ? req.user.id : undefined
                        });
                        await newTask.save();
                        savedTasks.push(newTask);
                    }
                }

                // 6) Responder al frontend con los datos guardados
                return res.json({ 
                    message: 'Búsqueda completada', 
                    count: sospechososEncontrados.length, 
                    results: savedTasks, // Devolvemos lo que guardamos en BD
                    rawNames: sospechososEncontrados 
                });

            } catch (parseError) {
                console.error('[Backend] El C++ no devolvió un JSON válido. Output recibido:', stdout);
                return res.status(500).json({ 
                    error: "Error al procesar resultados del motor C++", 
                    rawOutput: stdout 
                });
            }
        });

    } catch (error) {
        console.error(error);
        // Intentar borrar archivo si algo falló antes
        try { if (req.file) fs.unlinkSync(req.file.path); } catch (e) {}
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
