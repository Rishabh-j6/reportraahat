#!/usr/bin/env python3
"""
Complete end-to-end test: Schema → Text → Chat Response
Shows the full document scanning conversion pipeline
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.routers.doctor_upload import convert_analysis_to_text
from app.ml.openrouter import chat

# Sample schema from PDF analysis
sample_analysis = {
    "findings": [
        {"parameter": "Haemoglobin", "value": 9.2, "unit": "g/dL", "status": "LOW", "reference": "13.0 - 17.0"},
        {"parameter": "Iron", "value": 45, "unit": "µg/dL", "status": "LOW", "reference": "60 - 170"},
        {"parameter": "Vitamin B12", "value": 180, "unit": "pg/mL", "status": "LOW", "reference": "200 - 900"},
        {"parameter": "RBC", "value": 3.8, "unit": "10^6/µL", "status": "LOW", "reference": "4.5 - 5.5"},
        {"parameter": "WBC", "value": 7.2, "unit": "10^3/µL", "status": "NORMAL", "reference": "4.5 - 11.0"}
    ],
    "severity_level": "NORMAL",
    "affected_organs": ["Blood", "Bone Marrow"],
    "dietary_flags": ["Low Iron Intake", "Insufficient B12"],
    "exercise_flags": ["Fatigue Limiting Activity"]
}

def print_section(title):
    print("\n" + "=" * 90)
    print(f"  {title}")
    print("=" * 90)

def test_full_pipeline():
    """Test the complete schema → text → chat response pipeline"""
    
    print_section("1️⃣  INPUT: Schema-Based PDF Analysis")
    print("\nFindings from PDF extraction:")
    for finding in sample_analysis["findings"]:
        status_color = "❌" if finding['status'] != "NORMAL" else "✓"
        print(f"  {status_color} {finding['parameter']}: {finding['value']} {finding['unit']} ({finding['status']})")
    
    print(f"\n  Severity: {sample_analysis['severity_level']}")
    print(f"  Affected: {', '.join(sample_analysis['affected_organs'])}")
    print(f"  Dietary: {', '.join(sample_analysis['dietary_flags'])}")
    print(f"  Exercise: {', '.join(sample_analysis['exercise_flags'])}")
    
    print_section("2️⃣  CONVERSION: Schema → Natural Language Text")
    analysis_text = convert_analysis_to_text(sample_analysis)
    print(analysis_text)
    
    print_section("3️⃣  PROCESSING: Text → Chat System")
    print("\nSending text through chat system with patient context...")
    
    # Build patient context
    patient_context = {
        "name": "Amit Kumar",
        "age": "28",
        "gender": "Male",
        "language": "EN",
        "latestReport": sample_analysis,
        "mentalWellness": {"stressLevel": 6, "sleepQuality": 5}
    }
    
    # Send through chat system
    print("Processing...\n")
    doctor_response = chat(
        message=analysis_text,
        history=[],
        guc=patient_context
    )
    
    print_section("4️⃣  OUTPUT: Doctor Response (Natural Language)")
    print(f"\nDr. Raahat:\n{doctor_response}")
    
    print_section("✅ PIPELINE COMPLETE")
    print("""
Flow Summary:
┌─────────────────────────────────────────────────────────┐
│  1. PDF Upload                                          │
│     ↓                                                   │
│  2. PDF Analysis (Schema-Based)                         │
│     ↓                                                   │
│  3. Schema → Natural Language Text Conversion           │
│     ↓                                                   │
│  4. Send Text to Chat System                            │
│     ↓                                                   │
│  5. Chat System Processes & Returns Response            │
│     ↓                                                   │
│  6. Doctor's Human-Friendly Response                    │
└─────────────────────────────────────────────────────────┘

Key Innovation:
- Schema analysis receives proper natural language processing
- Doctor responses are contextual to actual findings
- No raw JSON schema returned - only human dialogue
- Seamless user experience in `/upload_and_chat` endpoint
    """)

if __name__ == "__main__":
    test_full_pipeline()
