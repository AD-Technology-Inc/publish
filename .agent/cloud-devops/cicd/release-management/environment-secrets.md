# Skill: .agent/cloud-devops/cicd/release-management/environment-secrets.md

## 📌 Core Philosophy & Constraints
- **GitHub Environment Secrets**: Isolate staging and production secrets using GitHub Repository Environments.
- **Log Masking**: Mask all sensitive environment variables in CI/CD log outputs using `::add-mask::`.
- **Vault/Secrets Manager Integration**: Fetch secrets dynamically from AWS Secrets Manager or HashiCorp Vault during deployment.

## ⚡ Production Boilerplate / Standard Pattern

```yaml
# Fetching Secrets Dynamically in GitHub Actions
steps:
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/GitHubDeployRole
      aws-region: us-east-1

  - name: Fetch Secrets from AWS Secrets Manager
    uses: aws-actions/aws-secretsmanager-get-secrets@v2
    with:
      secret-ids: |
        PROD_DB_SECRET, saas/production/database
      parse-json-secrets: true

  - name: Mask Sensitive Input in Log Output
    run: |
      SECRET_VAL="${{ env.PROD_DB_SECRET_PASSWORD }}"
      echo "::add-mask::$SECRET_VAL"
      echo "Deploying with database connection configured."
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Committed Plain-text `.env` Files**: Checking in `.env.production` or credential secret files to Git repositories.
- ❌ **Printing Secrets to CI Logs**: Echoing unmasked environment variable strings in workflow `run:` steps.
- ❌ **Single Shared Secret Environment**: Using global repository secrets for both development and production environments.

## 🔍 Verification & Testing
- **Log Masking Verification**: Inspect GitHub Actions job run logs verifying secret values display as `***`.
