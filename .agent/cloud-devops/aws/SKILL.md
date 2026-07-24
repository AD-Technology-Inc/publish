# Skill: .agent/cloud-devops/aws/SKILL.md

# AWS Cloud Infrastructure & Compute Skill Registry

This document serves as the cloud architecture matrix and Terraform HCL specification reference for AI agents provisioning production AWS environments.

---

## 🛠️ Tech Stack & Provider Manifest

- **Infrastructure as Code**: Terraform 5.x (AWS Provider `hashicorp/aws >= 5.0`)
- **Compute Instance**: Amazon EC2 (Ubuntu 24.04 LTS Noble ARM64 `t4g.medium`)
- **Container Compute**: Amazon ECS Fargate (Serverless Container Orchestration)
- **Serverless Runtime**: AWS Lambda (Python 3.12 / Node 22)
- **Managed Database**: Amazon RDS PostgreSQL 18 (Multi-AZ, Storage Auto-Scaling)
- **Storage & CDN**: Amazon S3 + CloudFront CDN (OAC Authentication, TLS 1.3)
- **Security & Access**: AWS IAM (Least Privilege) + AWS VPC (Private Subnet Isolation)

---

## 🔗 Sub-Skill Deep Dive References

- 🖥️ **EC2 Instance Management**: [ec2-instance-management.md](./infrastructure-and-compute/ec2-instance-management.md)
- 🐳 **ECS Docker Deployments**: [ecs-docker-deployments.md](./infrastructure-and-compute/ecs-docker-deployments.md)
- ⚡ **Lambda Serverless**: [lambda-serverless.md](./infrastructure-and-compute/lambda-serverless.md)
- 🐘 **RDS PostgreSQL / MySQL**: [rds-postgresql-mysql.md](./data-and-storage/rds-postgresql-mysql.md)
- 🪣 **S3 & CloudFront CDN**: [s3-and-cloudfront.md](./data-and-storage/s3-and-cloudfront.md)
- 🔑 **IAM Roles & Policies**: [iam-roles-and-policies.md](./security-and-iam/iam-roles-and-policies.md)
- 🌐 **VPC & Networking**: [vpc-and-networking.md](./security-and-iam/vpc-and-networking.md)

---

## 🧭 1. AWS Cloud Decision Matrix

| Layer / Resource | Terraform Resource | Security / Architectural Rule |
| :--- | :--- | :--- |
| **Compute Instance** | `aws_instance` | IMDSv2 enforced (`http_tokens = "required"`). Manage via SSM Session Manager. |
| **Container Cluster** | `aws_ecs_service` | Run on Fargate with non-root task execution roles. |
| **Relational Database** | `aws_db_instance` | Deploy Multi-AZ in private subnets with `storage_encrypted = true`. |
| **Object Storage** | `aws_s3_bucket` | Block public access completely; restrict access to CloudFront via OAC. |
| **Identity & Access** | `aws_iam_role` | Attach strict IAM policies with explicit resource ARNs instead of `*`. |
| **Network Boundary** | `aws_vpc` | Separate public, private app, and isolated database subnet groups. |

---

## 🛠️ 2. Production Terraform HCL Pattern

```hcl
# AWS EC2 Instance with IMDSv2 Hardening
resource "aws_instance" "app_server" {
  ami                  = data.aws_ami.ubuntu_noble.id
  instance_type        = "t4g.medium"
  subnet_id            = module.vpc.private_subnets[0]
  iam_instance_profile = aws_iam_instance_profile.ssm_profile.name

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Enforce IMDSv2
    http_put_response_hop_limit = 1
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Environment = "production"
    Name        = "saas-app-server"
  }
}
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Public SSH Port 22 (0.0.0.0/0)**: Opening SSH directly to the internet instead of using AWS SSM Session Manager.
- ❌ **IMDSv1 Optional Token Access**: Setting `http_tokens = "optional"` permitting SSRF metadata credential theft.
- ❌ **Public Database Subnets**: Provisioning RDS database instances in public subnets with `publicly_accessible = true`.
- ❌ **Wildcard IAM Policies**: Assigning `Action = "*"` or `Resource = "*"` to application service roles.

---

## 🔍 Verification & Quality Assurance

- **Terraform Validation**: Run `terraform validate` asserting syntactically valid infrastructure declarations.
- **Security Audit**: Run `tfsec .` or `checkov` verifying zero high-severity security misconfigurations.
