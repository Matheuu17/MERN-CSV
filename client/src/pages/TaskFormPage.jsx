import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";

// Formulario de busqueda: subir CSV, elegir algoritmo y ejecutar
// Muestra resultados abajo cuando se obtienen coincidencias
function TaskFormPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const bgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Observamos el valor para cambiar estilos dinámicamente si queremos
  const allowOverlapValue = watch("allowOverlap");

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // handleReset: limpia campos del form, resultados y mensaje
  const handleReset = () => {
    setResultados([]);
    setMensaje(null);
    setValue("searchData", "");
    setValue("algorithm", "KMP");
    setValue("allowOverlap", true); // Reseteamos el toggle a encendido
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const canvas = bgRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const lines = [];
    class Line {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.length = Math.random() * 20 + 20;
        this.speed = Math.random() * 3 + 1;
        this.opacity = 0.1 + Math.random() * 0.2;
      }
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.y = height;
      }
      draw() {
        ctx.strokeStyle = `rgba(25, 191, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }
    for (let i = 0; i < 100; i++) lines.push(new Line());
    function animate() {
      ctx.clearRect(0, 0, width, height);
      lines.forEach((line) => { line.update(); line.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    const file = fileInputRef.current.files[0];
    // Valida que se haya seleccionado un archivo CSV
    if (!file) {
      alert("Debes seleccionar un archivo CSV.");
      return;
    }

    setLoading(true);
    setResultados([]);
    setMensaje(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("searchData", data.searchData);
    formData.append("algorithm", data.algorithm);
    // Enviamos el valor del toggle (true/false)
    formData.append("allowOverlap", data.allowOverlap);

    // onSubmit: crea FormData, la envia al endpoint y procesa la respuesta
    try {
      const res = await axios.post("/search/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const dataRes = res.data;

      if (res.status >= 200 && res.status < 300) {
         if (dataRes.results && dataRes.results.length > 0) {
            setResultados(dataRes.results);
            setMensaje(`¡Éxito! Se encontraron ${dataRes.count} coincidencias.`);
         } else {
            setMensaje("La búsqueda terminó, pero no se encontraron coincidencias.");
         }
      } else {
        setMensaje(dataRes.error || "Error desconocido");
      }

    } catch (error) {
      console.error(error);
      setMensaje("Error al procesar la búsqueda");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#111c1f] overflow-auto py-10">
      <canvas ref={bgRef} className="absolute top-0 left-0 w-full h-full z-0 fixed" />
      
      <div className="relative z-10 bg-[#142024] max-w-xl w-full rounded-2xl shadow-lg p-10 border border-[#339DFF] mb-8">
        <h2 className="text-white text-2xl font-bold mb-2 text-center tracking-wide">
          <span className="text-[#19BFFF]">ENIGMA</span> • Nueva búsqueda
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          Ingresa el dato de ADN, selecciona el algoritmo y sube tu archivo CSV.
        </p>

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* DATO A BUSCAR */}
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">
              Dato a buscar <span className="text-[#19BFFF]">*</span>
            </label>
            <input
              type="text"
              placeholder="p. ej. GATTACA"
              {...register("searchData", { required: true })}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none focus:border-[#339DFF] shadow-sm transition-all"
            />
          </div>

          {/* ALGORITMO */}
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">
              Algoritmo <span className="text-[#19BFFF]">*</span>
            </label>
            <select
              {...register("algorithm", { required: true })}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none focus:border-[#339DFF] shadow-sm transition-all"
            >
              <option value="KMP">KMP</option>
              <option value="Rabin-Karp">Rabin-Karp</option>
            </select>
          </div>

          {/* TOGGLE SWITCH DISEÑADO */}
          <div className="flex items-center justify-between bg-[#1b2730] p-3 rounded-lg border border-gray-700 hover:border-[#339DFF] transition-colors">
             <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-200">Permitir Solapamiento</span>
                <span className="text-xs text-gray-500">Encuentra patrones superpuestos (ej: ANA en BANANA)</span>
             </div>
             
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    defaultChecked={true}
                    {...register("allowOverlap")}
                    className="sr-only peer" 
                />
                {/* El riel del interruptor */}
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#19BFFF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#19BFFF]"></div>
             </label>
          </div>

          {/* ARCHIVO CSV */}
          <div>
            <label className="block text-gray-300 mb-1 font-semibold">
              Archivo CSV <span className="text-[#19BFFF]">*</span>
            </label>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="w-full px-4 py-2 rounded-md bg-[#22313a] text-white border border-[#19BFFF] focus:outline-none cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#19BFFF] file:text-white hover:file:bg-[#15A9E6]"
              required
            />
          </div>

          {/* BOTONES */}
          <div className="flex gap-4 pt-2">
            <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#19BFFF] hover:bg-[#15A9E6] text-white font-bold py-3 px-8 rounded-md transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#19BFFF]/20"
            >
                {loading ? "Analizando..." : "Ejecutar búsqueda"}
            </button>
            
            <button
                type="button"
                onClick={handleReset}
                className="bg-[#2c3e50] hover:bg-[#34495e] text-gray-200 font-bold py-3 px-6 rounded-md transition-colors border border-gray-600"
            >
                Limpiar
            </button>
          </div>

          {mensaje && (
            <div className={`mt-4 p-3 rounded-md text-center text-sm font-bold border ${mensaje.includes("Error") || mensaje.includes("no") ? "bg-red-900/30 border-red-500 text-red-200" : "bg-green-900/30 border-green-500 text-green-200"}`}>
              {mensaje}
            </div>
          )}
        </form>
      </div>

      {/* TABLA DE RESULTADOS */}
      {resultados.length > 0 && (
        <div className="relative z-10 w-full max-w-4xl bg-[#142024] rounded-2xl shadow-lg p-6 border border-[#339DFF] animate-fade-in-up">
          <h3 className="text-xl text-white font-bold mb-4 text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-[#19BFFF] rounded-full animate-pulse"></span>
            Resultados del Análisis
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="text-xs uppercase bg-[#1b2730] text-[#19BFFF]">
                <tr>
                  <th className="px-6 py-3">Sospechoso</th>
                  <th className="px-6 py-3">Algoritmo</th>
                  <th className="px-6 py-3">Tiempo (ms)</th>
                  <th className="px-6 py-3">Posiciones</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-[#1b2730] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4 text-gray-400">{item.algorithm}</td>
                    <td className="px-6 py-4 text-[#19BFFF] font-mono font-bold">{item.executionTime ? item.executionTime.toFixed(4) : 0}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {Array.isArray(item.positions) ? item.positions.join(", ") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskFormPage;
