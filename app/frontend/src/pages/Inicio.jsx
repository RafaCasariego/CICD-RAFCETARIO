import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  obtenerRecetas, 
  toggle_like, 
  toggle_favorito, 
  obtenerFavoritos,
  obtenerLikes  // Asegúrate de tener esta función en tu API
} from "../services/api";
import confetti from "canvas-confetti"; // Importamos la librería de confeti

// Función para normalizar texto (elimina tildes y caracteres especiales)
const normalizarTexto = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Inicio = () => {
  const [recetas, setRecetas] = useState([]);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalReceta, setModalReceta] = useState(null);
  const recetasPorPagina = 12; 
  const gridRef = useRef(null);
  const navigate = useNavigate();
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  
  // Estado para almacenar, por receta, el valor de like y favorito.
  // La estructura es: { [recetaId]: { liked: boolean, favorited: boolean } }
  const [recetaStatus, setRecetaStatus] = useState({});
  // Estado para almacenar el número de likes por receta
  // La estructura es: { [recetaId]: number }
  const [likesCount, setLikesCount] = useState({});

  // Verificar autenticación
  useEffect(() => {
    const verificarAutenticacion = () => {
      const token = localStorage.getItem("token");
      setUsuarioAutenticado(!!token);
    };
    verificarAutenticacion();
    window.addEventListener("storage", verificarAutenticacion);
    return () => window.removeEventListener("storage", verificarAutenticacion);
  }, []);

  // Obtener todas las recetas 
  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const data = await obtenerRecetas();
        if (data && data.length > 0) {
          setRecetas(data);
          setError(null);
        } else {
          setRecetas([]);
          setError("No hay recetas disponibles en este momento.");
        }
      } catch (err) {
        setRecetas([]);
        setError("Error cargando recetas.");
      }
    };
    fetchRecetas();
  }, []);

  // Si el usuario está autenticado, obtenemos el estado de like y favoritos para cada receta
  useEffect(() => {
    const fetchFavoritoLikeStatus = async () => {
      if (usuarioAutenticado) {
        const usuarioData = localStorage.getItem("usuario");
        if (usuarioData) {
          const usuario = JSON.parse(usuarioData);
          try {
            const data = await obtenerFavoritos(usuario.id);
            // Si data no es un array, intentamos extraer la propiedad "favoritos"
            const favoritosArray = Array.isArray(data) ? data : data.favoritos || [];
            setRecetaStatus((prev) => {
              const newStatus = { ...prev };
              favoritosArray.forEach((item) => {
                newStatus[item.receta_id] = {
                  liked: item.like,
                  favorited: item.favorito,
                };
              });
              return newStatus;
            });
          } catch (error) {
            console.error("Error al obtener estado de like/favoritos:", error);
          }
        }
      }
    };
    fetchFavoritoLikeStatus();
  }, [usuarioAutenticado, recetas]);

  // Obtener el número de likes para cada receta (consulta a la API)
  useEffect(() => {
    const fetchLikesCount = async () => {
      const counts = {};
      await Promise.all(
        recetas.map(async (receta) => {
          try {
            const data = await obtenerLikes(receta.id);
            // Suponemos que la API devuelve un objeto { count: number }
            counts[receta.id] = data.count || 0;
          } catch (error) {
            console.error("Error obteniendo likes para receta", receta.id, error);
            counts[receta.id] = 0;
          }
        })
      );
      setLikesCount(counts);
    };
    if (recetas.length > 0) {
      fetchLikesCount();
    }
  }, [recetas]);

  // Reiniciamos la página a 1 cuando cambia el filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtro]);

  // Filtrar las recetas según el filtro (buscando en nombre o ingredientes)
  const recetasFiltradas = recetas.filter((receta) =>
    normalizarTexto(receta.nombre).includes(normalizarTexto(filtro)) ||
    normalizarTexto(receta.ingredientes).includes(normalizarTexto(filtro))
  );

  // Calcular total de páginas y obtener el slice de recetas a mostrar
  const totalPaginas = Math.ceil(recetasFiltradas.length / recetasPorPagina);
  const indiceInicio = (paginaActual - 1) * recetasPorPagina;
  const recetasPaginadas = recetasFiltradas.slice(
    indiceInicio,
    indiceInicio + recetasPorPagina
  );

  const handleBuscar = () => {
    setPaginaActual(1);
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cerrar el modal al hacer clic fuera
  const handleCerrarModal = (e) => {
    if (e.target.id === "modalFondo") {
      setModalReceta(null);
    }
  };

  // Función para generar los elementos de paginación con números y elipses
  const getPaginationItems = () => {
    const pages = [];
    if (totalPaginas <= 1) return pages;
    if (totalPaginas <= 5) {
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(i);
      }
      return pages;
    }
    if (paginaActual === 1) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPaginas);
    } else if (paginaActual === totalPaginas) {
      pages.push(1, "ellipsis", totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
    } else {
      const blockSize = 4;
      let block = [];
      if (paginaActual <= totalPaginas - blockSize) {
        for (let i = paginaActual; i < paginaActual + blockSize; i++) {
          block.push(i);
        }
      } else {
        for (let i = totalPaginas - blockSize; i < totalPaginas; i++) {
          block.push(i);
        }
      }
      if (block[0] === 2) {
        pages.push(1, ...block);
      } else {
        pages.push(1, "ellipsis", ...block);
      }
      if (block[block.length - 1] < totalPaginas - 1) {
        pages.push("ellipsis", totalPaginas);
      } else {
        pages.push(totalPaginas);
      }
    }
    return pages;
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{ backgroundImage: "url('/images/2148678341.jpg')" }}
      >
        <h1 className="text-5xl font-bold text-center">
          ¡Bienvenido al <span className="text-yellow-500">Rafcetario!</span>
        </h1>
        <p className="mt-4 text-lg">Un montón de recetas por explorar :)</p>
        {/* Barra de búsqueda en el hero */}
        <div className="mt-6 flex items-center bg-gray-300 rounded-full px-4 py-2 w-1/2">
          <input
            type="text"
            placeholder="🔍 Ingredientes, recetas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
            className="w-full p-2 bg-gray-300 text-gray-700 rounded-full focus:outline-none"
          />
          <button
            onClick={handleBuscar}
            className="bg-blue-500 px-4 py-2 ml-2 rounded-full text-white font-semibold hover:bg-green-600"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Sección de Recetas */}
      <div className="py-12 px-6 max-w-7xl mx-auto" ref={gridRef}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">¡Descubre recetas que inspiran!</h2>
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Buscar en recetas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-[95%] p-2 border border-gray-300 rounded-lg"
          />
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recetasPaginadas.length > 0 ? (
            recetasPaginadas.map((receta) => (
              <div
                key={receta.id}
                className="test-receta-item bg-neutral-200 border-gray-500 drop-shadow-md rounded-lg overflow-hidden transform transition hover:scale-105 cursor-pointer"
                onClick={() => setModalReceta(receta)}
              >
                <img
                  src={
                    receta.imagen_url ||
                    "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
                  }
                  alt={receta.nombre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{receta.nombre}</h3>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                    {receta.descripcion}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                      {receta.tiempo_minutos} min
                    </span>
                    <span className="flex items-center text-gray-500 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.656l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      {/* Se muestra el número de likes obtenido de la API (o 0 si no está definido) */}
                      {likesCount[receta.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No hay recetas disponibles.</p>
          )}
        </div>
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-6 mb-20 py-10">
            <button
              onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaActual === 1}
              className="px-3 py-1 mx-1 bg-transparent rounded-full cursor-pointer hover:bg-blue-500 hover:text-white"
            >
              {"<"}
            </button>
            {getPaginationItems().map((item, index) =>
              item === "ellipsis" ? (
                <span key={index} className="px-3 py-1 mx-1">
                  …
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => setPaginaActual(item)}
                  className={`px-3 py-1 mx-1 rounded ${
                    item === paginaActual
                      ? "bg-blue-500 text-white rounded-full"
                      : "bg-transparent text-black rounded-full hover:bg-blue-500 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              onClick={() =>
                setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
              }
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1 mx-1 bg-transparent rounded-full hover:bg-blue-500 hover:text-white"
            >
              {">"}
            </button>
          </div>
        )}
      </div>

      {/* Modal de Receta */}
      {modalReceta && (
        <div
          id="modalFondo"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCerrarModal}
        >
          <div className="bg-white p-8 rounded-lg max-w-xl w-full max-h-[80vh] overflow-y-auto relative shadow-xl">
            {/* Botón de cerrar */}
            <button
              className="test-cerrar-modal absolute top-4 right-4 text-black text-xs font-extrabold hover:text-red-500"
              onClick={() => setModalReceta(null)}
            >
              &#10005;
            </button>
            {/* Imagen de la receta */}
            <img
              src={
                modalReceta.imagen_url ||
                "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
              }
              alt={modalReceta.nombre}
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
            {/* Título de la receta */}
            <h3 className="text-3xl font-bold mb-4">{modalReceta.nombre}</h3>
            
            {/* Sección de Ingredientes */}
            <div className="mb-6">
              <h4 className="text-xl font-semibold border-b pb-2 mb-2">🥕 Ingredientes</h4>
              <p className="text-gray-950">{modalReceta.ingredientes}</p>
            </div>
            
            {/* Sección de Preparación */}
            <div className="mb-6">
              <h4 className="text-xl font-semibold border-b pb-2 mb-2">📜 Preparación</h4>
              <p className="text-gray-950">{modalReceta.instrucciones}</p>
            </div>
            
            {/* Sección de Tiempo */}
            <div className="mb-6">
              <h4 className="text-xl font-semibold border-b pb-2 mb-2">⏳ Tiempo</h4>
              <p className="text-gray-950">{modalReceta.tiempo_minutos} min</p>
            </div>
            
            {/* Botones de Acciones */}
            <div className="flex justify-end gap-6">
              {/* Botón para ver la receta */}
              <button
                className="test-ver-receta flex items-center bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
                onClick={() => {
                  navigate(`/receta/${modalReceta.id}`);
                  setModalReceta(null);
                }}
              >
                Ver receta
              </button>
              {/* Botón de Like */}
              <button
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                onClick={async () => {
                  if (!usuarioAutenticado) {
                    navigate("/registro");
                  } else {
                    // Actualización optimista
                    const currentLiked = recetaStatus[modalReceta.id]?.liked || false;
                    const newLiked = !currentLiked;
                    setRecetaStatus((prev) => ({
                      ...prev,
                      [modalReceta.id]: {
                        ...prev[modalReceta.id],
                        liked: newLiked,
                      },
                    }));
                    if (newLiked) {
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    }
                    try {
                      const result = await toggle_like(modalReceta.id);
                      setRecetaStatus((prev) => ({
                        ...prev,
                        [modalReceta.id]: {
                          ...prev[modalReceta.id],
                          liked: result.like,
                        },
                      }));
                    } catch (err) {
                      setRecetaStatus((prev) => ({
                        ...prev,
                        [modalReceta.id]: {
                          ...prev[modalReceta.id],
                          liked: currentLiked,
                        },
                      }));
                      console.error("Error al actualizar like:", err);
                    }
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.656l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {recetaStatus[modalReceta.id]?.liked ? "Quitar Like" : "Like"}
              </button>
              {/* Botón de Favorito */}
              <button
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                onClick={async () => {
                  if (!usuarioAutenticado) {
                    navigate("/registro");
                  } else {
                    const currentFav = recetaStatus[modalReceta.id]?.favorited || false;
                    const newFav = !currentFav;
                    setRecetaStatus((prev) => ({
                      ...prev,
                      [modalReceta.id]: {
                        ...prev[modalReceta.id],
                        favorited: newFav,
                      },
                    }));
                    if (newFav) {
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    }
                    try {
                      const result = await toggle_favorito(modalReceta.id);
                      setRecetaStatus((prev) => ({
                        ...prev,
                        [modalReceta.id]: {
                          ...prev[modalReceta.id],
                          favorited: result.favorito,
                        },
                      }));
                    } catch (err) {
                      setRecetaStatus((prev) => ({
                        ...prev,
                        [modalReceta.id]: {
                          ...prev[modalReceta.id],
                          favorited: currentFav,
                        },
                      }));
                      console.error("Error al actualizar favorito:", err);
                    }
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v12l7-3 7 3V5a2 2 0 00-2-2H5z" />
                </svg>
                {recetaStatus[modalReceta.id]?.favorited ? "Eliminar de Favoritos" : "Favorito"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Dinámico */}
      <div className="py-20 bg-gradient-to-t from-blue-700 to-slate-700 px-6 text-center">
        {usuarioAutenticado ? (
          <>
            <h2
              className="text-3xl font-bold mb-4 text-gray-100"
              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 2)" }}
            >
              ¡Comparte tu pasión culinaria!
            </h2>
            <p
              className="text-lg mb-6 text-white"
              style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 2)" }}
            >
              Publica tus recetas y sé la inspiración de nuestra comunidad.
            </p>
            <button
              className="bg-white text-blue-900 px-8 py-3 rounded-full text-lg font-bold hover:scale-125 shadow-lg transition"
              onClick={() => navigate("/receta/crear-receta")}
            >
              Crear Receta
            </button>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4 text-white"
            style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 2)" }}
            >
              ¿Listo para transformar tu cocina?
            </h2>
            <p className="text-lg mb-6 text-white"
            style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 2)" }}
            >
              Regístrate para descubrir recetas exclusivas, guardar tus favoritas y más.
            </p>
            <button
              className="bg-white text-blue-900 px-8 py-3 rounded-full text-lg font-bold hover:scale-125 shadow-lg transition"
              onClick={() => navigate("/registro")}
            >
              Regístrate Ahora
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Inicio;
