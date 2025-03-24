"""
Definición de los modelos de la base de datos (tablas y relaciones con SQLAlchemy)
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base



# Modelo Usuario
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Almacenar contraseñas encriptadas

    # Relaciones
    recetas = relationship("Receta", back_populates="usuario")
    favoritos_likes = relationship("FavoritoLike", back_populates="usuario", cascade="all, delete-orphan")



# Modelo Receta
class Receta(Base):
    __tablename__ = "recetas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    descripcion = Column(Text)
    ingredientes = Column(Text)
    instrucciones = Column(Text)
    tiempo_minutos = Column(Integer)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    imagen_url = Column(String, nullable=True)  # Nueva columna para la URL de la imagen

    usuario = relationship("Usuario", back_populates="recetas")
    favoritos_likes = relationship("FavoritoLike", back_populates="receta", cascade="all, delete-orphan")


# Modelo para dar favorito y/o like.
class FavoritoLike(Base):
    __tablename__ = "favoritos_likes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    receta_id = Column(Integer, ForeignKey("recetas.id", ondelete="CASCADE"), nullable=False)
    favorito = Column(Boolean, default=False)
    like = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relaciones
    usuario = relationship("Usuario", back_populates="favoritos_likes")
    receta = relationship("Receta", back_populates="favoritos_likes")