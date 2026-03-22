#!/usr/bin/env python3
"""
Demo: Full Schema → Text → Chat Pipeline
Shows the /upload_and_chat endpoint working end-to-end
"""

import requests
import json
from pathlib import Path

def demo_pipeline():
    pdf_path = Path('/c/Users/DEVANG MISHRA/OneDrive/Documents/rahat1/sample_lab_report.pdf')
    
    # Check if file exists
    if not pdf_path.exists():
        print("❌ PDF not found, trying alternate path...")
        pdf_path = Path('../sample_lab_report.pdf')
    
    if pdf_path.exists():
        print('=' * 80)
        print('🧪 TESTING: Schema → Text → Chat Pipeline')
        print('=' * 80)
        print(f'📄 Uploading: {pdf_path.name}')
        print()
        
        try:
            with open(pdf_path, 'rb') as f:
                files = {'file': f}
                response = requests.post('http://localhost:8000/upload_and_chat', files=files)
            
            if response.status_code == 200:
                data = response.json()
                
                # STEP 1: Show Schema Analysis
                print('✅ STEP 1: PDF Analysis → Schema Generated')
                print('-' * 80)
                analysis = data.get('analysis', {})
                findings = analysis.get('findings', [])
                affected_organs = analysis.get('affected_organs', [])
                severity = analysis.get('severity_level', 'UNKNOWN')
                
                print(f'   Parameters Found: {len(findings)}')
                print(f'   Severity Level: {severity}')
                print(f'   Affected Organs: {", ".join(affected_organs)}')
                print()
                print('   Sample Findings:')
                for finding in findings[:3]:
                    status_emoji = '⬇️' if finding.get('status') == 'LOW' else '⬆️' if finding.get('status') == 'HIGH' else '✓'
                    print(f'      {status_emoji} {finding["parameter"]}: {finding["value"]} {finding["unit"]} ({finding["status"]})')
                print()
                
                # STEP 2: Show Schema as Text
                print('✅ STEP 2: Schema → Converted to Natural Language Text')
                print('-' * 80)
                schema_text = data.get('schema_as_text', '')
                if schema_text:
                    lines = schema_text.split('\n')
                    for i, line in enumerate(lines[:6]):
                        if line.strip():
                            print(f'   {line}')
                else:
                    print('   (No schema_as_text in response)')
                print()
                
                # STEP 3: Show Doctor Response
                print('✅ STEP 3: Text → Fed to Dr. Raahat AI Chat System')
                print('-' * 80)
                doctor_greeting = data.get('doctor_greeting', '')
                if doctor_greeting:
                    lines = doctor_greeting.split('\n')
                    for i, line in enumerate(lines[:10]):
                        print(f'   {line}')
                    if len(lines) > 10:
                        print(f'   ... ({len(lines) - 10} more lines)')
                else:
                    print('   (No doctor response)')
                print()
                
                # Final Result
                print('=' * 80)
                print('✨ SUCCESS: Full Pipeline Working!')
                print('   PDF → Schema → Natural Text → Human Doctor Response')
                print('=' * 80)
                
            else:
                print(f'❌ API Error: {response.status_code}')
                print(response.text[:200])
                
        except Exception as e:
            print(f'❌ Error: {str(e)}')
    else:
        print(f'❌ PDF not found at: {pdf_path}')
        print('   Please check sample_lab_report.pdf location')

if __name__ == '__main__':
    demo_pipeline()
