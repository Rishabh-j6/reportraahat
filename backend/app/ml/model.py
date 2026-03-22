import os

# Mock model loader for testing without HuggingFace dependencies
def load_model():
    """
    Mock model loader. In production, replace with actual model loading.
    """
    print("Using mock model for simplification")
    return None, None


def simplify_finding(
    parameter: str,
    value: str,
    unit: str,
    status: str,
    rag_context: str = ""
) -> dict:
    """
    Mock simplification of medical findings.
    In production, this would use the T5 model.
    """
    
    # Simplified explanations based on common parameters and status
    explanations = {
        ("HIGH", "GLUCOSE"): {
            "english": f"Your blood glucose is elevated at {value} {unit}. This suggests your body is having trouble managing blood sugar. Reduce sugary foods and consult your doctor for diabetes screening.",
            "hindi": f"आपका ब्लड ग्लूकोज़ {value} {unit} पर बढ़ा हुआ है। यह दर्शाता है कि आपका शरीर ब्लड शुगर को नियंत्रित करने में परेशानी आ रही है। मीठे खाना कम करें और डॉक्टर से मिलें।"
        },
        ("HIGH", "SGPT"): {
            "english": f"Your liver enzyme SGPT is high at {value} {unit}. This indicates liver inflammation. Avoid fatty foods and alcohol, and get liver function tests repeated.",
            "hindi": f"आपका यकृत एंजाइम SGPT {value} {unit} पर बढ़ा हुआ है। यह यकृत में सूजन दर्शाता है। तैलीय खाना और शराब न लें।"
        },
        ("LOW", "HEMOGLOBIN"): {
            "english": f"Your hemoglobin is low at {value} {unit}. You may be anemic. Increase iron-rich foods like spinach, liver, and beans. Get iron supplements if recommended by doctor.",
            "hindi": f"आपका हीमोग्लोबिन {value} {unit} पर कम है। आपको एनीमिया हो सकता है। पालक, यकृत, और दाल जैसे आयरन युक्त खाना बढ़ाएं।"
        },
        ("HIGH", "CHOLESTEROL"): {
            "english": f"Your cholesterol is elevated at {value} {unit}. Reduce saturated fats, increase fiber intake, and exercise regularly. Follow up with your doctor.",
            "hindi": f"आपका कोलेस्ट्रॉल {value} {unit} पर बढ़ा हुआ है। संतृप्त वसा कम करें और नियमित व्यायाम करें।"
        },
        ("HIGH", "CREATININE"): {
            "english": f"Your creatinine is elevated at {value} {unit}. This may indicate kidney issues. Reduce protein intake and stay hydrated. Consult a nephrologist.",
            "hindi": f"आपका क्रिएटिनिन {value} {unit} पर बढ़ा है। यह गुर्दे की समस्या दर्शा सकता है। प्रोटीन इनटेक कम करें।"
        }
    }
    
    # Try to match the parameter with explanations
    param_upper = parameter.upper()
    status_upper = status.upper()
    
    for (status_key, param_key) in explanations.keys():
        if param_key in param_upper and status_key == status_upper:
            return explanations[(status_key, param_key)]
    
    # Default explanation
    default_exp = {
        "HIGH": f"Your {parameter} is high at {value} {unit}. This suggests abnormality. Please consult your doctor for proper evaluation and treatment.",
        "LOW": f"Your {parameter} is low at {value} {unit}. This may indicate deficiency. Consult your doctor for recommendations.",
        "CRITICAL": f"Your {parameter} is critically high at {value} {unit}. This requires immediate medical attention. Please see a doctor urgently.",
        "NORMAL": f"Your {parameter} is normal at {value} {unit}. Keep maintaining healthy habits."
    }
    
    english_text = default_exp.get(status_upper, f"Your {parameter} is {status.lower()}.")
    hindi_text = f"{parameter} {status.lower()} है। डॉक्टर से मिलें।"
    
    return {
        "english": english_text,
        "hindi": hindi_text
    }
