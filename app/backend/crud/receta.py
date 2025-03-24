"""
Funciones para manejar las operaciones CRUD de recetas
"""

from sqlalchemy.orm import Session
from models import Receta
from schemas import RecetaCreate, RecetaUpdate
from fastapi import HTTPException, status
from typing import Optional


# Obtener todas las recetas (cualquiera puede hacerlo)
def get_recetas(db: Session):
    return db.query(Receta).all()


# Crear una nueva receta (solo un usuario autenticado puede hacerlo)
def create_receta(db: Session, receta: RecetaCreate, usuario_actual, imagen_url: Optional[str] = None):

    nueva_receta = Receta(
        nombre=receta.nombre,
        descripcion=receta.descripcion,
        ingredientes=receta.ingredientes,
        instrucciones=receta.instrucciones,
        tiempo_minutos=receta.tiempo_minutos,
        usuario_id=usuario_actual.id,
        imagen_url=imagen_url if imagen_url else "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg",  
    )


    db.add(nueva_receta)
    db.commit()
    db.refresh(nueva_receta)
    return nueva_receta


# Obtener una receta por ID (cualquiera puede hacerlo)
def get_receta_by_id(db: Session, receta_id: int):
    return db.query(Receta).filter(Receta.id == receta_id).first()



# Eliminar una receta (solo el dueño puede hacerlo)
def eliminar_receta(db: Session, receta_id: int, usuario_actual):
    receta = db.query(Receta).filter(Receta.id == receta_id).first()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if receta.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta receta")

    db.delete(receta)
    db.commit()
    return {"mensaje": f"Receta '{receta.nombre}' eliminada con éxito"}



# Modificar una receta (solo el dueño puede hacerlo)
def modificar_receta(db: Session, receta_id: int, receta_data: RecetaUpdate, usuario_actual):
    receta = db.query(Receta).filter(Receta.id == receta_id).first()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if receta.usuario_id != usuario_actual.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para modificar esta receta")

    receta.nombre = receta_data.nombre
    receta.descripcion = receta_data.descripcion
    receta.ingredientes = receta_data.ingredientes
    receta.instrucciones = receta_data.instrucciones
    receta.tiempo_minutos = receta_data.tiempo_minutos

    db.commit()
    db.refresh(receta)
    return receta



# Función para buscar recetas con filtros y paginación
def buscar_recetas(db: Session, nombre: str = None, ingredientes: str = None, tiempo_max: int = None, skip: int = 0, limit: int = 10):
    query = db.query(Receta)

    # Filtrar por nombre si se proporciona
    if nombre:
        query = query.filter(Receta.nombre.ilike(f"%{nombre}%"))  # Búsqueda flexible (case-insensitive)

    # Filtrar por ingredientes si se proporcionan
    if ingredientes:
        query = query.filter(Receta.ingredientes.ilike(f"%{ingredientes}%"))

    # Filtrar por tiempo de preparación máximo
    if tiempo_max:
        query = query.filter(Receta.tiempo_minutos <= tiempo_max)

    # Aplicar paginación
    recetas = query.offset(skip).limit(limit).all()

    return recetas



# Obtener todas las recetas de un usuario específico
def get_recetas_por_usuario(db: Session, usuario_id: int):
    # Asegúrate de que este filtro está funcionando bien
    recetas = db.query(Receta).filter(Receta.usuario_id == usuario_id).all()
    
    # Si no se encuentran recetas para ese usuario, se debe devolver un 404
    if not recetas:
        raise HTTPException(status_code=404, detail="Recetas no encontradas para este usuario.")
    
    return recetas
