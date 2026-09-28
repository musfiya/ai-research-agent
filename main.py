import sys
from agent import research_agent

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def main():

    print("=" * 70)
    print("TOOL-USING RESEARCH AGENT")
    print("=" * 70)

    question = input("\nEnter your research question: ").strip()

    if not question:
        print("\nPlease enter a research question.")
        return

    print("\n🔎 Searching the web...")
    print("🤖 Analyzing the sources...\n")

    result = research_agent.invoke({
        "question": question,
        "search_results": [],
        "answer": ""
    })

    print("=" * 70)
    print("RESEARCH ANSWER")
    print("=" * 70)

    print(result["answer"])

    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()