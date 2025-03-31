#!/bin/bash

set -e  # Termina si algún comando falla

echo "🌍 1. Aplicando infraestructura con Terraform..."
cd terraform
# 1. Crear cluster y nodos
terraform apply -target=aws_eks_cluster.eks -target=aws_eks_node_group.node_group -auto-approve

# 2. Esperar unos segundos (importante)
echo "⏳ Esperando 30 segundos para que el cluster esté disponible..."
sleep 30

# 3. Configurar contexto kubectl
echo "🔧 Configurando contexto kubectl para el cluster EKS..."
aws eks update-kubeconfig --region eu-west-1 --name rafcetario-cluster

# 4. Ahora sí: aplicar el resto (SGs, Helm, etc.)
terraform apply -auto-approve

echo "📥 2. Cargando ID del Security Group del ALB..."
export ALB_SG_ID=$(terraform output -raw alb_sg_id)

echo "🚢 3. Aplicando manifiestos de Kubernetes..."
cd ../k8s
kubectl apply -f namespace.yaml
kubectl apply -f backend-secret.yaml
kubectl apply -f deployment-backend.yaml
kubectl apply -f service-backend.yaml
envsubst < ingress-backend.yaml | kubectl apply -f -

echo "✅ Despliegue completo. Verifica en:"
kubectl get ingress -n rafcetario

echo "⏳ Esperando a que el Ingress tenga URL pública..."

# Esperar hasta que la URL esté disponible
for i in {1..30}; do
  ADDRESS=$(kubectl get ingress backend-ingress -n rafcetario -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
  if [ -n "$ADDRESS" ]; then
    break
  fi
  echo "⏳ Esperando... ($i)"
  sleep 5
done

if [ -n "$ADDRESS" ]; then
  echo "🌐 URL del backend: http://$ADDRESS"
  echo "⏳ Esperando a que el Load Balancer se aplique antes de probar con curl... (150s)"
  sleep 150
  echo "🔍 Probar con curl:"
  curl -i http://$ADDRESS

  echo "🧾 Generando archivo config.js con la URL del backend..."
  echo "window.API_URL = \"http://$ADDRESS\";" > temp-config.js

  echo "☁️ Subiendo config.js a S3..."
  aws s3 cp temp-config.js s3://rafcetario-frontend/config.js

  rm temp-config.js
else
  echo "❌ No se pudo obtener la URL del Ingress tras 150 segundos."
fi
