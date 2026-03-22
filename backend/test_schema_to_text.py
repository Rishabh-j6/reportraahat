#!/usr/bin/env python3
"""
Test the new schema-to-text-to-chat conversion pipeline
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.routers.doctor_upload import convert_analysis_to_text

# Sample schema from PDF analysis
sample_analysis = {
    "findings": [
        {
            "parameter": "Haemoglobin",
            "value": 9.2,
            "unit": "g/dL",
            "status": "LOW",
            "reference": "13.0 - 17.0"
        },
        {
            "parameter": "Iron",
            "value": 45,
            "unit": "µg/dL",
            "status": "LOW",
            "reference": "60 - 170"
        },
        {
            "parameter": "Vitamin B12",
            "value": 180,
            "unit": "pg/mL",
            "status": "LOW",
            "reference": "200 - 900"
        },
        {
            "parameter": "RBC",
            "value": 3.8,
            "unit": "10^6/µL",
            "status": "LOW",
            "reference": "4.5 - 5.5"
        },
        {
            "parameter": "WBC",
            "value": 7.2,
            "unit": "10^3/µL",
            "status": "NORMAL",
            "reference": "4.5 - 11.0"
        }
    ],
    "severity_level": "NORMAL",
    "affected_organs": ["Blood", "Bone Marrow"],
    "dietary_flags": ["Low Iron Intake", "Insufficient B12"],
    "exercise_flags": ["Fatigue Limiting Activity"]
}

print("=" * 80)
print("SCHEMA-TO-TEXT CONVERSION TEST")
print("=" * 80)

print("\n📊 Input Schema:")
print("-" * 80)
for finding in sample_analysis["findings"]:
    print(f"  {finding['parameter']}: {finding['value']} {finding['unit']} ({finding['status']})")

print("\n" + "=" * 80)
print("⚙️  Converting schema to natural language text...")
print("=" * 80)

text_output = convert_analysis_to_text(sample_analysis)

print("\n📝 Output Text (what will be sent to chat system):")
print("-" * 80)
print(text_output)
print("-" * 80)

print("\n✅ Conversion successful!")
print("\nThis text will now be:")
print("1. Sent to the chat system as user input")
print("2. Processed by get_enhanced_mock_response()")
print("3. Returned as human-friendly doctor response")
print("\n🎯 Result: Schema → Text → Chat Response (all in one flow)")
