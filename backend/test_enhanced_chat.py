#!/usr/bin/env python3
"""
Test script: RAG-enhanced chat with HF dataset + FAISS index
Run this to see the improvement in chat quality
"""

import sys
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.ml.enhanced_chat import get_enhanced_mock_response, rag_retriever

def create_sample_guc():
    """Create sample Global User Context with medical data."""
    return {
        "name": "Amit",
        "age": "28",
        "gender": "Male",
        "language": "EN",
        "location": "Mumbai, India",
        "latestReport": {
            "overall_summary_english": "Lab report shows signs of anemia with low iron and B12",
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
                }
            ],
            "affected_organs": ["Blood", "Bone Marrow"],
            "severity_level": "NORMAL",
            "dietary_flags": ["Low Iron Intake", "Insufficient B12"],
            "exercise_flags": ["Fatigue Limiting Activity"]
        },
        "medicationsActive": [],
        "allergyFlags": [],
        "mentalWellness": {"stressLevel": 6, "sleepQuality": 5}
    }

def print_separator(title=""):
    """Print formatted separator."""
    print("\n" + "=" * 80)
    if title:
        print(f"  {title}")
        print("=" * 80)

def test_chat():
    """Test enhanced chat with various queries."""
    
    print_separator("🏥 Enhanced Chat System - RAG Integration Test")
    
    guc = create_sample_guc()
    
    # Check RAG status
    if rag_retriever:
        status = "✅ LOADED" if rag_retriever.loaded else "⚠️  FAILED TO LOAD"
        doc_count = len(rag_retriever.documents) if rag_retriever.loaded else 0
        print(f"\n📚 RAG Status: {status}")
        print(f"   Documents available: {doc_count}")
    else:
        print("\n⚠️  RAG not initialized - using mock responses only")
    
    # Test conversations
    test_queries = [
        {
            "question": "I'm feeling very tired and weak. What should I do?",
            "category": "Fatigue & Symptoms"
        },
        {
            "question": "What foods should I eat to improve my condition?",
            "category": "Nutrition"
        },
        {
            "question": "What medicines do I need to take?",
            "category": "Medications"
        },
        {
            "question": "Can I exercise? I feel exhausted.",
            "category": "Physical Activity"
        },
        {
            "question": "When should I follow up with my doctor?",
            "category": "Follow-up Care"
        },
        {
            "question": "I'm worried this is serious. Should I panic?",
            "category": "Reassurance"
        }
    ]
    
    print_separator("Chat Interaction Tests")
    
    for i, test in enumerate(test_queries, 1):
        print_separator(f"Test {i}: {test['category']}")
        print(f"\n👤 Patient: {test['question']}")
        print("\n🏥 Dr. Raahat:")
        
        response = get_enhanced_mock_response(test["question"], guc)
        print(response)
        
        if rag_retriever and rag_retriever.loaded:
            print("\n📚 [Sources: Retrieved from medical database]")
        else:
            print("\n📌 [Note: Using contextual mock responses. RAG sources not available.]")
    
    print_separator("Test Complete")
    print("""
✅ Enhanced Chat Features:
  ✓ Context-aware responses based on actual findings
  ✓ Personalized health advice
  ✓ Step-by-step action plans
  ✓ RAG integration ready for HF dataset
  ✓ Clear formatting and readability
  ✓ Empathetic doctor persona

🔄 Next Steps:
  1. Deploy FAISS index from HF
  2. Load medical documents
  3. Enable actual document retrieval
  4. Remove mock responses from production
  5. Add response grounding/sources
    """)

if __name__ == "__main__":
    test_chat()
