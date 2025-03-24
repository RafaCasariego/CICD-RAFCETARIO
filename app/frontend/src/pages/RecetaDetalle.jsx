import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerRecetaPorId, toggle_like, toggle_favorito, obtenerFavoritos } from "../services/api";
import confetti from "canvas-confetti";

const RecetaDetalle = () => {
  const { id } = useParams(); // Obtiene el ID de la URL
  const navigate = useNavigate();
  const [receta, setReceta] = useState(null);
  const [error, setError] = useState("");
  
  // Estados para controlar el estado de like y favorito en esta receta
  const [like, setLike] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  // Al montar, se obtiene la receta
  useEffect(() => {
    obtenerRecetaPorId(id)
      .then((data) => setReceta(data))
      .catch(() => setError("No se pudo cargar la receta."));
  }, [id]);

  // Verificar si el usuario está autenticado (por ejemplo, si existe un token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUsuarioAutenticado(!!token);
  }, []);

  // Una vez que la receta se ha cargado y si el usuario está autenticado,
  // consultamos a la API para obtener el estado de like/favorito para esta receta.
  useEffect(() => {
    if (usuarioAutenticado && receta) {
      const usuarioData = localStorage.getItem("usuario");
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        obtenerFavoritos(usuario.id)
          .then((data) => {
            // Se asume que la respuesta es un array o un objeto con data.favoritos
            const favoritosArray = Array.isArray(data) ? data : data.favoritos || [];
            // Buscamos en el array el registro para esta receta
            const entry = favoritosArray.find(item => item.receta_id === receta.id);
            if (entry) {
              setLike(entry.like);
              setFavorito(entry.favorito);
            }
          })
          .catch((err) => console.error("Error al obtener estado de like/favoritos:", err));
      }
    }
  }, [usuarioAutenticado, receta]);

  if (error) {
    return <p className="text-red-500 text-center mt-20">{error}</p>;
  }

  if (!receta) {
    return <p className="text-center text-gray-600 mt-20">Cargando receta...</p>;
  }

  // Manejador para el botón de Like con actualización optimista
  const handleLike = async () => {
    if (!usuarioAutenticado) {
      navigate("/registro");
      return;
    }
    const currentLiked = like;
    const newLiked = !currentLiked;
    // Actualización optimista: se invierte el valor local
    setLike(newLiked);
    if (newLiked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    try {
      const result = await toggle_like(receta.id);
      setLike(result.like);
    } catch (err) {
      // Si falla, revertir al valor anterior
      setLike(currentLiked);
      console.error("Error al actualizar like:", err);
    }
  };

  // Manejador para el botón de Favorito con actualización optimista
  const handleFavorito = async () => {
    if (!usuarioAutenticado) {
      navigate("/registro");
      return;
    }
    const currentFav = favorito;
    const newFav = !currentFav;
    setFavorito(newFav);
    if (newFav) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    try {
      const result = await toggle_favorito(receta.id);
      setFavorito(result.favorito);
    } catch (err) {
      setFavorito(currentFav);
      console.error("Error al actualizar favorito:", err);
    }
  };

  return (
    <div className="pt-24 pb-10 px-6">
      <div className="max-w-3xl mx-auto bg-neutral-200 shadow-lg rounded-lg p-10">
        {/* Título y Descripción */}
        <div className="mb-8">
          <h1 className="test-titulo-receta text-4xl font-bold text-gray-800 mb-4">{receta.nombre}</h1>
          <p className="text-black text-lg">{receta.descripcion}</p>
        </div>

        {/* Imagen de la receta */}
        <div className="mb-8">
          <img
            src={
              receta.imagen_url ||
              "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
            }
            alt={receta.nombre}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Ingredientes */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredientes:</h2>
          <p className="text-black whitespace-pre-line text-lg">
            {receta.ingredientes}
          </p>
        </div>

        {/* Instrucciones */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instrucciones:</h2>
          <p className="text-black whitespace-pre-line text-lg">
            {receta.instrucciones}
          </p>
        </div>

        {/* Botones de Like y Favorito */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleLike}
            className="test-like-button flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            {like ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.656l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span>Quitar Like</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.656l-6.828-6.829a4 4 0 010-5.656z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span>Like</span>
              </>
            )}
          </button>

          <button
            onClick={handleFavorito}
            className="test-favorite-button flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M5 3a2 2 0 00-2 2v12l7-3 7 3V5a2 2 0 00-2-2H5z" />
            </svg>
            {favorito ? <span>Eliminar de Favoritos</span> : <span>Favorito</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecetaDetalle;
