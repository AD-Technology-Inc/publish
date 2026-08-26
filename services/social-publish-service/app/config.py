import os

from pydantic import BaseModel


class Settings(BaseModel):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://social_publish_user:social_publish_pass@social-publish-db:5432/social_publish_db",
    )
    redis_host: str = os.getenv("REDIS_HOST", "redis")
    redis_port: int = int(os.getenv("REDIS_PORT", 6379))

    def __init__(self, **values):
        super().__init__(**values)
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace(
                "postgresql://", "postgresql+asyncpg://", 1
            )


settings = Settings()
