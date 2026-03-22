import os

# Mock reference ranges database for Indian population
REFERENCE_RANGES = {
    "glucose": {"population_mean": 100, "population_std": 20, "p5": 70, "p95": 140, "unit": "mg/dL"},
    "hemoglobin": {"population_mean": 14, "population_std": 2, "p5": 12, "p95": 16, "unit": "g/dL"},
    "creatinine": {"population_mean": 0.9, "population_std": 0.2, "p5": 0.6, "p95": 1.2, "unit": "mg/dL"},
    "sgpt": {"population_mean": 34, "population_std": 15, "p5": 10, "p95": 65, "unit": "IU/L"},
    "sgot": {"population_mean": 32, "population_std": 14, "p5": 10, "p95": 60, "unit": "IU/L"},
    "cholesterol": {"population_mean": 200, "population_std": 40, "p5": 130, "p95": 270, "unit": "mg/dL"},
    "hdl": {"population_mean": 45, "population_std": 10, "p5": 30, "p95": 65, "unit": "mg/dL"},
    "ldl": {"population_mean": 130, "population_std": 35, "p5": 70, "p95": 185, "unit": "mg/dL"},
    "triglyceride": {"population_mean": 150, "population_std": 80, "p5": 50, "p95": 250, "unit": "mg/dL"},
    "potassium": {"population_mean": 4.2, "population_std": 0.5, "p5": 3.5, "p95": 5.0, "unit": "mEq/L"},
    "sodium": {"population_mean": 140, "population_std": 3, "p5": 135, "p95": 145, "unit": "mEq/L"},
    "calcium": {"population_mean": 9.5, "population_std": 0.8, "p5": 8.5, "p95": 10.5, "unit": "mg/dL"},
    "phosphorus": {"population_mean": 3.5, "population_std": 0.8, "p5": 2.5, "p95": 4.5, "unit": "mg/dL"},
    "albumin": {"population_mean": 4.0, "population_std": 0.5, "p5": 3.5, "p95": 5.0, "unit": "g/dL"},
    "bilirubin": {"population_mean": 0.8, "population_std": 0.3, "p5": 0.3, "p95": 1.2, "unit": "mg/dL"},
    "urea": {"population_mean": 35, "population_std": 15, "p5": 15, "p95": 55, "unit": "mg/dL"},
    "hba1c": {"population_mean": 5.5, "population_std": 0.8, "p5": 4.5, "p95": 6.5, "unit": "%"},
}


def retrieve_reference_range(
    test_name: str,
    unit: str = "",
    top_k: int = 3
) -> dict:
    """
    Given a lab test name, retrieve Indian population stats.
    Returns: {test, population_mean, population_std, p5, p95, unit}
    """
    try:
        # Try to find exact match or close match in mock database
        test_lower = test_name.lower()
        
        # Direct match
        if test_lower in REFERENCE_RANGES:
            return REFERENCE_RANGES[test_lower]
        
        # Partial match
        for key, value in REFERENCE_RANGES.items():
            if key in test_lower or test_lower in key:
                return value
        
        # If not found, return default
        return {
            "test": test_name,
            "population_mean": None,
            "population_std": None,
            "p5": None,
            "p95": None,
            "unit": unit or "unknown"
        }
    except Exception as e:
        print(f"Reference range retrieval error for {test_name}: {e}")
        return {"test": test_name, "population_mean": None}


def retrieve_doctor_context(
    query: str,
    top_k: int = 3,
    domain_filter: str = None
) -> list[dict]:
    """
    Mock retrieval of relevant doctor knowledge chunks.
    In production, this would use FAISS indexes.
    """
    # Mock doctor knowledge base
    mock_kb = [
        {
            "domain": "NUTRITION",
            "text": "High blood sugar patients should avoid refined carbohydrates, sugary drinks, and processed foods. Include whole grains, vegetables, and lean proteins.",
            "source": "nutrition_module"
        },
        {
            "domain": "NUTRITION",
            "text": "Liver inflammation requires avoiding fatty, fried, and spicy foods. Increase fiber intake with vegetables and fruits.",
            "source": "nutrition_module"
        },
        {
            "domain": "EXERCISE",
            "text": "Light walking for 20-30 minutes daily is safe for most patients with moderate health concerns. Avoid strenuous exercise without doctor approval.",
            "source": "exercise_module"
        },
        {
            "domain": "EXERCISE",
            "text": "Patients with liver issues should avoid intense workouts. Gentle yoga and light stretching are safer alternatives.",
            "source": "exercise_module"
        },
        {
            "domain": "MENTAL_HEALTH",
            "text": "High stress levels can worsen medical conditions. Practice meditation, deep breathing, or talk to a counselor.",
            "source": "mental_health_module"
        },
        {
            "domain": "CLINICAL",
            "text": "Always take prescribed medications on time. Do not skip or stop without consulting your doctor.",
            "source": "clinical_module"
        }
    ]
    
    try:
        results = []
        for chunk in mock_kb:
            # Simple keyword matching
            if any(word in query.lower() for word in chunk["text"].lower().split()):
                if domain_filter is None or chunk["domain"] == domain_filter:
                    results.append(chunk)
                    if len(results) >= top_k:
                        break
        
        # If no matches, return random relevant chunks
        if not results:
            results = mock_kb[:top_k]
        
        return results
    except Exception as e:
        print(f"Doctor KB retrieval error: {e}")
        return []


def determine_status_vs_india(
    test_name: str,
    patient_value: float,
    unit: str = ""
) -> tuple[str, str]:
    """
    Compare patient value against Indian population stats.
    Returns (status, explanation_string)
    """
    ref = retrieve_reference_range(test_name, unit)
    mean = ref.get("population_mean")
    std = ref.get("population_std")

    if mean is None:
        return "NORMAL", f"Reference data not available for {test_name}"

    if std and std > 0:
        if patient_value < mean - std:
            status = "LOW"
        elif patient_value > mean + std:
            status = "HIGH"
        else:
            status = "NORMAL"
    else:
        status = "NORMAL"

    explanation = (
        f"Indian population average for {test_name}: {mean} "
        f"{ref.get('unit', unit)}. "
        f"Your value: {patient_value} {unit}."
    )
    return status, explanation
