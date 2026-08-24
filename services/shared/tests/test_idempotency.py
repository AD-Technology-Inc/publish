import pytest
import fakeredis
from shared.utils import IdempotencyMiddleware


def test_idempotency_check_and_set():
    r = fakeredis.FakeRedis()
    idem = IdempotencyMiddleware(r, ttl_seconds=60)

    key = "user-publish-req-12345"

    # First attempt acquires lock
    assert idem.check_and_set(key) is True
    assert idem.is_processed(key) is True

    # Subsequent attempt fails (atomic guard)
    assert idem.check_and_set(key) is False

    # Clearing key allows re-acquisition
    idem.clear(key)
    assert idem.is_processed(key) is False
    assert idem.check_and_set(key) is True


def test_idempotency_empty_key_raises():
    r = fakeredis.FakeRedis()
    idem = IdempotencyMiddleware(r)

    with pytest.raises(ValueError):
        idem.check_and_set("")

    with pytest.raises(ValueError):
        idem.check_and_set(None)
