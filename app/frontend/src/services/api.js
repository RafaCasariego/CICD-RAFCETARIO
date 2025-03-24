import axios from "axios";

const API_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false
});


//---------> FUNCIONES DE LAS RECETAS <----------

// Obtener todas las recetas
export const obtenerRecetas = async () => {
  const response = await api.get("/recetas");
  return response.data;
};


// Obtener las recetas creadas por un usuario autenticado N
export const obtenerMisRecetas = async (usuario_id) => {
  const response = await api.get(`/recetas/usuarios/${usuario_id}`);
  return response.data;
}


// Eliminar receta por ID
export const eliminarReceta = async (recetaId) => {
  const token = localStorage.getItem("token");
  const response = await api.delete(`/recetas/${recetaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};



// Obtener los detalles de una receta por ID
export const obtenerRecetaPorId = async (receta_id) => {
  const response = await api.get(`/recetas/${receta_id}`);
  return response.data;
};


// Actualizar una receta
export const actualizarReceta = async (receta_id, datos) => {
  const token = localStorage.getItem("token");
  const response = await api.put(`/recetas/${receta_id}`, datos, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Crear una nueva receta
export const crearReceta = async (datos) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("nombre", datos.nombre);
  formData.append("descripcion", datos.descripcion);
  formData.append("ingredientes", datos.ingredientes);
  formData.append("instrucciones", datos.instrucciones);
  formData.append("tiempo_minutos", datos.tiempo_minutos); 

  if (datos.imagen) {
    formData.append("imagen", datos.imagen);
  }

  const response = await api.post("/recetas", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


//---------> FUNCIONES DE LOS USUARIOS <----------

// Registrar un usuario
export const registrarUsuario = async (datos) => {
  const response = await api.post("/registro", datos);
  return response.data;
};


// Registrar y logear un usuario de forma automática
export const registrarYLogear = async (datos) => {
  // Primero, registra al usuario enviando nombre, email y password (JSON)
  await registrarUsuario({
    nombre: datos.nombre,
    email: datos.email,
    password: datos.password,
  });
  
  // Luego, inicia sesión automáticamente.
  // La API espera en el login: grant_type, username y password (en URL-encoded)
  const loginResponse = await iniciarSesion({
    grant_type: "password",
    username: datos.email,      // usamos el email como username
    password: datos.password,
  });
  
  // Ya en iniciarSesion se guarda el token y el perfil en localStorage
  return loginResponse;
};


// Iniciar sesión
export const iniciarSesion = async (credenciales) => {
  const response = await api.post("/login", new URLSearchParams(credenciales), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // 🔥 Guarda el token en localStorage
  localStorage.setItem("token", response.data.access_token);

  // 🔥 Obtiene el perfil del usuario autenticado
  const perfil = await obtenerPerfil(response.data.access_token);
  localStorage.setItem("usuario", JSON.stringify(perfil)); // Guarda usuario

  return response.data;
};


// Obtener perfil del usuario autenticado
export const obtenerPerfil = async (token) => {
  const response = await api.get("/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Obtener recetas favoritas del usuario autenticado N
export const obtenerFavoritos = async (usuario_id, token) => {
  const response = await api.get(`/usuarios/${usuario_id}/favoritos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data
}


// Actualizar los datos personales del usuario autenticado N
export const actualizarUsuario = async (token, datos) => {
  const response = await api.put("/perfil", datos, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data
}


// Función para eliminar la cuenta del usuario
export const eliminarCuenta = async (token) => {
  const response = await api.delete("/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};



// Agregar la receta en favoritos
export const toggle_favorito = async (receta_id) => {
  const token = localStorage.getItem("token");
  const response = await api.put(
    `/recetas/${receta_id}/favorito`,
    null, // No se envía body
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};


// Dar like a una receta
export const toggle_like = async (receta_id) => {
  const token = localStorage.getItem("token");
  const response = await api.put(
    `/recetas/${receta_id}/like`,
    null, // No se envía body
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};


// Función para obtener el número de likes de una receta
export const obtenerLikes = async (receta_id) => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/recetas/${receta_id}/likes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};