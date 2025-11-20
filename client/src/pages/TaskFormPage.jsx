import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

function TaskFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const bgRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // ...canvas code (igual que antes)...
  }, []);

  // Si tienes lógica para cargar task existente, déjala igual

  const onSubmit = handleSubmit(async (data) => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert('Debes seleccionar un archivo CSV.');
      return;
    }
    const formData = new FormData();
    formData.append('csv', file);
    formData.append('searchData', data.searchData);
    formData.append('algorithm', data.algorithm);

    // Usar fetch o axios para enviar al backend
    const response = await fetch('/api/search/upload-csv', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (response.ok) {
      alert('Archivo válido y subido correctamente');
      navigate('/tasks');
    } else {
      alert(result.error);
    }
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#111c1f] overflow-hidden">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0" />
      <div className="relative z-10 bg-[#142024] max-w-xl w-full rounded-2xl shadow-lg p-10 border border-[#339DFF]">
        <h2 className="text-white text-2xl font-bold mb-2 text-center tracking-wide">
          <span className="text-[#19BFFF]">ENIGMA</span> • Nueva búsqueda
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          Ingresa el dato de ADN, selecciona el algoritmo y sube tu archivo CSV para ejecutar la búsqueda forense.
        </p>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">Dato a buscar <span className="text-[#19BFFF]">*</span></label>
            <input
              type="text"
              placeholder="p. ej. GATTACA"
              {...register('searchData', { required: true })}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none focus:border-[#339DFF] shadow-sm"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">Algoritmo <span className="text-[#19BFFF]">*</span></label>
            <select
              {...register('algorithm', { required: true })}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none focus:border-[#339DFF] shadow-sm"
            >
              <option value="">-- Selecciona --</option>
              <option value="KMP">KMP</option>
              <option value="Rabin-Karp">Rabin-Karp</option>
              <option value="Aho-Corasick">Aho-Corasick</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">Archivo CSV <span className="text-[#19BFFF]">*</span></label>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold py-3 px-8 rounded-md transition-colors transform hover:scale-105"
          >
            Ejecutar búsqueda
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskFormPage;
