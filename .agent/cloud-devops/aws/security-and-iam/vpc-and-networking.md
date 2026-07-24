# Skill: .agent/cloud-devops/aws/security-and-iam/vpc-and-networking.md

## 📌 Core Philosophy & Constraints
- **Subnet Isolation**: Split VPC into Public (ALB/Bastion), Private App (ECS/EC2), and Isolated Database subnets.
- **Redundant NAT Gateways**: Deploy Multi-AZ NAT Gateways to ensure outbound internet availability for private subnets.
- **ALB Security Groups**: Restrict Application Load Balancer security groups to ports 80/443; route to app target groups.

## ⚡ Production Boilerplate / Standard Pattern

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "saas-vpc-prod"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]
  database_subnets= ["10.0.100.0/24", "10.0.200.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway  = false
  enable_dns_hostnames = true
}

resource "aws_security_group" "alb_sg" {
  name        = "alb-security-group"
  vpc_id      = module.vpc.vpc_id
  description = "Allow inbound HTTPS to ALB"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Single Flat Subnet**: Placing database instances and public load balancers in the same subnet.
- ❌ **Direct Public IPs on Databases**: Assigning public IP addresses to RDS instances.
- ❌ **Single NAT Gateway in Production**: Using a single NAT Gateway across multiple Availability Zones.

## 🔍 Verification & Testing
- **Subnet Route Verification**: `aws ec2 describe-route-tables` confirming private subnet routes point to NAT Gateway IDs.
