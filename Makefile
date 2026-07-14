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