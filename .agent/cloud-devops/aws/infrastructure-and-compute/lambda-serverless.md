# Skill: .agent/cloud-devops/aws/infrastructure-and-compute/lambda-serverless.md

## 📌 Core Philosophy & Constraints
- **Cold-Start Optimization**: Minimize bundle size, initialize global clients outside handler scope, use Provisioned Concurrency for critical APIs.
- **Container Image Packaging**: Package Lambda functions as Docker ECR images for deterministic dependency setups.
- **Reserved Concurrency Limits**: Cap reserved concurrency to protect backend relational databases.

## ⚡ Production Boilerplate / Standard Pattern

```python
# app/lambda_function.py
import os
import httpx

# Cold-start optimization: Initialize HTTP client & DB pool globally
http_client = httpx.AsyncClient(timeout=5.0)
DB_HOST = os.environ.get("DB_HOST")

async def handler(event: dict, context: dict) -> dict:
    try:
        response = await http_client.get("https://api.external.com/health")
        return {
            "statusCode": 200,
            "body": f"Processed successfully: {response.status_code}"
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"Internal error: {str(e)}"
        }
```

```hcl
# Terraform Provisioned Concurrency
resource "aws_lambda_provisioned_concurrency_config" "app" {
  function_name         = aws_lambda_function.app.function_name
  provisioned_concurrent_executions = 5
  qualifier             = aws_lambda_alias.prod.name
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **In-Handler Client Initialization**: Instantiating DB pools or HTTP clients inside `handler()` on every invocation.
- ❌ **Uncapped Concurrency**: Allowing Lambda to scale to 1,000 instances exhausting RDS connection pools.
- ❌ **Uncompressed Heavy Dependencies**: Including unused test packages in production function zip artifacts.

## 🔍 Verification & Testing
- **Invocation Test**: Execute `aws lambda invoke --function-name my-func response.json` asserting HTTP 200 return status.
