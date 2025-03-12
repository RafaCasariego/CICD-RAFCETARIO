import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Recetas from "./pages/Recetas";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Favoritos from "./pages/Favoritos";
import MisRecetas from "./pages/MisRecetas";
import RecetaDetalle from "./pages/RecetaDetalle"
import EditarReceta from "./pages/EditarReceta"
import CrearReceta from "./pages/CrearReceta"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RutaPrivada from "./components/RutaPrivada";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        <Route path="/" element={<Inicio />} />
        <Route path="/recetas" element={<Recetas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mis-recetas" element={<MisRecetas />} />
        <Route path="/receta/:id" element={<RecetaDetalle />} />


        {/* Rutas protegidas */}
        <Route element={<RutaPrivada />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/receta/editar/:id" element={<EditarReceta />} />
          <Route path="/receta/crear-receta" element={<CrearReceta />} />

        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
