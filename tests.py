from agent import research_agent


TEST_QUESTIONS = [
    "What are the recent developments in AI based PCB inspection?",
    "How is artificial intelligence being used in semiconductor manufacturing?",
    "What are the advantages of edge AI in industrial inspection?",
    "How does computer vision help detect manufacturing defects?",
    "What are the challenges of deploying AI inspection systems in factories?"
]


def run_tests():

    print("=" * 70)
    print("RESEARCH AGENT EVALUATION")
    print("=" * 70)

    passed = 0

    for number, question in enumerate(TEST_QUESTIONS, start=1):

        print(f"\nTEST {number}")
        print("-" * 70)
        print(f"Question: {question}")

        try:

            result = research_agent.invoke({
                "question": question,
                "search_results": [],
                "answer": ""
            })

            answer = result.get("answer", "")

            if answer and "Sources" in answer:

                print("Status: PASS")
                passed += 1

            else:

                print("Status: FAIL")

        except Exception as e:

            print("Status: FAIL")
            print(f"Error: {e}")

    print("\n" + "=" * 70)
    print(f"RESULT: {passed}/{len(TEST_QUESTIONS)} tests passed")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()