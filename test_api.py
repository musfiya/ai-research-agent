import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

TEST_QUESTIONS = [
    "What are the recent developments in AI based PCB inspection?",
    "How is artificial intelligence being used in semiconductor manufacturing?",
    "What are the advantages of edge AI in industrial inspection?"
]


def test_api():
    print("=" * 70)
    print("API INTEGRATION EVALUATION")
    print("=" * 70)

    # Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    print("Health check: PASS")

    # Static assets
    assert client.get("/").status_code == 200
    assert client.get("/style.css").status_code == 200
    assert client.get("/script.js").status_code == 200
    print("Static assets delivery: PASS")

    passed = 0

    for i, q in enumerate(TEST_QUESTIONS, start=1):
        print(f"\nTEST {i}: {q}")
        print("-" * 70)

        response = client.post("/api/research", json={"question": q})
        if response.status_code != 200:
            print(f"Status: FAIL (HTTP {response.status_code})")
            print("Response:", response.text)
            continue

        data = response.json()
        answer = data.get("answer", "")
        sources = data.get("sources", [])

        print(f"Answer length: {len(answer)} chars")
        print(f"Sources retrieved: {len(sources)}")

        for s in sources:
            print(f"  - Source {s['id']}: {s['title'][:50]}... ({s['domain']}) -> {s['url']}")

        if answer and len(sources) > 0:
            print("Status: PASS")
            passed += 1
        else:
            print("Status: FAIL (Missing answer or sources)")

    print("\n" + "=" * 70)
    print(f"RESULT: {passed}/{len(TEST_QUESTIONS)} API tests passed")
    print("=" * 70)


if __name__ == "__main__":
    test_api()
