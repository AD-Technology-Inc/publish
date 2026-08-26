COMPOSE := docker compose -f infrastructure/docker-compose.yaml

service ?=
cmd ?=

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

restart:
	$(MAKE) down
	$(MAKE) up

rebuild:
	$(MAKE) down
	$(MAKE) build
	$(MAKE) up

ps:
	$(COMPOSE) ps

exec:
	$(COMPOSE) exec $(service) $(cmd)

run:
	$(COMPOSE) run --rm $(service) $(cmd)

test: test-identity test-social-account test-social-post test-social-publish

test-identity:
	docker exec infrastructure-identity-service-1 uv run pytest -v

test-social-account:
	docker exec infrastructure-social-account-service-1 uv run pytest -v

test-social-post:
	docker exec infrastructure-social-post-service-1 uv run pytest -v

test-social-publish:
	docker exec infrastructure-social-publish-service-1 uv run pytest -v