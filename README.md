# Tool-Using Research Agent

A tool-using AI research agent that searches the web for relevant information and uses an LLM to synthesize a grounded answer with source citations.

The agent is built using **LangGraph**, **Tavily**, and **Groq**.

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
* python-dotenv

## Project Structure

```text
ai-research-agent/
│
├── agent.py
├── main.py
├── tools.py
├── tests.py
├── requirements.txt
├── .gitignore
└── README.md
```

### File Description

**agent.py**
Defines the research state, LangGraph workflow, web research node, and answer generation node.

**tools.py**
Contains the Tavily web search tool.

**main.py**
Runs the research agent from the command line and accepts the user's research question.

**tests.py**
Runs predefined research questions to check whether the agent successfully produces answers with sources.

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

If PowerShell activation is restricted, the project can also be run using the Python executable inside the virtual environment.

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

The `.gitignore` file already excludes `.env`.

## Running the Agent

Run:

```bash
python main.py
```

Enter a research question when prompted.

Example:

```text
Enter your research question: What are the recent developments in AI based PCB inspection?
```

The agent will search the web, analyze the retrieved sources, and display a research answer with citations and source URLs.

## Running the Tests

To run the predefined evaluation questions:

```bash
python tests.py
```

The test script checks whether the agent successfully generates an answer containing a `Sources` section.

## Example Workflow

```text
Question
   ↓
Tavily Search
   ↓
5 Web Sources
   ↓
Source Context
   ↓
Groq LLM
   ↓
Research Answer
   ↓
Citations + Source URLs
```

## Project Purpose

This project demonstrates a basic tool-using AI agent workflow where an LLM is connected to an external web-search tool through a LangGraph-based workflow.
