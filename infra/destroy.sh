#!/bin/bash

set -e

echo "🧹 1. Eliminando recursos de Kubernetes..."
cd k8s

echo "🔁 Eliminando Ingress (con fallback por si se queda atascado)..."
kubectl delete -f ingress-backend.yaml -n rafcetario --wait=false || true
sleep 3

# Si el Ingress sigue existiendo, eliminamos el finalizer
if kubectl get ingress backend-ingress -n rafcetario > /dev/null 2>&1; then
  echo "⚠️  Ingress aún existe, eliminando finalizer para forzar el delete..."
  kubectl patch ingress backend-ingress -n rafcetario -p '{"metadata":{"finalizers":[]}}' --type=merge
fi

kubectl delete -f service-backend.yaml || true
kubectl delete -f deployment-backend.yaml || true
kubectl delete -f backend-secret.yaml || true
kubectl delete -f namespace.yaml || true


echo "⏳ 2. Esperando a que AWS libere recursos asociados al ALB (120s)..."
sleep 120


echo "💣 3. Destruyendo infraestructura con Terraform..."
cd ../terraform
terraform destroy -auto-approve

echo "✅ Infraestructura eliminada completamente."
