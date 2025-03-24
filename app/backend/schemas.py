"""
Esquemas de Pydantic para validación de datos en las solicitudes y respuestas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional

# Esquema para crear una receta
class RecetaCreate(BaseModel):
    nombre: str
    descripcion: str
    ingredientes: str
    instrucciones: str
    tiempo_minutos: int
    imagen_url: Optional[str] = None  # Agregar este campo opcional

# Esquema para actualizar una receta
class RecetaUpdate(BaseModel):
    nombre: str
    descripcion: str
    ingredientes: str
    instrucciones: str
    tiempo_minutos: int
    imagen_url: Optional[str] = None  # Nueva propiedad opcional para la URL de la imagen

    class Config:
        orm_mode = True


# Esquema para crear un usuario
class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str


# Esquema para devolver la info de un usuario (excepto la contraseña)
class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr

    class Config:
        from_attributes = True # Permite convertir SQLAlchemy a Pydantic


# Esquema para el login del usuario
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


#Esquema para que el usuario pueda modificar sus datos
class UsuarioUpdate(BaseModel):
    nombre: str
    email: EmailStr
