# Skill: .agent/cloud-devops/aws/data-and-storage/s3-and-cloudfront.md

## 📌 Core Philosophy & Constraints
- **Origin Access Control (OAC)**: Buckets serving web assets MUST be restricted exclusively to CloudFront via OAC.
- **KMS Server-Side Encryption**: Enforce SSE-KMS or SSE-S3 encryption on all bucket objects.
- **CORS Policies**: Explicitly whitelist allowed web origins on S3 CORS rules.

## ⚡ Production Boilerplate / Standard Pattern

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "saas-app-assets-prod"
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.assets.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://app.yourdomain.com"]
    max_age_seconds = 3600
  }
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Public Bucket Policy**: Granting `s3:GetObject` to `Principal: "*"` without CloudFront OAC constraints.
- ❌ **Wildcard CORS**: Setting `AllowedOrigins = ["*"]` for authenticated client uploads.
- ❌ **Unencrypted Bucket Storage**: Storing static or media assets without server-side encryption.

## 🔍 Verification & Testing
- **S3 Public Access Check**: `aws s3api get-public-access-block --bucket saas-app-assets-prod` verifying all 4 flags are `true`.
