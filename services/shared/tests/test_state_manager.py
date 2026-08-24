import fakeredis
from shared.utils import StateManager


def test_state_manager_redis_fallback():
    r = fakeredis.FakeRedis()
    # Without DATABASE_URL, falls back gracefully to Redis checkpoints
    sm = StateManager(r, ttl_seconds=300)

    job_id = "job-abc-123"

    assert sm.get_last_step(job_id) is None

    sm.save_step(job_id, "started")
    assert sm.get_last_step(job_id) == "started"

    sm.save_step(job_id, "token_retrieved")
    assert sm.get_last_step(job_id) == "token_retrieved"

    sm.save_step(job_id, "completed")
    assert sm.get_last_step(job_id) == "completed"
