# Skill: .agent/cloud-devops/aws/infrastructure-and-compute/ecs-docker-deployments.md

## 📌 Core Philosophy & Constraints
- **Fargate Launch Type**: Run container tasks serverless via AWS Fargate with explicit CPU/Memory definitions.
- **Service Auto-Scaling**: Configure target-tracking auto-scaling policies based on CPU and Memory metrics.
- **Role Separation**: Task Execution Role handles image pulling/logging; Task Role handles application AWS access.

## ⚡ Production Boilerplate / Standard Pattern

```hcl
resource "aws_ecs_task_definition" "app" {
  family                   = "saas-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name      = "app-container"
    image     = "${aws_ecr_repository.app.repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 8000 }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/saas-app"
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Shared Execution & Task Roles**: Combining ECR pull permissions and application database secrets into a single IAM role.
- ❌ **Hardcoded Container IPs**: Accessing tasks directly by IP instead of registering with ALB target groups.
- ❌ **Uncapped Scaling**: Leaving max capacity unbounded leading to unexpected cloud billing charges.

## 🔍 Verification & Testing
- **Deployment Status**: `aws ecs describe-services --cluster main --services app` confirming `PRIMARY` deployment status `COMPLETED`.
