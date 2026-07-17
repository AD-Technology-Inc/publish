from datetime import UTC, datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    code_hash: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    @classmethod
    def create_for_user(
        cls, user_id: int, app_key: str
    ) -> tuple["EmailVerification", str]:
        import hashlib
        import hmac
        import secrets
        from datetime import timedelta

        code: str = f"{secrets.randbelow(exclusive_upper_bound=1_000_000):06d}"
        code_hash: str = hmac.new(
            key=app_key.encode(),
            msg=code.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()

        verification: EmailVerification = cls(
            user_id=user_id,
            code_hash=code_hash,
            expires_at=datetime.now(tz=UTC) + timedelta(minutes=15),
        )
        return verification, code

    def verify_code(self, code: str, app_key: str) -> bool:
        import hashlib
        import hmac

        candidate_hash: str = hmac.new(
            key=app_key.encode(),
            msg=code.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(self.code_hash, candidate_hash)

    @property
    def is_expired(self) -> bool:
        from datetime import datetime

        return datetime.now(tz=UTC) > self.expires_at
