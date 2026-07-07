from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://identity_user:identity_pass@identity-db:5432/identity_db"
    secret_key: str = "supersecretkey"

settings = Settings()
