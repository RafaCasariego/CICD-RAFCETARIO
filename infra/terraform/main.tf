provider "aws" {
  region = "eu-west-1"  # Cambia según tu región
}

# 🔹 VPC para EKS
resource "aws_vpc" "eks_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "eks-vpc"
  }
}

# 🔹 Internet Gateway para la VPC
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "eks-igw"
  }
}

# 🔹 Subnet Pública para NAT Gateway
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "eu-west-1a" # Ajusta según tu región

  tags = {
    Name = "public-subnet"
  }
}

# 🔹 Subnets Privadas para EKS y Fargate
resource "aws_subnet" "private_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = "10.0.${count.index}.0/24"
  map_public_ip_on_launch = false
  availability_zone       = element(["eu-west-1a", "eu-west-1b"], count.index)

  tags = {
    Name = "private-subnet-${count.index}"
  }
}

# 🔹 Elastic IP para NAT Gateway
resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

# 🔹 NAT Gateway en la Subnet Pública
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    Name = "eks-nat-gateway"
  }
}

# 🔹 Tabla de Rutas para las Subnets Privadas (dirigiendo tráfico a NAT Gateway)
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "private-route-table"
  }
}

# 🔹 Asociar las Subnets Privadas a la Tabla de Rutas
resource "aws_route_table_association" "private_subnet_association" {
  count          = 2
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_route_table.id
}

# 🔹 Rol IAM para EKS Cluster
resource "aws_iam_role" "eks_role" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# 🔹 Adjuntar Permisos a EKS Role
resource "aws_iam_role_policy_attachment" "eks_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}

# 🔹 Crear el Cluster de Kubernetes en EKS
resource "aws_eks_cluster" "eks" {
  name     = "rafcetario-cluster"
  role_arn = aws_iam_role.eks_role.arn

  vpc_config {
    subnet_ids             = aws_subnet.private_subnets[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [aws_iam_role.eks_role]
}

# 🔹 Rol IAM para Fargate Profile
resource "aws_iam_role" "fargate_role" {
  name = "rafcetario-fargate-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks-fargate-pods.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# 🔹 Adjuntar Permisos al Rol de Fargate
resource "aws_iam_role_policy_attachment" "fargate_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
  role       = aws_iam_role.fargate_role.name
}

# 🔹 Crear Perfil de Fargate para EKS
resource "aws_eks_fargate_profile" "fargate" {
  cluster_name           = aws_eks_cluster.eks.name
  fargate_profile_name   = "rafcetario-fargate"
  pod_execution_role_arn = aws_iam_role.fargate_role.arn
  subnet_ids             = aws_subnet.private_subnets[*].id

  selector {
    namespace = "default"
  }
}

# 🔹 Outputs
output "eks_cluster_name" {
  value = aws_eks_cluster.eks.name
}

output "eks_fargate_profile" {
  value = aws_eks_fargate_profile.fargate.fargate_profile_name
}
