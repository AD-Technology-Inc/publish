# Skill: .agent/backend/fastapi/async-events-jobs/async-websockets.md

## 📌 Core Philosophy & Constraints
- **ConnectionManager Class**: Encapsulate active WebSocket connections and broadcasting logic inside a thread-safe ConnectionManager.
- **Async Iteration**: Handle incoming WebSocket messages asynchronously using `await websocket.receive_text()`.
- **Disconnect Cleanup**: Always remove closed connections from active connections set inside `try/finally` or `WebSocketDisconnect`.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()
router = APIRouter()

@router.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Broadcast: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Dangling Connections**: Failing to call `manager.disconnect()` when client drops connection.
- ❌ **Blocking Socket Loop**: Calling synchronous `time.sleep()` inside WebSocket connection event loops.
- ❌ **Unauthenticated WebSockets**: Accepting WebSocket connections without token parameter verification.

## 🔍 Verification & Testing
- **TestClient WebSocket Assertion**: Test connection and broadcast using `client.websocket_connect("/ws/notifications")` in Pytest.
