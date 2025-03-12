import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearReceta } from "../services/api";

const CrearReceta = () => {
  const navigate = useNavigate();
  const [receta, setReceta] = useState({
    nombre: "",
    descripcion: "",
    ingredientes: "",
    instrucciones: "",
    tiempo_minutos: "",
  });
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setReceta({
      ...receta,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearReceta({
        ...receta,
        tiempo_minutos: Number(receta.tiempo_minutos),
        imagen,
      });
      navigate("/mis-recetas");
    } catch {
      setError("Error al crear la receta.");
    }
  };

  return (
    <div className="w-[95%] md:w-[75%] lg:w-[65%] mx-auto mt-24 my-10 p-6 bg-neutral-200 shadow-lg rounded-lg min-h-[80vh] flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Crear Nueva Receta
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {/* Contenedor de campos que se expande y permite scroll */}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
          <input
            type="text"
            name="nombre"
            value={receta.nombre}
            onChange={handleChange}
            placeholder="Nombre de la receta"
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
          <textarea
            name="descripcion"
            value={receta.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="w-full flex-1 p-3 border border-gray-300 rounded-lg"
            required
          />
          <textarea
            name="ingredientes"
            value={receta.ingredientes}
            onChange={handleChange}
            placeholder="Ingredientes"
            className="w-full flex-1 p-3 border border-gray-300 rounded-lg"
            required
          />
          <textarea
            name="instrucciones"
            value={receta.instrucciones}
            onChange={handleChange}
            placeholder="Instrucciones"
            className="w-full flex-1 p-3 border border-gray-300 rounded-lg"
            required
          />
          <input
            type="number"
            name="tiempo_minutos"
            value={receta.tiempo_minutos}
            onChange={handleChange}
            placeholder="Tiempo en minutos"
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {/* Sección sticky al final: file input y botón de submit */}
        <div className="mt-4 flex flex-col gap-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
          >
            Crear Receta
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearReceta;
