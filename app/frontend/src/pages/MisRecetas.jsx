import { useState, useEffect } from "react";
import { obtenerMisRecetas, eliminarReceta } from "../services/api";
import { Link } from "react-router-dom";

const MisRecetas = () => {
  const [recetas, setRecetas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [recetaAEliminar, setRecetaAEliminar] = useState(null); // Estado para la receta a eliminar

  // Obtener usuario_id desde localStorage
  const usuario_id = localStorage.getItem("usuario_id");

  useEffect(() => {
    if (usuario_id) {
      obtenerMisRecetas(usuario_id)
        .then((data) => setRecetas(data))
        .catch(() => setMensaje("No se pudieron cargar las recetas."));
    }
  }, [usuario_id]);

  // Función para mostrar notificaciones en el DOM
  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  // Función para confirmar la eliminación de una receta
  const confirmarEliminar = (receta) => {
    setRecetaAEliminar(receta);
  };

  // Función para eliminar receta
  const handleEliminar = async () => {
    if (!recetaAEliminar) return;

    try {
      await eliminarReceta(recetaAEliminar.id);
      setRecetas(recetas.filter((receta) => receta.id !== recetaAEliminar.id));
      mostrarMensaje("Receta eliminada correctamente.");
      setRecetaAEliminar(null);
    } catch (error) {
      mostrarMensaje("Error al eliminar la receta.");
    }
  };

  return (
    <div className="p-6 mt-16 relative">
      {/* Notificación en el DOM (tipo toast) */}
      {mensaje && (
        <div className="fixed bottom-[100px] right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {mensaje}
        </div>
      )}

      {/* Tarjeta principal */}
      <div className="max-w-4xl mx-auto bg-transparent p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Mis Recetas</h1>
          <Link
            to="/receta/crear-receta"
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
          >
            + Nueva Receta
          </Link>
        </div>

        {/* Listado de recetas */}
        <div className="flex flex-col gap-6">
          {recetas.length > 0 ? (
            recetas.map((receta) => (
              <div
                key={receta.id}
                className="test-receta-item bg-neutral-200 shadow-md rounded-lg p-4 border border-gray-500 flex items-center"
              >
                {/* Imagen */}
                <img
                  src={
                    receta.imagen_url ||
                    "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
                  }
                  alt={receta.nombre}
                  className="w-32 h-32 rounded object-cover"
                />
                {/* Título */}
                <div className="flex-1 ml-4">
                  <h3 className="text-xl font-semibold text-gray-700">
                    {receta.nombre}
                  </h3>
                </div>
                {/* Botones */}
                <div className="flex gap-2">
                  <Link
                    to={`/receta/${receta.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/receta/editar/${receta.id}`}
                    className="test-editar-receta bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => confirmarEliminar(receta)}
                    className="test-eliminar-receta bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No tienes recetas creadas.
            </p>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar receta */}
      {recetaAEliminar && (
        <div
          id="modalFondo"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target.id === "modalFondo") setRecetaAEliminar(null);
          }}
        >
          <div className="bg-white p-8 rounded-lg max-w-md w-auto relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-black text-s hover:text-red-500"
              onClick={() => setRecetaAEliminar(null)}
            >
              &#10005;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Eliminar Receta
            </h2>
            <p className="mb-4 text-gray-700 text-center">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold">{recetaAEliminar.nombre}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                onClick={handleEliminar}
              >
                Confirmar Eliminación
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => setRecetaAEliminar(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisRecetas;
