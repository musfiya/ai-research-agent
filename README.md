# Tool-Using Research Agent

A tool-using AI research agent that searches the web for relevant information and uses an LLM to synthesize a grounded answer with source citations.

The agent is built using **LangGraph**, **Tavily**, and **Groq**, featuring both an interactive command-line interface and a modern, responsive web workspace.

## How It Works

The workflow is:

```text
User Question
      ↓
LangGraph Research Agent
      ↓
Tavily Web Search
      ↓
Web Sources
      ↓
Groq LLM
      ↓
Grounded Answer + Sources
```

The agent:

1. Accepts a research question from the user.
2. Searches the web using Tavily.
3. Collects relevant web sources.
4. Passes the retrieved information to the Groq LLM.
5. Generates an answer based only on the retrieved sources.
6. Includes source citations and source URLs in the response.

## Technologies Used

* Python
* LangGraph
* LangChain
* Tavily
* Groq
* FastAPI & Uvicorn
* HTML5 / CSS3 / Vanilla JavaScript
* python-dotenv

## Project Structure

```text
research_agent/
│
├── agent.py          # Core LangGraph research agent workflow & nodes
├── main.py           # Command-line interface for the research agent
├── tools.py          # Tavily search tool integration
├── server.py         # FastAPI backend exposing agent to the web frontend
├── tests.py          # Original evaluation test suite (5 questions)
├── test_api.py       # API integration test suite
├── requirements.txt  # Python package dependencies
├── .gitignore        # Git ignore rules (protects .env and virtualenv)
├── README.md         # Documentation
│
└── frontend/         # Web interface (Editorial Research Lab theme)
    ├── index.html    # Semantic HTML5 research workspace structure
    ├── style.css     # Editorial styling (Warm ivory, charcoal, terracotta, olive)
    └── script.js     # Client API communication, live states & citations
```

### File Description

**agent.py**
Defines the research state, LangGraph workflow, web research node, and answer generation node.

**tools.py**
Contains the Tavily web search tool.

**main.py**
Runs the research agent from the command line and accepts the user's research question.

**server.py**
Lightweight FastAPI server that exposes `POST /api/research` and serves the web frontend. Calls `research_agent.invoke()` directly without modifying the core agent logic.

**frontend/**
A distraction-free, modern research workspace styled in an Editorial Research Lab aesthetic (warm ivory `#F6F1E8`, charcoal `#25231F`, terracotta `#C96B4B`, and muted olive `#69735A`). Features real-time search indicators, interactive source citation badges, and verified source cards.

**tests.py**
Runs predefined research questions to check whether the agent successfully produces answers with sources.

**test_api.py**
Evaluates the FastAPI backend and web endpoints against key research topics.

**requirements.txt**
Lists the Python dependencies required by the project.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/musfiya/ai-research-agent.git
cd ai-research-agent
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

On Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

If PowerShell activation is restricted, the project can also be run using the Python executable inside the virtual environment:

```powershell
.\venv\Scripts\python.exe <script_name>.py
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

## API Keys

Create a `.env` file in the project root:

```text
TAVILY_API_KEY=your_tavily_api_key
GROQ_API_KEY=your_groq_api_key
```

Do not commit the `.env` file to GitHub.

The `.gitignore` file already excludes `.env`. API keys are never exposed to the frontend or browser.

## Web Interface

The project includes an Editorial Research Lab web interface designed for focused, grounded research inquiries.

### 1. Start the Backend Server

Run:

```bash
python server.py
```

or with uvicorn:

```bash
uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Open the Frontend

Open your browser and navigate to:

```text
http://127.0.0.1:8000
```

### 3. How the Frontend Connects to the Research Agent

When you submit a research question in the web browser:

1. **Frontend Request**: The browser issues an asynchronous `POST /api/research` request with the user's question payload to the local FastAPI server (`server.py`).
2. **Agent Invocation**: The backend directly invokes the existing LangGraph `research_agent.invoke(...)` workflow without any alterations to the agent's core architecture.
3. **Web Retrieval**: The agent queries Tavily to retrieve up-to-date web sources and domain metadata.
4. **Synthesis**: The retrieved source content is provided to Groq (`openai/gpt-oss-20b`) to synthesize an answer with citations.
5. **Display**: The backend returns the synthesized answer and structured source metadata to the browser.
6. **Editorial Presentation**: The browser renders the brief with interactive citation badges (`[Source 1]`) and distinct source cards linking directly to the verified URLs.

## Running the Agent (CLI)

The original command-line interface remains fully functional.

Run:

```bash
python main.py
```

Enter a research question when prompted:

```text
Enter your research question: What are the recent developments in AI based PCB inspection?
```

The agent will search the web, analyze the retrieved sources, and display a research answer with citations and source URLs.

## Running the Tests

### 1. Original Agent Evaluation Suite

To run the predefined evaluation questions:

```bash
python tests.py
```

The test script checks whether the agent successfully generates an answer containing a `Sources` section across 5 standard evaluation questions.

### 2. API Integration Test Suite

To evaluate the web API endpoints and frontend integration:

```bash
python test_api.py
```

## Example Workflow

```text
User Question (Web / CLI)
          ↓
  FastAPI Server (server.py)
          ↓
LangGraph Research Agent (agent.py)
          ↓
   Tavily Search (tools.py)
          ↓
      5 Web Sources
          ↓
     Source Context
          ↓
     Groq LLM
          ↓
  Research Brief + Citations
          ↓
Interactive Web UI / CLI Output
```

## Project Purpose

This project demonstrates a production-ready, tool-using AI agent workflow where an LLM is connected to an external web-search tool through a LangGraph-based workflow, accessible via both CLI and a web interface.
