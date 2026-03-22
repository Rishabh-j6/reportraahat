"""
Demo: Complete Doctor Dialogue based on your uploaded report
Shows how the system works with a series of exchanges.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Your actual analysis from the PDF
ANALYSIS = {
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
}

# Your patient info
PATIENT = {
    "name": "Ramesh Kumar Sharma",
    "age": 45,
    "gender": "Male",
    "language": "EN",
    "latestReport": ANALYSIS,
    "mentalWellness": {"stressLevel": 5, "sleepQuality": 6}
}

def demo_conversation():
    """Demonstrate the doctor-patient dialogue."""
    
    print("\n" + "="*80)
    print(" 💬 Dr. Raahat - Patient Health Consultation")
    print("="*80)
    print(f"\nPatient: {PATIENT['name']}, {PATIENT['age']} years old")
    print(f"Report Status: {ANALYSIS['report_type']}")
    print(f"Summary: {ANALYSIS['overall_summary_english']}")
    print(f"Severity: {ANALYSIS['severity_level']}")
    print("="*80)
    
    conversation = []
    
    # Exchange 1: Doctor greets and patient reports symptoms
    exchanges = [
        {
            "user_message": "Hi Doctor, I'm feeling exhausted and weak all the time",
            "context": "Patient describes fatigue symptoms"
        },
        {
            "user_message": "What should I eat to get better?",
            "context": "Patient asks about diet"
        },
        {
            "user_message": "How long until I feel normal again?",
            "context": "Patient asks about recovery timeline"
        },
        {
            "user_message": "Do I need to exercise?",
            "context": "Patient asks about physical activity"
        },
    ]
    
    for i, exchange in enumerate(exchanges, 1):
        user_msg = exchange["user_message"]
        
        # Add to conversation history
        conversation.append({"role": "user", "content": user_msg})
        
        # Get doctor response from API
        try:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "message": user_msg,
                    "history": conversation,
                    "guc": PATIENT
                },
                timeout=10
            )
            
            if response.status_code == 200:
                doctor_reply = response.json()['reply']
                conversation.append({"role": "assistant", "content": doctor_reply})
                
                # Display the exchange
                print(f"\n{'─'*80}")
                print(f"Exchange {i}: {exchange['context']}")
                print(f"{'─'*80}")
                print(f"\n👤 Patient: {user_msg}")
                print(f"\n👨‍⚕️  Dr. Raahat: {doctor_reply}")
                
            else:
                print(f"\n❌ API Error: {response.status_code}")
                return
                
        except Exception as e:
            print(f"\n❌ Connection Error: {e}")
            print("\n⚠️  Make sure the server is running:")
            print("   cd backend && python -m uvicorn app.main:app --reload --port 8000")
            return
    
    # Summary
    print(f"\n{'='*80}")
    print("✅ Conversation Complete!")
    print(f"{'='*80}")
    print(f"\nThis is a demonstration of how Dr. Raahat responds to patient questions")
    print(f"based on their uploaded medical report. The doctor provides:")
    print(f"  ✓ Specific advice based on your findings (LOW Hemoglobin, Iron, B12)")
    print(f"  ✓ Dietary recommendations tailored to your condition")
    print(f"  ✓ Recovery timeline based on severity")
    print(f"  ✓ Exercise guidelines for your current health status")
    print(f"\nYou can have unlimited back-and-forth conversations!")

if __name__ == "__main__":
    demo_conversation()
