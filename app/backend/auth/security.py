"""
En este archivo se maneja la lógica de autenticación del usuario, funciones de 
seguridad relacionadas como el hash de contraseñas y dependencias para la 
autenticación en endpoints
"""


from passlib.context import CryptContext


# Configuración de bcrypt para encriptar contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Toma una contraseña en texto plano y devuelve su versión encriptada.
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Compara una contraseña en texto plano con su versión encriptada y devuelve True si coinciden.
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
