// OWNER: Member 1 (ML Engineer)
// Three realistic fallback reports — used when ML pipeline times out.

import type { ReportData } from "./store"

export const MOCK_ANEMIA: ReportData = {
  is_readable: true, report_type: "LAB_REPORT",
  patient_summary: { name: "Ramesh Kumar", age: 45, gender: "MALE", report_date: new Date().toISOString().split("T")[0] },
  findings: [
    { parameter: "Hemoglobin", value: "9.2 g/dL", normal_range: "13.5–17.5 g/dL", status: "LOW",
      simple_name_hindi: "खून की मात्रा", simple_name_english: "Blood Protein Level",
      layman_explanation_hindi: "आपके खून में हीमोग्लोबिन कम है। थकान और सांस की तकलीफ हो सकती है।",
      layman_explanation_english: "Your hemoglobin is lower than normal, causing tiredness and breathlessness." },
    { parameter: "Vitamin D", value: "12 ng/mL", normal_range: "30–100 ng/mL", status: "LOW",
      simple_name_hindi: "धूप विटामिन", simple_name_english: "Sunshine Vitamin",
      layman_explanation_hindi: "विटामिन डी बहुत कम है। रोज़ 20 मिनट धूप लें।",
      layman_explanation_english: "Vitamin D is very low. Daily sunlight for 20 minutes will help." },
    { parameter: "WBC Count", value: "7,200 cells/μL", normal_range: "4,500–11,000 cells/μL", status: "NORMAL",
      simple_name_hindi: "रोग प्रतिरोधक कोशिकाएं", simple_name_english: "Immune Cells",
      layman_explanation_hindi: "रोग प्रतिरोधक क्षमता ठीक है।",
      layman_explanation_english: "Your immune system is working normally." },
  ],
  affected_organs: ["BLOOD"],
  overall_summary_hindi: "खून की कमी और विटामिन डी की कमी है। यह आम है और ठीक हो सकता है।",
  overall_summary_english: "Anemia and low Vitamin D detected. Both are common and fully treatable.",
  severity_level: "MILD_CONCERN",
  next_steps: ["Eat spinach, lentils, jaggery daily", "20 min morning sunlight", "Ask doctor about supplements", "Retest in 6 weeks"],
  dietary_flags: ["INCREASE_IRON", "INCREASE_VITAMIN_D", "INCREASE_PROTEIN"],
  exercise_flags: ["LIGHT_WALKING_ONLY"],
  ai_confidence_score: 96,
  disclaimer: "AI-generated. Always consult a qualified doctor.",
}

export const MOCK_LIVER: ReportData = {
  is_readable: true, report_type: "LAB_REPORT",
  patient_summary: { name: "Sunita Devi", age: 52, gender: "FEMALE", report_date: new Date().toISOString().split("T")[0] },
  findings: [
    { parameter: "SGPT (ALT)", value: "78 U/L", normal_range: "7–40 U/L", status: "HIGH",
      simple_name_hindi: "लिवर एंजाइम", simple_name_english: "Liver Health Marker",
      layman_explanation_hindi: "लिवर पर थोड़ा दबाव है।",
      layman_explanation_english: "Your liver is under mild stress." },
    { parameter: "Total Cholesterol", value: "238 mg/dL", normal_range: "< 200 mg/dL", status: "HIGH",
      simple_name_hindi: "खून में चर्बी", simple_name_english: "Blood Fat Level",
      layman_explanation_hindi: "खून में चर्बी ज़्यादा है। तला खाना कम करें।",
      layman_explanation_english: "Cholesterol is high. Reduce fried and fatty foods." },
  ],
  affected_organs: ["LIVER"],
  overall_summary_hindi: "लिवर में दबाव और कोलेस्ट्रॉल ज़्यादा है। खान-पान और व्यायाम से सुधार होगा।",
  overall_summary_english: "Mild liver stress and high cholesterol. Manageable with lifestyle changes.",
  severity_level: "MODERATE_CONCERN",
  next_steps: ["Avoid fried foods and excess ghee", "Walk 30 min daily", "Drink 8–10 glasses water", "Retest in 4 weeks"],
  dietary_flags: ["AVOID_FATTY_FOODS", "REDUCE_SUGAR", "INCREASE_FIBER"],
  exercise_flags: ["CARDIO_RESTRICTED"],
  ai_confidence_score: 91,
  disclaimer: "AI-generated. Always consult a qualified doctor.",
}

export const MOCK_DIABETES: ReportData = {
  is_readable: true, report_type: "LAB_REPORT",
  patient_summary: { name: "Mohan Lal Sharma", age: 58, gender: "MALE", report_date: new Date().toISOString().split("T")[0] },
  findings: [
    { parameter: "HbA1c", value: "8.2%", normal_range: "< 5.7%", status: "HIGH",
      simple_name_hindi: "3 महीने की शुगर", simple_name_english: "3-Month Average Sugar",
      layman_explanation_hindi: "शुगर 3 महीनों से ज़्यादा है। डायबिटीज़ की निशानी है।",
      layman_explanation_english: "Blood sugar has been high for 3 months — indicates diabetes." },
    { parameter: "Creatinine", value: "1.6 mg/dL", normal_range: "0.7–1.2 mg/dL", status: "HIGH",
      simple_name_hindi: "किडनी फ़िल्टर माप", simple_name_english: "Kidney Filter Marker",
      layman_explanation_hindi: "किडनी थोड़ा कम काम कर रही है।",
      layman_explanation_english: "Kidneys are under mild stress. Drink more water." },
  ],
  affected_organs: ["BLOOD", "KIDNEY"],
  overall_summary_hindi: "डायबिटीज़ और किडनी पर असर। जल्द डॉक्टर से मिलें।",
  overall_summary_english: "Diabetes and early kidney stress detected. Needs prompt medical attention.",
  severity_level: "URGENT",
  next_steps: ["See doctor urgently in 2–3 days", "Stop sugar, maida, sweet drinks", "Walk 20 min daily", "Monitor BP daily"],
  dietary_flags: ["REDUCE_SUGAR", "REDUCE_SALT", "AVOID_REFINED_CARBS", "INCREASE_FIBER"],
  exercise_flags: ["LIGHT_WALKING_ONLY"],
  ai_confidence_score: 94,
  disclaimer: "AI-generated. Always consult a qualified doctor.",
}

let _idx = 0
export const getNextMock = (): ReportData => {
  const mocks = [MOCK_ANEMIA, MOCK_LIVER, MOCK_DIABETES]
  return mocks[_idx++ % mocks.length]
}
