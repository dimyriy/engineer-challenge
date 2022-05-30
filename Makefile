.PHONY: run-backend start-backend stop-backend run-frontend start-frontend stop-frontend start-all stop-all run-all-tests

project_home:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
backend_home:=${project_home}/backend
frontend_home:=${project_home}/frontend
yml_file:=${project_home}/docker-compose.yaml

default: prepare-env add-db-host stop-all tests stop-all

prepare-env:
	cp ${backend_home}/.env.example ${backend_home}/.env

add-db-host:
	echo "127.0.0.1 db" | sudo tee -a /etc/hosts

docker-build-backend:
	cd ${backend_home} && docker-compose build

docker-build-frontend:
	cd ${frontend_home} && docker-compose build

docker-compose-up-backend:
	cd ${backend_home} && docker-compose up -d backend

docker-compose-up-frontend:
	cd ${backend_home} && docker-compose up -d frontend

docker-compose-stop-backend:
	cd ${backend_home} && docker-compose stop backend

docker-compose-stop-frontend:
	cd ${backend_home} && docker-compose stop frontend

yarn-build-frontend:
	cd ${frontend_home} && yarn install && yarn build

yarn-build-backend:
	cd ${backend_home} \
	&& rm -rf node_modules \
	&& yarn install --frozen-lockfile \
	&& yarn prisma generate

yarn-migrate-db:
	cd ${backend_home} \
	&& yarn prisma migrate dev

yarn-run-backend:
	cd ${backend_home} && yarn start

run-unit-tests-backend:
	cd ${backend_home} && yarn unit-tests

run-integration-tests-backend:
	cd ${backend_home} && yarn integration-tests

test-backend: run-unit-tests-backend run-integration-tests-backend

yarn-run-frontend:
	cd ${frontend_home} && yarn start

docker-compose-up:
	cd ${backend_home} && docker-compose up -d

docker-compose-down:
	cd ${backend_home} && docker-compose down

docker-compose-migrate:
	cd ${backend_home} && docker compose exec backend yarn prisma migrate dev

docker-compose-seed:
	cd ${backend_home} && docker compose exec backend yarn prisma db seed

docker-compose-start-database:
	cd ${backend_home} && docker compose up -d db

prepare-backend: prepare-env docker-build-backend docker-compose-up-backend docker-compose-migrate docker-compose-seed docker-compose-stop-backend


tests: prepare-env docker-compose-start-database yarn-build-backend yarn-migrate-db test-backend
run-backend: prepare-backend docker-compose-start-database yarn-build-backend yarn-run-backend
start-backend: prepare-backend docker-compose-start-database docker-compose-up-backend
stop-backend: docker-compose-stop-backend
run-frontend: yarn-build-frontend yarn-run-frontend
start-frontend: docker-compose-up-frontend
stop-frontend: docker-compose-stop-frontend
start-all: prepare-backend docker-compose-up
stop-all: docker-compose-down