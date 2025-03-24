import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { obtenerFavoritos } from "../services/api";

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [error, setError] = useState("");

  // Obtener token y usuario (almacenado en localStorage)
  const token = localStorage.getItem("token");
  const usuarioString = localStorage.getItem("usuario");
  const usuario_id = usuarioString ? JSON.parse(usuarioString).id : null;

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        if (usuario_id && token) {
          const data = await obtenerFavoritos(usuario_id, token);
          // Se espera que la API retorne { usuario_id, favoritos: [...] }
          setFavoritos(data.favoritos || []);
        }
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
        setError("No se pudieron cargar tus favoritos.");
      }
    };

    fetchFavoritos();
  }, [usuario_id, token]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6 mt-16">
        Tus Recetas Favoritas
      </h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {favoritos.length === 0 ? (
        <p className="text-center text-gray-600">No tienes recetas favoritas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritos.map((fav) => {
            const receta = fav.receta;
            return (
              <div
                key={fav.id}
                className="p-4 border rounded-lg shadow-md flex flex-col"
              >
                <img
                  src={
                    receta?.imagen_url ||
                    "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
                  }
                  alt={receta?.nombre || "Sin imagen"}
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <h2 className="text-xl font-semibold text-gray-800">
                  {receta?.nombre || "Receta sin nombre"}
                </h2>
                <p className="text-gray-600 flex-1">
                  {receta?.descripcion || "Sin descripción"}
                </p>
                <Link
                  to={`/receta/${receta?.id || ""}`}
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition self-start"
                >
                  Ver Receta
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
