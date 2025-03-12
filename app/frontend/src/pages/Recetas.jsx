import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerRecetas } from "../services/api";

function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const recetasPorPagina = 12;

  useEffect(() => {
    const fetchRecetas = async () => {
      try {
        const data = await obtenerRecetas();
        if (data && data.length > 0) {
          setRecetas(data);
          setError("");
        } else {
          setRecetas([]);
          setError("No hay recetas disponibles en este momento.");
        }
      } catch (error) {
        console.error("Error al cargar recetas:", error);
        setError("Error cargando recetas.");
      }
    };

    fetchRecetas();
  }, []);

  // Filtrado client-side
  const recetasFiltradas = filter
    ? recetas.filter(
        (receta) =>
          receta.nombre.toLowerCase().includes(filter.toLowerCase()) ||
          receta.descripcion.toLowerCase().includes(filter.toLowerCase())
      )
    : recetas;

  // Paginación (client-side)
  const totalPaginas = Math.ceil(recetasFiltradas.length / recetasPorPagina);
  const indiceInicio = (paginaActual - 1) * recetasPorPagina;
  const recetasPaginadas = recetasFiltradas.slice(
    indiceInicio,
    indiceInicio + recetasPorPagina
  );

  // Generación de botones de paginación (similar al de la página de inicio)
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
    <div className="container mx-auto px-4 py-20 mt-6">
      {/* Encabezado: Título y buscador */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">
          Todas nuestras recetas
        </h1>
        <div className="flex justify-center mt-4">
          <input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar recetas..."
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Lista de recetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recetasPaginadas.length > 0 ? (
          recetasPaginadas.map((receta) => (
            <div
              key={receta.id}
              className="p-4 border rounded-lg shadow-md flex flex-col"
            >
              <img
                src={
                  receta.imagen_url ||
                  "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"
                }
                alt={receta.nombre}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h2 className="text-xl font-semibold text-gray-800">
                {receta.nombre}
              </h2>
              <p className="text-gray-600 flex-1">{receta.descripcion}</p>
              <Link
                to={`/receta/${receta.id}`}
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition self-start"
              >
                Ver Receta
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No hay recetas disponibles.</p>
        )}
      </div>

      {/* Paginación */}
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
  );
}

export default Recetas;
