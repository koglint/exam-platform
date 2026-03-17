def calculate_result(questions: list[dict], responses: list[dict], answer_lookup: dict[str, int]) -> dict:
    response_lookup = {
        response["questionId"]: response.get("selectedOption")
        for response in responses
    }

    question_results = []
    score = 0

    for question in questions:
        selected = response_lookup.get(question["id"])
        correct = answer_lookup.get(question["id"])
        is_correct = selected == correct
        question_results.append(
            {
                "questionId": question["id"],
                "selectedOption": selected,
                "isCorrect": is_correct,
                "topic": question.get("topic", "Uncategorised"),
            }
        )
        score += 1 if is_correct else 0

    return {
        "score": score,
        "total": len(questions),
        "question_results": question_results,
    }
