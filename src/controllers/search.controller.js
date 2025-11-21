import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import Task from '../models/task.model.js';

// Configuración para obtener rutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadCsvController = async (req, res) => {
    try {
        // 1. Validaciones iniciales
        if (!req.file) return res.status(400).json({ error: 'No se envió archivo CSV.' });

        // 1. RECIBIR EL PARÁMETRO 'allowOverlap'
        // El frontend enviará "true" o "false" como string dentro de FormData
        const { searchData, algorithm, allowOverlap } = req.body;

        if (!searchData) {
            try { fs.unlinkSync(req.file.path); } catch(e){}
            return res.status(400).json({ error: 'Falta el dato a buscar (searchData).' });
        }
        if (!algorithm) {
            try { fs.unlinkSync(req.file.path); } catch(e){}
            return res.status(400).json({ error: 'Falta seleccionar el algoritmo.' });
        }

        // 2. Preparar la ejecución del C++
        // Usamos path.resolve para convertir "uploads/archivo" en "C:\Users\...\uploads\archivo"
        const filePath = path.resolve(req.file.path);
        const exePath = path.join(__dirname, '../bin/motor_busqueda.exe');

        // Nota: allowOverlap viene como string "true" o "false" desde el formData, 
        // se lo pasamos directo al C++ que ya sabe leerlo.
        const overlapArg = allowOverlap ? allowOverlap.toString() : "true";

        console.log(`[Backend] Ejecutando C++: ${exePath}`);
        console.log(`[Backend] Params: Patrón="${searchData}", Archivo="${filePath}", Algo="${algorithm}"`);

        // 3. Ejecutar el proceso hijo (C++)
        execFile(exePath, [searchData, filePath, algorithm, overlapArg], async (error, stdout, stderr) => {
            
            // Limpieza: Borrar el archivo CSV temporal después de usarlo
            try { fs.unlinkSync(filePath); } catch (err) { console.error("Error borrando temp:", err); }

            if (error) {
                console.error('[Backend] Error crítico al ejecutar C++:', error);
                return res.status(500).json({ error: "Error ejecutando el motor de búsqueda", details: stderr });
            }

            // 4. Procesar la respuesta del C++
            try {
                // stdout es lo que C++ imprimió con `cout`. Debe ser un JSON string.
                // Ejemplo esperado: ["Juan Perez", "Maria Lopez"]
                const sospechososEncontrados = JSON.parse(stdout); 
                
                console.log(`[Backend] Resultados encontrados: ${sospechososEncontrados.length}`);

                // 5. Guardar en Base de Datos (MongoDB)
                // Guardamos un registro por cada sospechoso encontrado
                const savedTasks = [];

                if (sospechososEncontrados.length > 0) {
                    for (const item of sospechososEncontrados) { // 'item' tiene toda la info
                        const newTask = new Task({
                            name: item.name,
                            sequence: item.sequence, // ¡Ahora sí tenemos la secuencia real!
                            searchData: searchData,
                            algorithm: algorithm,
                            allowOverlap: (overlapArg === "true"),
                            positions: item.positions, // ¡Y las posiciones exactas!
                            executionTime: item.executionTime, // ¡Y el tiempo para tu informe!
                            date: new Date(),
                            user: req.user ? req.user.id : undefined
                        });
                        await newTask.save();
                        savedTasks.push(newTask);
                    }
                }

                // 6. Responder al Frontend
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
