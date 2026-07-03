up:
	docker compose -f infrastructure/docker-compose.yaml up -d

build:
	docker compose -f infrastructure/docker-compose.yaml build

down:
	docker compose -f infrastructure/docker-compose.yaml down

logs:
	docker compose -f infrastructure/docker-compose.yaml logs -f

restart:
	make down && make up

rebuild:
	make down && make build && make up

ps:
	docker compose -f infrastructure/docker-compose.yaml ps

# ===========================================================================
# Database Migrations (Alembic)
# ===========================================================================
service ?= identity-service
msg ?= auto_migration

db-revision:
	docker compose -f infrastructure/docker-compose.yaml exec $(service) uv run alembic revision --autogenerate -m "$(msg)"

db-migrate:
	docker compose -f infrastructure/docker-compose.yaml exec $(service) uv run alembic upgrade head

db-current:
	docker compose -f infrastructure/docker-compose.yaml exec $(service) uv run alembic current