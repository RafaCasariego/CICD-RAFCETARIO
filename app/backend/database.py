"""
Configuración de la base de datos (conexión, creación de sesiones, etc.)
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Validar que DATABASE_URL esté definida antes de usarla
if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+mysqlconnector://")
else:
    raise ValueError("ERROR: La variable de entorno DATABASE_URL no está configurada correctamente.")

# Crear el motor de la base de datos
engine = create_engine(DATABASE_URL)

# Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
