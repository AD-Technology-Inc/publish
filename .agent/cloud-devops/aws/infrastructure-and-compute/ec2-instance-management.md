# Skill: .agent/cloud-devops/aws/infrastructure-and-compute/ec2-instance-management.md

## 📌 Core Philosophy & Constraints
- **IMDSv2 Enforcement**: Instance Metadata Service v2 MUST be required (`http_tokens = "required"`) to prevent SSRF vulnerabilities.
- **AMI Selection & Sizing**: Use latest Graviton ARM64 architecture AMIs (`t4g`, `c7g`) for cost and compute efficiency.
- **Security Group Scoping**: Inbound SSH access MUST NOT be open to `0.0.0.0/0`; use AWS Systems Manager (SSM) Session Manager.

## ⚡ Production Boilerplate / Standard Pattern

```hcl
# Terraform Launch Template for Graviton EC2
data "aws_ami" "ubuntu_arm64" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-arm64-server-*"]
  }
}

resource "aws_launch_template" "ec2" {
  name_prefix   = "app-ec2-"
  image_id      = data.aws_ami.ubuntu_arm64.id
  instance_type = "t4g.medium"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = true
  }
}
```

```bash
# AWS CLI SSM Session Access (Zero SSH Keys)
aws ssm start-session --target i-0123456789abcdef0
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Public SSH Ports (0.0.0.0/0)**: Opening port 22 directly to the world instead of AWS SSM.
- ❌ **IMDSv1 Permitted**: Leaving `http_tokens = "optional"` allowing IAM credential extraction via SSRF.
- ❌ **Manual EC2 Instantiation**: Provisioning un-managed standalone instances without launch templates.

## 🔍 Verification & Testing
- **IMDSv2 Test**: Execute `curl http://169.254.169.254/latest/meta-data/` without token expecting 401 Unauthorized.
