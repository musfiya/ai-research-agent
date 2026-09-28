import os
from typing import TypedDict

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

from tools import search_web


load_dotenv()


# ============================================================
# 1. STATE
# ============================================================

class ResearchState(TypedDict):
    question: str
    search_results: list
    answer: str


# ============================================================
# 2. LLM
# ============================================================

llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0
)


# ============================================================
# 3. RESEARCH NODE
# ============================================================

def research_node(state: ResearchState):
    """
    Search the web using Tavily.
    """

    question = state["question"]

    try:
        results = search_web(question)

        return {
            "search_results": results
        }

    except Exception as e:
        return {
            "search_results": [],
            "answer": f"Web search failed: {str(e)}"
        }


# ============================================================
# 4. ANSWER NODE
# ============================================================

def answer_node(state: ResearchState):
    """
    Generate a research answer from the retrieved sources.
    """

    question = state["question"]
    results = state["search_results"]

    if not results:
        return {
            "answer": "I could not retrieve reliable web sources for this question."
        }

    context = ""

    for i, result in enumerate(results, start=1):

        context += f"""
SOURCE {i}

Title:
{result.get("title", "Unknown")}

URL:
{result.get("url", "Unknown")}

Content:
{result.get("content", "No content available")}

--------------------------------------------------
"""

    prompt = f"""
You are a careful web research assistant.

USER QUESTION:
{question}

WEB SOURCES:
{context}

TASK:
Answer the user's question using ONLY information supported
by the provided web sources.

RULES:

1. Do not invent facts.
2. Do not use knowledge that is not supported by the sources.
3. If a claim is supported by a source, cite it using:
   [Source 1], [Source 2], etc.
4. If sources disagree, clearly mention the disagreement.
5. Distinguish established information from claims made by
   companies, blogs, or other sources.
6. Do not present marketing claims as proven facts.
7. Keep the answer clear and reasonably concise.
8. Use bullet points when useful.
9. End with a section called:

Sources

and list the source URLs there.

Write the answer now.
"""

    try:

        response = llm.invoke(prompt)

        return {
            "answer": response.content
        }

    except Exception as e:

        return {
            "answer": f"Answer generation failed: {str(e)}"
        }


# ============================================================
# 5. BUILD LANGGRAPH
# ============================================================

graph = StateGraph(ResearchState)

graph.add_node("research", research_node)
graph.add_node("answer", answer_node)

graph.add_edge(START, "research")
graph.add_edge("research", "answer")
graph.add_edge("answer", END)


# Compile the graph

research_agent = graph.compile()