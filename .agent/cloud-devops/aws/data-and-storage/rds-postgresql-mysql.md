# Skill: .agent/cloud-devops/aws/data-and-storage/rds-postgresql-mysql.md

## 📌 Core Philosophy & Constraints
- **Multi-AZ Provisioning**: Enable `multi_az = true` in production for automatic regional failover.
- **Storage Auto-Scaling**: Configure `max_allocated_storage` to allow storage expansion without downtime.
- **Private Subnet Placement**: Database instances MUST reside in private DB subnets (`publicly_accessible = false`).

## ⚡ Production Boilerplate / Standard Pattern

```hcl
resource "aws_db_subnet_group" "rds" {
  name       = "rds-private-subnet-group"
  subnet_ids = [aws_subnet.private_db_1.id, aws_subnet.private_db_2.id]
}

resource "aws_db_instance" "postgres" {
  identifier            = "saas-postgres-prod"
  engine                = "postgres"
  engine_version        = "18.0"
  instance_class        = "db.r6g.large"
  allocated_storage     = 50
  max_allocated_storage = 500 # Storage auto-scaling threshold

  storage_encrypted   = true
  multi_az            = true
  publicly_accessible = false
  db_subnet_group_name = aws_db_subnet_group.rds.name

  backup_retention_period   = 14
  backup_window            = "03:00-04:00"
  maintenance_window       = "Sun:04:30-Sun:05:30"
  deletion_protection      = true
  skip_final_snapshot      = false
  final_snapshot_identifier = "saas-postgres-prod-final-snap"
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Public DB Instances**: Setting `publicly_accessible = true` exposing PostgreSQL/MySQL directly to public internet.
- ❌ **Disabled Storage Auto-scaling**: Omitting `max_allocated_storage` causing database crashes when disk space fills up.
- ❌ **Single-AZ in Production**: Setting `multi_az = false` creating single points of failure.

## 🔍 Verification & Testing
- **RDS Description Check**: `aws rds describe-db-instances` asserting `PubliclyAccessible: false` and `MultiAZ: true`.
