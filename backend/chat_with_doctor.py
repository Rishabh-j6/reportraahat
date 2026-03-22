"""
Chat interface for Dr. Raahat - Have a dialogue about your health report.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Your analysis result from the PDF (the report)
LATEST_REPORT = {
    "is_readable": True,
    "report_type": "LAB_REPORT",
    "findings": [
        {"parameter": "Haemoglobin", "value": "9.2", "unit": "g/dL", "status": "LOW"},
        {"parameter": "Total RBC Count", "value": "3.8", "unit": "mill/cumm", "status": "LOW"},
        {"parameter": "Serum Iron", "value": "45", "unit": "ug/dL", "status": "LOW"},
        {"parameter": "Serum Ferritin", "value": "8", "unit": "ng/mL", "status": "LOW"},
        {"parameter": "Vitamin B12", "value": "182", "unit": "pg/mL", "status": "LOW"},
    ],
    "affected_organs": ["BLOOD", "SYSTEMIC"],
    "overall_summary_english": "You have signs of iron deficiency anemia with low B12.",
    "severity_level": "MILD_CONCERN",
    "dietary_flags": ["INCREASE_IRON", "INCREASE_VITAMIN_B12"],
}

# Your patient context
PATIENT_CONTEXT = {
    "name": "Ramesh Kumar Sharma",
    "age": 45,
    "gender": "Male",
    "language": "EN",
    "latestReport": LATEST_REPORT,
    "mentalWellness": {
        "stressLevel": 5,
        "sleepQuality": 6
    }
}

def chat_with_doctor():
    """Interactive chat with Dr. Raahat about your health."""
    print("\n" + "="*70)
    print("Dr. Raahat - Your Personal Health Advisor")
    print("="*70)
    print("\nYour Report Summary:")
    print(f"  Status: {LATEST_REPORT['report_type']}")
    print(f"  Severity: {LATEST_REPORT['severity_level']}")
    print(f"  Summary: {LATEST_REPORT['overall_summary_english']}")
    print("\nType 'exit' to end the conversation.")
    print("="*70 + "\n")
    
    conversation_history = []
    
    # Initial greeting from doctor
    initial_message = "Hi! I've reviewed your lab report. I see you have signs of iron deficiency anemia with low B12 levels. How are you feeling lately? Are you experiencing any fatigue or weakness?"
    print(f"Dr. Raahat: {initial_message}\n")
    
    while True:
        # Get user input
        user_input = input("You: ").strip()
        
        if user_input.lower() == 'exit':
            print("\nDr. Raahat: Take care! Remember to follow the dietary recommendations and schedule a follow-up visit in 4 weeks. Stay healthy!")
            break
        
        if not user_input:
            continue
        
        # Add to conversation history
        conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # Send to doctor
        try:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "message": user_input,
                    "history": conversation_history,
                    "guc": PATIENT_CONTEXT
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                doctor_reply = data.get("reply", "I'm not sure how to respond to that.")
                
                # Add doctor response to history
                conversation_history.append({
                    "role": "assistant",
                    "content": doctor_reply
                })
                
                print(f"\nDr. Raahat: {doctor_reply}\n")
            else:
                print(f"Error: {response.status_code}")
                
        except Exception as e:
            print(f"Connection error: {e}")
            print("Make sure the server is running: python -m uvicorn app.main:app --reload --port 8000\n")

if __name__ == "__main__":
    chat_with_doctor()
