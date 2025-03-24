import sys
import os

# Agrega el directorio backend al PATH para que pytest pueda encontrar `main.py`
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../")


from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
