import os
import re
import logging
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure environment variables are loaded
load_dotenv()

# Import the existing research agent without modifying it
from agent import research_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("research_agent_server")

app = FastAPI(
    title="Tool-Using Research Agent API",
    description="Backend API exposing the LangGraph research agent to the web frontend",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The research question to investigate")


class SourceItem(BaseModel):
    id: int
    title: str
    url: str
    domain: str
    content: Optional[str] = None


class ResearchResponse(BaseModel):
    question: str
    answer: str
    raw_answer: Optional[str] = None
    sources: List[SourceItem] = []


def extract_domain(url: str) -> str:
    """Extract clean domain from URL."""
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc or url
    except Exception:
        return ""


def clean_answer_text(raw_text: str) -> str:
    """
    Remove trailing raw 'Sources' section from the answer text
    to avoid ugly duplication when structured source cards are displayed.
    """
    if not raw_text:
        return ""

    # Patterns where LLM appends Sources list at the end
    cleaned = re.split(
        r'(?:\r?\n\s*---\s*\r?\n\s*)?(?:\*{0,2}#{0,3}\s*Sources\*{0,2}\s*:?)\s*\r?\n',
        raw_text,
        maxsplit=1,
        flags=re.IGNORECASE
    )

    if len(cleaned) > 1:
        return cleaned[0].strip()
    return raw_text.strip()


@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok", "service": "research_agent_api"}


@app.post("/api/research", response_model=ResearchResponse)
async def conduct_research(request: ResearchRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Research question cannot be empty.")

    logger.info("Received research question: %s", question)

    try:
        # Invoke the existing LangGraph research agent
        result = research_agent.invoke({
            "question": question,
            "search_results": [],
            "answer": ""
        })
    except Exception as e:
        logger.error("Error executing research_agent: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="The research answer could not be generated. Please try again."
        )

    raw_answer = result.get("answer", "")
    search_results = result.get("search_results", [])

    # Check for agent-level reported failures
    if raw_answer.startswith("Web search failed:"):
        logger.warning("Web search failed reported by agent: %s", raw_answer)
        raise HTTPException(
            status_code=502,
            detail="We couldn't retrieve web sources for this question. Please try again."
        )

    if raw_answer.startswith("Answer generation failed:"):
        logger.warning("Answer generation failed reported by agent: %s", raw_answer)
        raise HTTPException(
            status_code=502,
            detail="The research answer could not be generated. Please try again."
        )

    # Format structured sources from Tavily results
    sources: List[SourceItem] = []
    for idx, item in enumerate(search_results, start=1):
        url = item.get("url") or ""
        title = item.get("title") or f"Source {idx}"
        domain = extract_domain(url)
        content = item.get("content") or ""

        sources.append(SourceItem(
            id=idx,
            title=title,
            url=url,
            domain=domain,
            content=content[:300] if content else None
        ))

    # Strip duplicate trailing sources text for clean editorial display
    cleaned_answer = clean_answer_text(raw_answer)

    return ResearchResponse(
        question=question,
        answer=cleaned_answer,
        raw_answer=raw_answer,
        sources=sources
    )


# Serve frontend static files if directory exists
FRONTEND_DIR = Path(__file__).resolve().parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
