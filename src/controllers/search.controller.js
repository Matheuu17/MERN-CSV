import fs from 'fs';
import csv from 'csv-parser';

export const uploadCsvController = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se envió archivo.' });

  const filePath = req.file.path;
  let isValid = true;
  let errorMessage = '';
  let rowCount = 0;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      if (
        headers.length !== 2 ||
        headers[0].toLowerCase() !== 'nombre' ||
        headers[1].toLowerCase() !== 'secuencia'
      ) {
        isValid = false;
        errorMessage = 'El archivo debe tener exactamente dos columnas: Nombre, Secuencia.';
      }
    })
    .on('data', (row) => {
      rowCount++;
      if (!row.Nombre || !row.Secuencia) {
        isValid = false;
        errorMessage = `Fila ${rowCount}: Faltan datos.`;
      }
    })
    .on('end', () => {
      fs.unlinkSync(filePath); // elimina el archivo temporal

      if (!isValid) {
        return res.status(400).json({ error: errorMessage });
      }
      if (rowCount === 0) {
        return res.status(400).json({ error: 'El archivo CSV está vacío.' });
      }
      res.json({ message: 'Archivo CSV válido.' });
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(400).json({ error: 'No se pudo procesar el archivo CSV.' });
    });
};
