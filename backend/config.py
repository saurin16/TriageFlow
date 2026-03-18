from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # DigitalOcean Gradient Inference (primary)
    do_inference_key: str = ""
    do_inference_base_url: str = "https://inference.do-ai.run/v1"
    do_model: str = "claude-sonnet-4-6"
    do_knowledge_base_id: str = ""

    # Anthropic (local dev fallback)
    anthropic_api_key: str = ""
    database_url: str = "postgresql://triageflow:triageflow@localhost:5432/triageflow"
    langsmith_api_key: str = ""
    langsmith_project: str = "triageflow"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
