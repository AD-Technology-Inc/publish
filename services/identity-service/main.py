import time
import uuid
import structlog

from fastapi import FastAPI, Request, Response
from redis import Redis
from shared.queue import RedisQueue

from schemas import UserCreate, UserResponse

from shared.telemetry import setup_logging, init_telemetry

"""
pip install fastapi sqlalchemy alembic asyncpg uvicorn
alembic revision --autogenerate -m "create users table"
alembic upgrade head

async with session.begin():
    alice.balance -= 1000
    bob.balance += 1000
    # actions...

"""


# Manual Initialization
SERVICE_NAME = "identity-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)

app = FastAPI(title="Identity Service")



redis_client = Redis(host="redis", port=6379, db=0) # TODO: add decode
queue = RedisQueue(redis_client, stream_name="jobs:identity")

@app.get("/users", response_model=list[UserResponse])
def get_users():
    logger.info("Fetching all users")
    return [{"id": 1, "name": "Alice"}]

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    logger.info("Fetching user", user_id=user_id)
    return {"id": user_id, "name": "Some User"}

@app.post("/users")
def create_user(user: UserCreate):
    idem_key = str(uuid.uuid4())
    logger.info("Enqueuing user creation", idempotency_key=idem_key)



    job_id = queue.enqueue({
        "type": "create_user",
        "user": user.model_dump(),
        "idempotency_key": idem_key
    })
    return {"status": "enqueued", "job_id": job_id}

@app.get("/health")
def health():
    return {"status": "ok"}