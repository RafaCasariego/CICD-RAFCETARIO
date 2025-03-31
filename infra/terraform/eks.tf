# Crear CLÚSTER de EKS
resource "aws_eks_cluster" "eks" {
  name     = "rafcetario-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids         = data.aws_subnets.private_subnets.ids
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_service_policy
  ]
}

# Crear Node Group (EC2)
resource "aws_eks_node_group" "node_group" {
  cluster_name    = aws_eks_cluster.eks.name
  node_group_name = "rafcetario-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = data.aws_subnets.private_subnets.ids

  scaling_config {
    desired_size = 5
    max_size     = 5
    min_size     = 4
  }

  instance_types = ["t3.micro"]


  depends_on = [
    aws_eks_cluster.eks,
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.cni_policy,
    aws_iam_role_policy_attachment.ec2_container_registry_read_only
  ]
}

# Obtener las credenciales temporales necesarias para autenticar peticiones contra el clúster.
# Lo necesita helm.
data "aws_eks_cluster_auth" "rafcetario" {
  name = aws_eks_cluster.eks.name
}

# Instalación del AWS Load Balancer Controller vía Helm
resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  namespace  = "kube-system"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = "1.6.1"

  set {
    name  = "clusterName"
    value = aws_eks_cluster.eks.name
  }

  set {
    name  = "serviceAccount.name"
    value = kubernetes_service_account.alb_controller.metadata[0].name
  }

  set {
    name  = "serviceAccount.create"
    value = "false"
  }

  set {
    name  = "region"
    value = "eu-west-1"
  }

  set {
    name  = "vpcId"
    value = data.aws_vpc.existing_vpc.id
  }
}
