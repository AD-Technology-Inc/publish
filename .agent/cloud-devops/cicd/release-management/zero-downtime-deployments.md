# Skill: .agent/cloud-devops/cicd/release-management/zero-downtime-deployments.md

## 📌 Core Philosophy & Constraints
- **Blue/Green & Rolling Updates**: Deploy new container tasks alongside active tasks before draining old connections.
- **Pre-Flight Health Verification**: Require new tasks to pass target group health checks (`/healthz`) before switching traffic.
- **Automatic Rollback Signals**: Immediately halt deployment and revert task definition when target group 5xx error rates spike.

## ⚡ Production Boilerplate / Standard Pattern

```json
{
  "containerDefinitions": [
    {
      "name": "api-server",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/saas-backend:v1.2.0",
      "portMappings": [{ "containerPort": 8000 }],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/healthz || exit 1"],
        "interval": 10,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 15
      }
    }
  ]
}
```

```hcl
# Rolling Update Minimum Healthy Percent
resource "aws_ecs_service" "app" {
  name                               = "saas-backend-prod"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = 4
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **0% Minimum Healthy Percent**: Setting `deployment_minimum_healthy_percent = 0` causing total downtime during task replacement.
- ❌ **Missing `/healthz` Endpoints**: Deploying tasks without health check paths causing ALB to route traffic to un-initialized processes.
- ❌ **In-Place DB Migrations with Breaking Drops**: Dropping DB columns in migrations before code deploying new code dependencies.

## 🔍 Verification & Testing
- **Zero-Downtime Test**: Run continuous `curl` loop during ECS service update asserting 100% of requests return HTTP 200 OK without connection drops.
