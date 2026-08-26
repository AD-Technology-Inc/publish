from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.users.models.EmailVerification import EmailVerification
from app.users.models.User import User


@pytest.mark.asyncio
async def test_verify_email_invalid_token(client: AsyncClient):
    response = await client.get("/auth/verify-email?token=invalid_code_999")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid or expired verification code."


@pytest.mark.asyncio
async def test_verify_email_success(client: AsyncClient, db_session: AsyncSession):
    # Mock randbelow to return predictable verification code 123456
    with patch("secrets.randbelow", return_value=123456):
        create_res = await client.post(
            "/users",
            json={
                "first_name": "Charlie",
                "last_name": "Brown",
                "email": "charlie@example.com",
                "password": "Password123!",
                "password_confirmation": "Password123!",
            },
        )
        assert create_res.status_code == 200
        user_id = create_res.json()["id"]

    # Verify user is initially unverified in database
    result = await db_session.execute(
        select(EmailVerification).where(EmailVerification.user_id == user_id)
    )
    verification = result.scalar_one()
    assert verification is not None

    user_result = await db_session.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalar_one()
    assert user.email_verified_at is None

    # Call verify email endpoint with predictable code
    verify_res = await client.get("/auth/verify-email?token=123456")
    assert verify_res.status_code == 200
    assert verify_res.json()["message"] == "Email verified successfully."

    # Expire test session identity map so fresh data is read from DB
    db_session.expire_all()

    # Check that user is now marked verified in DB
    user_result_after = await db_session.execute(
        select(User).where(User.id == user_id)
    )
    user_after = user_result_after.scalar_one()
    assert user_after.email_verified_at is not None

    # Re-using the same token should fail
    verify_res_again = await client.get("/auth/verify-email?token=123456")
    assert verify_res_again.status_code == 400
    assert verify_res_again.json()["detail"] == "Invalid or expired verification code."
