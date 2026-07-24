# Skill: .agent/cloud-devops/cicd/github-actions/deployment-workflows.md

## 📌 Core Philosophy & Constraints
- **Branch-Specific Deployment Jobs**: Target `staging` branch for staging deployments and `production` branch for production releases.
- **ECS Task Definition Updating**: Render new container image tags in ECS Task Definitions via `aws-actions/amazon-ecs-render-task-definition`.
- **Environment Protection Rules**: Require environment approvals in GitHub repository settings for production deployments.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
name: Deployment Workflow

on:
  push:
    branches: [staging, production]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging ECS Cluster
        run: echo "Deploying image tag ${{ github.sha }} to Staging ECS..."

  deploy-production:
    if: github.ref == 'refs/heads/production'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsDeployRole
          aws-region: us-east-1

      - name: Render Amazon ECS Task Definition
        id: render-task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: .aws/task-definition.json
          container-name: api-server
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/saas-backend:${{ github.sha }}

      - name: Deploy Amazon ECS Task
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.render-task-def.outputs.task-definition }}
          service: saas-backend-prod
          cluster: saas-prod-cluster
          wait-for-service-stability: true
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unconditional Deployments**: Deploying to production on PR creation or arbitrary branch commits.
- ❌ **Missing Service Stability Checks**: Disabling `wait-for-service-stability: true` hiding failed task rollbacks.
- ❌ **Shared Environment Secrets**: Reusing staging API secrets in production deployment jobs.

## 🔍 Verification & Testing
- **Deployment Status Check**: Verify GitHub Actions workflow run succeeds and ECS service stability check passes.
