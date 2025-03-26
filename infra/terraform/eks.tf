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
    desired_size = 3
    max_size     = 3
    min_size     = 2
  }

  instance_types = ["t3.micro"]

  depends_on = [
    aws_eks_cluster.eks,
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.cni_policy,
    aws_iam_role_policy_attachment.ec2_container_registry_read_only
  ]
}
