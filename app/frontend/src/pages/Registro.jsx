import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarYLogear } from "../services/api";

const Registro = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para el mensaje de error
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      // Usamos la función combinada
      await registrarYLogear({ nombre, email, password });
      
      // Si el registro y login son exitosos, redirigimos a la home
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Error durante el registro y login", err);
      
      // Extraer el mensaje de error desde la propiedad "detail"
      const errorData = err.response?.data;
      const errorMsg = String(errorData?.detail || "").trim();
      console.log("Error message:", errorMsg);
      
      // Verificamos si el mensaje incluye "existe"
      if (errorMsg.toLowerCase().includes("existe")) {
        setError("Ese email ya está en uso");
      } else {
        setError("Error durante el registro. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>

      <form onSubmit={handleSubmit} className="flex flex-col bg-gray-100 p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Nombre"
          className="mb-3 p-2 border rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="mb-3 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="mb-3 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* Mostrar el mensaje de error si existe */}
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Registrarse
        </button>
      </form>

      <p className="mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="text-blue-500 hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
};

export default Registro;
