"""
Punto de entrada de la API, donde se definen las rutas y se inicia la app
"""

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import crud.receta
from schemas import RecetaCreate, RecetaUpdate, UsuarioLogin, UsuarioCreate, UsuarioResponse, UsuarioUpdate
import crud.usuario
from models import Receta, Usuario
from auth.jwt import obtener_usuario_actual, crear_token
from auth.security import verify_password
import crud.favorito_like
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import boto3
from dotenv import load_dotenv
from typing import Optional



# Crear la base de datos
Base.metadata.create_all(bind=engine)


# Instancia de FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP
    allow_headers=["*"],  # Permitir todos los headers
)

# 🔥 Ruta absoluta para evitar problemas de ejecución
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Cargar variables de entorno desde .env
load_dotenv()

# Credenciales de AWS
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

# Cliente de S3
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
)


"""********************** ENDPOINTS DE LAS RECETAS **********************"""



# Endpoint para buscar recetas concretas por su nombre, ingredientes o timepo de prep.
@app.get("/recetas/buscar")
async def buscar_recetas(
    nombre: str = None,
    ingredientes: str = None,
    tiempo_max: int = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit  # Calcular desde qué receta empezar
    recetas = crud.receta.buscar_recetas(db, nombre, ingredientes, tiempo_max, skip, limit)
    
    return {"total": len(recetas), "page": page, "recetas": recetas}



# Endpoint para btener todas las recetas (No requiere autenticación)
@app.get("/recetas")
async def mostrar_recetas(db: Session = Depends(get_db)):
    return crud.receta.get_recetas(db)



# Endpoint para crear una receta
@app.post("/recetas", status_code=status.HTTP_201_CREATED)
async def crear_receta(
    nombre: str = Form(...),
    descripcion: str = Form(...),
    ingredientes: str = Form(...),
    instrucciones: str = Form(...),
    tiempo_minutos: int = Form(...),
    imagen: Optional[UploadFile] = File(None),  # Imagen opcional
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    imagen_url = "https://rafcetario-images.s3.eu-north-1.amazonaws.com/default-image.jpg"  # Imagen por defecto

    if imagen:
        try:
            # Nombre único para la imagen en S3
            nombre_archivo = f"recetas/{usuario_actual.id}_{imagen.filename}"

            # Subir la imagen a S3
            s3_client.upload_fileobj(imagen.file, AWS_BUCKET_NAME, nombre_archivo)

            # URL pública de la imagen
            imagen_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{nombre_archivo}"
            print(f"✅ Imagen subida correctamente: {imagen_url}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {str(e)}")

    # Crear la receta en la base de datos con la URL correcta
    nueva_receta = crud.receta.create_receta(
        db,
        RecetaCreate(
            nombre=nombre,
            descripcion=descripcion,
            ingredientes=ingredientes,
            instrucciones=instrucciones,
            tiempo_minutos=tiempo_minutos,
        ),
        usuario_actual,
        imagen_url=imagen_url  
)

    return nueva_receta






# Endpoint para obtener una receta por ID (No requiere autenticación)
@app.get("/recetas/{receta_id}")
async def mostrar_receta(receta_id: int, db: Session = Depends(get_db)):
    receta = crud.receta.get_receta_by_id(db, receta_id)
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return receta



# Endpoint para modificar una receta (solo el dueño puede hacerlo)
@app.put("/recetas/{receta_id}")
async def modificar_receta(
    receta_id: int,
    receta: RecetaUpdate,
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return crud.receta.modificar_receta(db, receta_id, receta, usuario_actual)



# Endpoint para eliminar una receta (solo el dueño puede hacerlo)
@app.delete("/recetas/{receta_id}")
async def eliminar_receta(
    receta_id: int,
    usuario_actual: dict = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return crud.receta.eliminar_receta(db, receta_id, usuario_actual)



# Endpoint para obtener las recetas de un usuario específico
@app.get("/recetas/usuarios/{usuario_id}")
async def obtener_recetas_usuario(usuario_id: int, db: Session = Depends(get_db)):
    return crud.receta.get_recetas_por_usuario(db, usuario_id)





"""********************** ENDPOINTS DE LOS USUARIOS **********************"""



# Registrar un nuevo usuario
@app.post("/registro")
async def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_creado = crud.usuario.crear_usuario(db, usuario)
    
    if not usuario_creado:
        raise HTTPException(status_code=400, detail="El usuario ya existe con ese email")

    return {"mensaje": "Usuario creado con éxito", "usuario": usuario_creado}



# Iniciar sesión. Devuelve un token JWT si las credenciales son correctas.
@app.post("/login")
async def login(datos_login: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = crud.usuario.obtener_usuario_por_email(db, datos_login.username)
    
    if not usuario or not verify_password(datos_login.password, usuario.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token({"sub": usuario.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario_id": usuario.id 
    }


# Endpoint raiz
@app.get("/")
def read_root():
    return {"message": "API del Rafcetario :)"}


# Endpoint para obtener el perfil del usuario autenticado
@app.get("/perfil", response_model=UsuarioResponse)
async def perfil_usuario(usuario_actual: Usuario = Depends(obtener_usuario_actual), db: Session = Depends(get_db)):
    return crud.usuario.obtener_perfil_usuario(db, usuario_actual)



# Endpoint para que el usuario autenticado pueda modificar sus datos personales
@app.put("/perfil", response_model=UsuarioResponse)
async def actualizar_perfil(
    datos_actualizados: UsuarioUpdate,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):
    return crud.usuario.actualizar_usuario(db, usuario_actual, datos_actualizados)



# Endpoint para que un usuario autenticado elimine su cuenta y recetas asociadas
@app.delete("/perfil", status_code=status.HTTP_200_OK)
async def eliminar_cuenta_usuario(
    usuario_actual: Usuario = Depends(obtener_usuario_actual), db: Session = Depends(get_db)
):
    return crud.usuario.eliminar_cuenta(db, usuario_actual)



# Endpoint para que un usuario autenticado cambie su contraseña
@app.put("/perfil/cambiar_contraseña", status_code=status.HTTP_200_OK)
async def cambiar_contraseña_usuario(
    contraseña_actual: str,
    nueva_contraseña: str,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return crud.usuario.cambiar_contraseña(db, usuario_actual, contraseña_actual, nueva_contraseña)




"""********************** ENDPOINTS DE LOS FAVORITOS/LIKES **********************"""



# Marcar o quitar una receta de favoritos
@app.put("/recetas/{receta_id}/favorito")
async def toggle_favorito(
    receta_id: int,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return crud.favorito_like.toggle_favorito(db, usuario_actual.id, receta_id)



# Marcar o quitar un like en una receta
@app.put("/recetas/{receta_id}/like")
async def toggle_like(
    receta_id: int,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return crud.favorito_like.toggle_like(db, usuario_actual.id, receta_id)



# Obtener las recetas favoritas del usuario autenticado
@app.get("/usuarios/{usuario_id}/favoritos")
async def obtener_favoritos(usuario_id: int, db: Session = Depends(get_db)):
    return crud.favorito_like.obtener_favoritos(db, usuario_id)




@app.get("/recetas/{receta_id}/likes")
async def contar_likes(receta_id: int, db: Session = Depends(get_db)):
    count = crud.favorito_like.contar_likes(db, receta_id)
    return {"count": count}