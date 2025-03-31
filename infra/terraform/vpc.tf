# Cargar la VPC existente (donde está RDS)
data "aws_vpc" "existing_vpc" {
  id = "vpc-0f78da94e2319c1ec"
}

# Cargar las subnets de esa VPC
data "aws_subnets" "private_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing_vpc.id]
  }
}

# Cargar el Security Group del cluster EKS por nombre del cluster
data "aws_security_group" "eks_cluster_sg" {
  filter {
    name   = "tag:aws:eks:cluster-name"
    values = ["rafcetario-cluster"]
  }
}

# SG del ALB
resource "aws_security_group" "alb_sg" {
  name        = "rafcetario-alb-sg"
  description = "Permitir trafico HTTP desde internet al ALB"
  vpc_id      = data.aws_vpc.existing_vpc.id

  ingress {
    description = "HTTP desde internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow HTTP to private subnets (EKS nodes)"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["172.30.0.0/16"]
  }

  tags = {
    Name = "rafcetario-alb-sg"
  }
}

# Permitir tráfico desde el ALB al cluster EKS en el puerto 8000
resource "aws_security_group_rule" "allow_alb_to_eks" {
  type                     = "ingress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.eks_cluster_sg.id
  source_security_group_id = aws_security_group.alb_sg.id
  description              = "Allow ALB to reach backend on port 8000"
}
