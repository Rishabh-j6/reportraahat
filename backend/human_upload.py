"""
Test the new /upload_and_chat endpoint - uploads file and gets HUMAN greeting
instead of raw schema.
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def upload_and_start_dialogue(pdf_path, patient_name="Ramesh Kumar Sharma"):
    """Upload PDF and immediately get doctor greeting."""
    
    print(f"\n{'='*70}")
    print("📞 UPLOADING AND STARTING DIALOGUE")
    print(f"{'='*70}\n")
    
    with open(pdf_path, 'rb') as f:
        files = {'file': f}
        data = {'patient_name': patient_name, 'language': 'EN'}
        
        try:
            response = requests.post(
                f"{BASE_URL}/upload_and_chat",
                files=files,
                data=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Show analysis metadata
                analysis = result.get('analysis', {})
                print(f"📋 Analysis Status: {'✅ READABLE' if analysis.get('is_readable') else '❌ NOT READABLE'}")
                print(f"📊 Report Type: {analysis.get('report_type')}")
                print(f"⚠️  Severity: {analysis.get('severity_level')}")
                print(f"🏥 Affected Organs: {', '.join(analysis.get('affected_organs', []))}")
                
                # MAIN PART: Show human greeting
                print(f"\n{'─'*70}")
                print("💬 DOCTOR'S GREETING (NOT SCHEMA):")
                print(f"{'─'*70}\n")
                print(result.get('doctor_greeting', 'No greeting'))
                
                # Show what to do next
                print(f"\n{'─'*70}")
                print("📝 What to do next:")
                print("  1. Type your question/concern")
                print("  2. Send to /chat endpoint with the analysis context")
                print("  3. Continue back-and-forth dialogue")
                print(f"{'─'*70}\n")
                
                return result
            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)
                return None
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Server not running!")
            print("Start server with: python -m uvicorn app.main:app --reload --port 8000")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python human_upload.py <pdf_path>")
        print("\nExample:")
        print("  python human_upload.py C:\\path\\to\\report.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = upload_and_start_dialogue(pdf_path)
