"""
Funciones CRUD para gestionar favoritos y likes de recetas
"""

from sqlalchemy.orm import Session
from models import FavoritoLike, Receta
from sqlalchemy.orm import joinedload

# Agregar o quitar un favorito
def toggle_favorito(db: Session, usuario_id: int, receta_id: int):
    favorito = db.query(FavoritoLike).filter_by(usuario_id=usuario_id, receta_id=receta_id).first()

    if favorito:
        favorito.favorito = not favorito.favorito  # Cambia entre True y False
    else:
        favorito = FavoritoLike(usuario_id=usuario_id, receta_id=receta_id, favorito=True)
        db.add(favorito)
    
    db.commit()
    db.refresh(favorito)
    return favorito


# Agregar o quitar un like
def toggle_like(db: Session, usuario_id: int, receta_id: int):
    like = db.query(FavoritoLike).filter_by(usuario_id=usuario_id, receta_id=receta_id).first()

    if like:
        like.like = not like.like  # Cambia entre True y False
    else:
        like = FavoritoLike(usuario_id=usuario_id, receta_id=receta_id, like=True)
        db.add(like)

    db.commit()
    db.refresh(like)
    return like



# Obtener todas las recetas que el usuario ha marcado como favoritas
def obtener_favoritos(db: Session, usuario_id: int):
    favoritos = (
        db.query(FavoritoLike)
        .options(joinedload(FavoritoLike.receta))
        .filter(FavoritoLike.usuario_id == usuario_id, FavoritoLike.favorito == True)
        .all()
    )
    return {"usuario_id": usuario_id, "favoritos": favoritos}


# Obtener todas las recetas a las que el usuario ha dado "me gusta"
def contar_likes(db: Session, receta_id: int):
    return db.query(FavoritoLike).filter_by(receta_id=receta_id, like=True).count()