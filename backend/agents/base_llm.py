"""
Shared LLM factory — uses DO Gradient in production, Anthropic as local fallback.
"""
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import settings


def get_llm(temperature: float = 0):
    if settings.do_inference_key:
        return ChatOpenAI(
            model=settings.do_model,
            base_url=settings.do_inference_base_url,
            api_key=settings.do_inference_key,
            temperature=temperature,
            max_tokens=1000,
        )
    else:
        return ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=temperature,
        )
