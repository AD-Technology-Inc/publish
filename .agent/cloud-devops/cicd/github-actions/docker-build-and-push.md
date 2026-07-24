# Skill: .agent/cloud-devops/cicd/github-actions/docker-build-and-push.md

## 📌 Core Philosophy & Constraints
- **Docker Buildx & Layer Cache**: Use `docker/setup-buildx-action` with GitHub Actions cache backend (`type=gha`).
- **Semantic Tagging**: Tag container images with Git commit SHA and release tag (`type=sha`, `type=semver`).
- **OIDC ECR Authentication**: Authenticate to AWS ECR using OpenID Connect (OIDC) without long-lived access keys.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
name: Docker Build & Push Pipeline

on:
  push:
    branches: [main, staging, production]
    tags: ['v*.*.*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsECRRole
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Docker Metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ steps.login-ecr.outputs.registry }}/saas-backend
          tags: |
            type=sha,format=long
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Static AWS Credentials**: Using static `AWS_ACCESS_KEY_ID` secrets instead of IAM OIDC roles.
- ❌ **Disabling Layer Caching**: Rebuilding raw Docker image layers from scratch on every push without `type=gha`.
- ❌ **Tagging Everything as `latest`**: Pushing images tagged only as `latest` without immutable SHA or semver tags.

## 🔍 Verification & Testing
- **ECR Tag Verification**: Query `aws ecr describe-images --repository-name saas-backend` verifying commit SHA tag pushed successfully.
