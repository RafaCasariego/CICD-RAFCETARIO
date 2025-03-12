import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FaUser } from "react-icons/fa"; // Icono de usuario
import { FiEdit, FiHeart, FiLogOut } from "react-icons/fi"; // Iconos
import { MdOutlineFastfood } from "react-icons/md"; // Icono de recetas

const Navbar = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [scrolling, setScrolling] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null); // 🔹 Referencia al menú

  useEffect(() => {
    if (location.pathname !== "/") {
      setScrolling(true);
      return;
    }

    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const actualizarUsuario = () => {
      const usuarioGuardado = localStorage.getItem("usuario");
      setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    };

    actualizarUsuario();
    window.addEventListener("storage", actualizarUsuario);
    return () => window.removeEventListener("storage", actualizarUsuario);
  }, []);

  // 🔹 Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className={`fixed top-0 left-0 w-full p-4 transition-all duration-300 z-50 ${scrolling ? "bg-blue-700 shadow-md" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">
          Rafcetario
        </Link>

        {usuario ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="test-navbar-menu bg-gray-200 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center font-bold uppercase border-2 border-gray-200"
            >
              {usuario.nombre[0]}
            </button>

            {menuAbierto && (
              <div className="test-navbar-dropdown absolute right-0 mt-3 w-60 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                {/* Tarjeta de perfil */}
                <div className="bg-blue-600 text-white p-4 flex flex-col items-center">
                  <div className="bg-white text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                    {usuario.nombre[0]}
                  </div>
                  <p className="text-lg font-semibold mt-2">{usuario.nombre}</p>
                  <p className="text-sm text-gray-200">{usuario.email}</p>
                </div>

                {/* Opciones del menú */}
                <div className="flex flex-col p-2">
                  <Link to="/perfil" className="test-editarperfil-button flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                    <FiEdit className="text-xl text-blue-600" />
                    Editar Perfil
                  </Link>
                  <Link to="/mis-recetas" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                    <MdOutlineFastfood className="text-xl text-orange-500" />
                    Mis Recetas
                  </Link>
                  <Link to="/favoritos" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                    <FiHeart className="text-xl text-red-500" />
                    Mis Favoritos
                  </Link>
                  <button onClick={cerrarSesion} className="test-cerrarsesion-button flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg text-red-600">
                    <FiLogOut className="text-xl" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="test-iniciarsesion-button flex items-center text-white hover:opacity-80 transition">
            <FaUser className="text-3xl" />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
