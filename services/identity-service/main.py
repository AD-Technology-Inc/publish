from fastapi import FastAPI, Request, Response
from schemas import UserCreate, UserResponse

# TODO: setup alembic local migration
# TODO: setup authentication

app = FastAPI(title="Identity Service")

@app.get("/users", response_model=list[UserResponse])
def get_users():
    return [{"id": 1, "name": "Alice"}]

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    return {"id": user_id, "name": "Some User"}

@app.post("/users")
def create_user(user: UserCreate):
    return {"status": "enqueued", "job_id": "123"}

@app.get("/health")
def health():
    return {"status": "ok"}