"""
Complete workflow: Upload PDF → Get Analysis → Chat with Dr. Raahat
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def upload_and_analyze_pdf(pdf_path):
    """Upload PDF and get analysis."""
    print(f"\n📄 Uploading: {pdf_path}")
    print("-" * 60)
    
    with open(pdf_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/analyze", files=files)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        return None
    
    analysis = response.json()
    print(f"✓ Analysis complete!")
    print(f"  Readable: {analysis['is_readable']}")
    print(f"  Severity: {analysis['severity_level']}")
    print(f"  Summary: {analysis['overall_summary_english']}\n")
    
    return analysis

def chat_with_doctor_about_report(analysis):
    """Interactive dialogue about the uploaded report."""
    if not analysis:
        print("No analysis available to discuss.")
        return
    
    # Build patient context from analysis
    patient_context = {
        "name": "User",
        "age": 45,
        "gender": "Not specified",
        "language": "EN",
        "latestReport": analysis,
        "mentalWellness": {"stressLevel": 5, "sleepQuality": 6}
    }
    
    print("\n" + "="*70)
    print("💬 Dr. Raahat - Your Health Advisor")
    print("="*70)
    print(f"\nReport Summary: {analysis['overall_summary_english']}")
    print(f"Severity Level: {analysis['severity_level']}")
    print(f"Affected Organs: {', '.join(analysis['affected_organs'])}")
    print(f"\nKey Findings:")
    for finding in analysis['findings'][:5]:  # Show first 5
        if finding['status'] in ['LOW', 'HIGH', 'CRITICAL']:
            print(f"  • {finding['parameter']}: {finding['value']} {finding['unit']} [{finding['status']}]")
    
    print("\nType 'exit' to end. Type 'findings' to see all results.")
    print("="*70)
    
    conversation_history = []
    
    # Initial doctor greeting about the report
    initial_response = requests.post(
        f"{BASE_URL}/chat",
        json={
            "message": "What should I know about my report?",
            "history": [],
            "guc": patient_context
        }
    )
    
    if initial_response.status_code == 200:
        initial_message = initial_response.json()['reply']
        print(f"\nDr. Raahat: {initial_message}\n")
    
    while True:
        user_input = input("You: ").strip()
        
        if user_input.lower() == 'exit':
            print("\nDr. Raahat: Take care! Follow the recommendations and schedule a follow-up in 4 weeks.")
            break
        
        if user_input.lower() == 'findings':
            print("\nAll Findings from Your Report:")
            for i, finding in enumerate(analysis['findings'], 1):
                status_icon = "⚠️" if finding['status'] in ['LOW', 'HIGH', 'CRITICAL'] else "✓"
                print(f"  {status_icon} {finding['parameter']}: {finding['value']} {finding['unit']} ({finding['status']})")
            print()
            continue
        
        if not user_input:
            continue
        
        # Add to history
        conversation_history.append({"role": "user", "content": user_input})
        
        # Get doctor response
        try:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "message": user_input,
                    "history": conversation_history,
                    "guc": patient_context
                }
            )
            
            if response.status_code == 200:
                doctor_reply = response.json()['reply']
                conversation_history.append({"role": "assistant", "content": doctor_reply})
                print(f"\nDr. Raahat: {doctor_reply}\n")
            else:
                print(f"Error: {response.status_code}\n")
                
        except Exception as e:
            print(f"Connection error: {e}")
            print("Make sure server is running!\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python doctor_workflow.py <pdf_path>")
        print("\nExample:")
        print("  python doctor_workflow.py C:\\path\\to\\report.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Step 1: Upload and analyze
    analysis = upload_and_analyze_pdf(pdf_path)
    
    # Step 2: Chat about results
    if analysis:
        chat_with_doctor_about_report(analysis)
    else:
        print("Could not analyze report.")

if __name__ == "__main__":
    main()
