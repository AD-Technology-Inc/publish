# Skill: .agent/cloud-devops/aws/security-and-iam/iam-roles-and-policies.md

## 📌 Core Philosophy & Constraints
- **Least Privilege Access**: Policies MUST define exact actions (`s3:GetObject`) and exact target ARNs (`arn:aws:s3:::bucket/*`).
- **Service Roles**: Compute resources (EC2, ECS, Lambda) MUST use assumed service execution roles.
- **Zero Static Credentials**: Never create static IAM user access keys (`AWS_ACCESS_KEY_ID`); use OIDC or IAM Roles.

## ⚡ Production Boilerplate / Standard Pattern

```hcl
# Least-Privilege IAM Policy for S3 Access
data "aws_iam_policy_document" "s3_read_only" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.assets.arn,
      "${aws_s3_bucket.assets.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "s3_read_policy" {
  name        = "S3ReadOnlyAccessPolicy"
  description = "Scoped read-only access to assets bucket"
  policy      = data.aws_iam_policy_document.s3_read_only.json
}

resource "aws_iam_role" "app_role" {
  name = "AppServiceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_read_policy.arn
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Wildcard Policies**: Writing `"Action": "*"` and `"Resource": "*"` in IAM policy statements.
- ❌ **Static Access Keys**: Generating long-lived IAM access keys for microservices or CI runner pipelines.
- ❌ **Attaching AdministratorAccess**: Assigning full admin privileges to application runtime roles.

## 🔍 Verification & Testing
- **IAM Policy Simulator**: `aws iam simulate-principal-policy --policy-source-arn <arn> --action-names s3:PutObject` verifying ungranted actions are denied.
