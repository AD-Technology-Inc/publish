from fastapi import  HTTPException
import httpx

async def _forward(method: str, url: str, **kwargs):
    """Forward a request to an internal service and surface errors."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(method, url, timeout=10.0, **kwargs)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Upstream unavailable: {e}")