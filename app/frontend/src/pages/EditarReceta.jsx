import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerRecetaPorId, actualizarReceta } from "../services/api";

const EditarReceta = () => {
  const { id } = useParams(); // Obtiene el ID de la receta desde la URL
  const navigate = useNavigate(); // Para redirigir después de guardar
  const [receta, setReceta] = useState({
    nombre: "",
    descripcion: "",
    ingredientes: "",
    instrucciones: "",
    tiempo_minutos: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerRecetaPorId(id)
      .then((data) => setReceta(data))
      .catch(() => setError("No se pudo cargar la receta."));
  }, [id]);

  const handleChange = (e) => {
    setReceta({ ...receta, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarReceta(id, receta);
      navigate("/mis-recetas"); // Redirige a Mis Recetas después de editar
    } catch {
      setError("Error al actualizar la receta.");
    }
  };

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  return (
    <div className="w-[95%] md:w-[75%] lg:w-[65%] mx-auto mt-24 my-10 p-6 bg-neutral-200 shadow-lg rounded-lg min-h-[80vh] flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Receta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {/* Área de campos que se expande y permite scroll */}
        <div className="test-editar-nombre flex flex-col gap-3 flex-1 overflow-y-auto">
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
        {/* Sección inferior: botón de submit */}
        <div className="mt-4 flex flex-col gap-6">
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarReceta;
