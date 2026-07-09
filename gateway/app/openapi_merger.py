import httpx
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

SERVICES = {
    "identity": "http://identity-service:3001/openapi.json",
}

def setup_openapi_merger(app: FastAPI):
    def custom_openapi():
        # Return cached schema if it has already been generated
        if app.openapi_schema:
            return app.openapi_schema

        # 1. Start with the gateway's own local routes schema (like /health)
        openapi_schema = get_openapi(
            title="AD. Publish API Gateway",
            version="1.0.0",
            routes=app.routes,
        )

        if "components" not in openapi_schema:
            openapi_schema["components"] = {}
        if "schemas" not in openapi_schema["components"]:
            openapi_schema["components"]["schemas"] = {}

        # 2. Fetch and merge each downstream microservice's schema
        with httpx.Client() as client:
            for service_name, openapi_url in SERVICES.items():
                try:
                    resp = client.get(openapi_url, timeout=5.0)
                    if resp.status_code == 200:
                        service_schema = resp.json()
                        
                        # Merge components (Pydantic models)
                        service_components = service_schema.get("components", {}).get("schemas", {})
                        openapi_schema["components"]["schemas"].update(service_components)

                        # Merge paths
                        for path, path_item in service_schema.get("paths", {}).items():
                            for method, operation in path_item.items():
                                original_tags = operation.get("tags", [])
                                # Group under the service name in Swagger
                                operation["tags"] = [f"{service_name}: {tag}" for tag in original_tags] or [service_name]
                            
                            # Overwrite or add path (giving full models visibility to gateway paths)
                            openapi_schema["paths"][path] = path_item
                except httpx.RequestError:
                    pass

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi
