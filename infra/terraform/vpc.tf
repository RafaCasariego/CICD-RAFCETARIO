# Cargar la VPC existente (donde está RDS)
data "aws_vpc" "existing_vpc" {
  id = "vpc-0f78da94e2319c1ec"  # ← tu VPC de RDS
}

# Cargar las subnets de esa VPC
data "aws_subnets" "private_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing_vpc.id]
  }
}
