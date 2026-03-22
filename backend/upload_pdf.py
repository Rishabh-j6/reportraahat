#!/usr/bin/env python3
"""
Upload and analyze a medical report PDF
"""
import requests
import json

API_URL = "http://localhost:8000/analyze"
PDF_PATH = r"C:\Users\DEVANG MISHRA\OneDrive\Documents\rahat1\sample_lab_report.pdf"

print(f"Uploading PDF: {PDF_PATH}")
print("-" * 60)

try:
    with open(PDF_PATH, 'rb') as pdf_file:
        files = {
            'file': (pdf_file.name, pdf_file, 'application/pdf')
        }
        data = {
            'language': 'EN'
        }
        
        response = requests.post(API_URL, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis Complete!\n")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print(f"❌ Error: {response.status_code}")
            print("Response:", response.text)
            
except FileNotFoundError:
    print(f"❌ File not found: {PDF_PATH}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
