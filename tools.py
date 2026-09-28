import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

tavily_client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def search_web(query: str):
    """Search the web and return relevant sources."""

    response = tavily_client.search(
        query=query,
        search_depth="basic",
        max_results=5
    )

    results = []

    for result in response["results"]:
        results.append({
            "title": result.get("title"),
            "url": result.get("url"),
            "content": result.get("content")
        })

    return results