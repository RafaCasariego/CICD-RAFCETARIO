# 🚀 Rafcetario - CI/CD DevOps Project

**Rafcetario** es una aplicación fullstack de recetas, desarrollada con **React (frontend)** y **FastAPI (backend)**. Este repositorio documenta la infraestructura DevOps construida desde cero para automatizar todo el ciclo de vida de la app: testing, construcción, despliegue, monitoreo y rollback, utilizando herramientas modernas como **GitHub Actions, Docker, Kubernetes, AWS y Terraform**.

---

## ⚙️ Automatización CI/CD

### ✅ 1. Testing & Linting

Workflow que ejecuta tests y linters tanto para frontend como backend, en cada `push` o `pull request` a `main`.  
Usa **SQLite** como base de datos temporal para evitar dependencias externas durante el testing.

### 🐳 2. Backend: Docker + AWS ECR

Construcción automática de una imagen Docker del backend y subida a **AWS ECR**, solo si el workflow de testing fue exitoso.  
Se etiquetan dos versiones: el SHA del commit y `latest`.

### 🌐 3. Frontend: Build + AWS S3

El frontend (estático) se compila y despliega automáticamente en un bucket de **AWS S3**, también condicionado al éxito del testing.  
Permite servir la web pública desde un origen optimizado y económico.

---

## ☁️ Infraestructura en la nube

### 🔐 Base de datos en AWS RDS

La base de datos MySQL fue migrada desde Railway a **AWS RDS**, dentro de una VPC personalizada, optimizando seguridad, latencia y costos.

### 📦 Terraform

Automatiza la infraestructura completa:
- Creación del clúster EKS.
- Node group en EC2.
- Instalación del AWS Load Balancer Controller.
- Importación de la VPC existente (de la base de datos).
- Definición de Security Groups optimizados y reutilizables.

### 🧬 Kubernetes

- **Secrets:** contiene variables sensibles como la URL de la base de datos y claves de AWS.
- **Namespace:** agrupa todos los recursos bajo `rafcetario`.
- **Deployment:** despliega la imagen del backend desde ECR.
- **Service:** expone el backend internamente vía `NodePort`.
- **Ingress (ALB):** habilita acceso público a la API del backend mediante un Application Load Balancer administrado por Kubernetes.

---

## 🛠️ Scripts

### `deploy.sh`
- Aplica la infraestructura con Terraform.
- Aplica los manifiestos de Kubernetes.
- Obtiene la URL pública del backend desde el Ingress.
- Prueba conectividad con `curl`.
- Actualiza dinámicamente `config.js` del frontend para usar la nueva URL.

### `destroy.sh`
- Elimina manifiestos de Kubernetes.
- Espera que AWS libere los recursos (como el ALB).
- Ejecuta `terraform destroy` limpiamente.

---

## ⚠️ Retos y soluciones reales

- **Testing sin acceso a la BD:** solucionado utilizando SQLite durante los tests de CI.

- **Problemas con etiqueta `latest`:** se corrigió asegurando que el tag `latest` se subiera explícitamente a ECR.

- **Costos inesperados por EC2:** inicialmente se pensó en tener instancias EC2 separadas para backend y frontend, pero esto era innecesariamente costoso. Se intentó migrar el frontend a Fargate, pero el ahorro era mínimo. Finalmente se optó por servir el frontend desde S3, aprovechando que es estático. Es la solución más barata, sencilla y eficiente.

- **Limitaciones de Fargate para backend público:** al mover el frontend a S3, el backend ya no podía comunicarse internamente con el frontend. Como Fargate no permite fácilmente exposición pública sin EC2, se decidió mantener el backend en nodos EC2 para exponerlo mediante un ALB.

- **Conectividad entre BD y backend:** inicialmente, la base de datos y el backend estaban en VPC distintas, lo que dificultaba la gestión de reglas de acceso. Se resolvió alojando ambos en la misma VPC (la de la base de datos), simplificando la configuración de seguridad y mejorando el rendimiento.

- **Problemas con el ALB y los Security Groups:** al automatizar el despliegue del ALB, surgían problemas de conectividad porque el Security Group (SG) del ALB cambiaba en cada despliegue, y el SG del clúster no lo permitía.  
  - Se solucionó automatizando la creación y referencia de ambos SG desde Terraform.
  - El SG del clúster ahora acepta tráfico entrante desde el SG del ALB.
  - El SG del ALB se parametriza mediante variables reutilizables, asegurando una correcta exposición pública y evitando errores de conectividad.

---

## 🧠 Lecciones aprendidas

- Optimizar costos en la nube implica múltiples pruebas y decisiones.
- Automatizar ALBs en Kubernetes requiere una buena comprensión de los SGs y sus dependencias.
- No todo debe correr en EC2: saber cuándo usar S3, Fargate u otras soluciones puede marcar una gran diferencia.
- Documentar errores y soluciones en tiempo real acelera el desarrollo y permite aprender más profundamente.

---

¿Quieres saber más? ¡Revisa los workflows YAML, manifiestos de Kubernetes y archivos Terraform en este repositorio!

---

👨🏻‍💻 Hecho por Rafa Casariego.
📧 rafacasariego@gmail.com
