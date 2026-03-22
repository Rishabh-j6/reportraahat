"""
Upload PDF and immediately start human conversation with doctor.
Converts schema analysis to natural language text and processes through chat system.
"""
from fastapi import APIRouter, UploadFile, File, Form
from app.routers.analyze import analyze_report
from app.ml.openrouter import chat
from app.ml.enhanced_chat import get_enhanced_mock_response

router = APIRouter()


def convert_analysis_to_text(analysis_schema: dict) -> str:
    """
    Convert structured analysis schema to natural language text input.
    This text becomes the "patient's story" for the doctor to analyze.
    """
    findings = analysis_schema.get("findings", [])
    severity = analysis_schema.get("severity_level", "NORMAL")
    organs = analysis_schema.get("affected_organs", [])
    dietary = analysis_schema.get("dietary_flags", [])
    exercise = analysis_schema.get("exercise_flags", [])
    
    # Build natural language description
    text_summary = "Here's my medical report analysis:\n\n"
    
    # Add findings
    if findings:
        text_summary += "**Lab Results:**\n"
        abnormal_count = 0
        for f in findings:
            param = f.get("parameter", "Unknown")
            value = f.get("value", "N/A")
            unit = f.get("unit", "")
            status = f.get("status", "NORMAL")
            
            if status != "NORMAL":
                text_summary += f"- {param}: {value} {unit} ({status})\n"
                abnormal_count += 1
        
        text_summary += f"\nTotal abnormal findings: {abnormal_count}\n\n"
    
    # Add severity & affected areas
    text_summary += f"**Overall Severity:** {severity}\n"
    if organs:
        text_summary += f"**Affected Areas:** {', '.join(organs)}\n"
    
    # Add dietary recommendations
    if dietary:
        text_summary += f"**Dietary Concerns:** {', '.join(dietary)}\n"
    
    # Add exercise restrictions
    if exercise:
        text_summary += f"**Exercise Restrictions:** {', '.join(exercise)}\n"
    
    text_summary += "\nPlease analyze my report and give me guidance."
    
    return text_summary


@router.post("/upload_and_chat")
async def upload_and_start_dialogue(
    file: UploadFile = File(...),
    language: str = Form(default="EN"),
    patient_name: str = Form(default="Patient")
):
    """
    Upload file → Analyze → Convert schema to text → Process through chat → Get human response
    
    Flow:
    1. Extract & parse PDF
    2. Get structured analysis (schema)
    3. Convert schema to natural language text
    4. Send text through chat system
    5. Return doctor's natural language response
    
    Returns:
    {
      "analysis": {...full analysis schema...},
      "analysis_text": "Converted natural language version",
      "doctor_response": "Dr. Raahat: Hello! I've reviewed your report...",
      "conversation_started": true
    }
    """
    
    # Step 1: Analyze the report (gets schema)
    analysis = await analyze_report(file, language)
    
    if not analysis.is_readable:
        return {
            "analysis": analysis.model_dump(),
            "doctor_response": "I couldn't read your report clearly. Please upload a clearer PDF with visible text.",
            "conversation_started": False
        }
    
    # Step 2: Convert schema to natural language text
    analysis_text = convert_analysis_to_text(analysis.model_dump())
    
    # Step 3: Build patient context
    patient_context = {
        "name": patient_name,
        "age": 45,
        "gender": "Not specified",
        "language": language,
        "latestReport": analysis.model_dump(),
        "mentalWellness": {"stressLevel": 5, "sleepQuality": 6}
    }
    
    # Step 4: Send analysis text through chat system to get doctor response
    # The chat system receives the text-converted analysis and responds naturally
    doctor_response = chat(
        message=analysis_text,
        history=[],
        guc=patient_context
    )
    
    # Add doctor introduction
    full_response = f"Dr. Raahat: I've reviewed your medical report analysis.\n\n{doctor_response}"
    
    return {
        "analysis": analysis.model_dump(),
        "analysis_text": analysis_text,
        "doctor_response": full_response,
        "conversation_started": True,
        "patient_name": patient_name,
        "language": language
    }
