from app.schemas import AnalyzeResponse, Finding

ANEMIA_CASE = AnalyzeResponse(
    is_readable=True,
    report_type="LAB_REPORT",
    findings=[
        Finding(
            parameter="Hemoglobin",
            value="9.2",
            unit="g/dL",
            status="LOW",
            simple_name_hindi="खून की मात्रा",
            simple_name_english="Blood Hemoglobin",
            layman_explanation_hindi="आपके खून में हीमोग्लोबिन कम है। इससे थकान, चक्कर और सांस लेने में तकलीफ होती है।",
            layman_explanation_english="Your blood has less hemoglobin than normal. This causes tiredness, dizziness and shortness of breath.",
            indian_population_mean=13.2,
            indian_population_std=1.8,
            status_vs_india="Below Indian population average (13.2 g/dL)",
            normal_range="12.0-16.0 g/dL"
        ),
        Finding(
            parameter="Serum Iron",
            value="45",
            unit="mcg/dL",
            status="LOW",
            simple_name_hindi="खून में लोहा",
            simple_name_english="Blood Iron Level",
            layman_explanation_hindi="आपके खून में आयरन कम है। पालक, चना, और गुड़ खाएं।",
            layman_explanation_english="Your blood iron is low. Eat spinach, chickpeas, and jaggery to increase it.",
            indian_population_mean=85.0,
            indian_population_std=30.0,
            status_vs_india="Well below Indian population average (85 mcg/dL)",
            normal_range="60-170 mcg/dL"
        ),
        Finding(
            parameter="Vitamin B12",
            value="180",
            unit="pg/mL",
            status="LOW",
            simple_name_hindi="विटामिन बी12",
            simple_name_english="Vitamin B12",
            layman_explanation_hindi="विटामिन B12 कम है। इससे हाथ-पैर में झनझनाहट और थकान होती है।",
            layman_explanation_english="Your Vitamin B12 is low. This causes tingling in hands and feet and fatigue.",
            indian_population_mean=350.0,
            indian_population_std=120.0,
            status_vs_india="Below Indian population average (350 pg/mL)",
            normal_range="200-900 pg/mL"
        ),
    ],
    affected_organs=["BLOOD"],
    overall_summary_hindi="आपके खून में हीमोग्लोबिन, आयरन और विटामिन B12 की कमी है। यह एनीमिया के लक्षण हैं। पालक, चना, राजमा, खजूर और दूध अधिक खाएं। डॉक्टर से मिलें।",
    overall_summary_english="Your blood report shows low hemoglobin, iron and Vitamin B12 — signs of anemia. Eat iron-rich Indian foods like spinach, chickpeas, dates. Follow up with your doctor.",
    severity_level="MILD_CONCERN",
    dietary_flags=["INCREASE_IRON", "INCREASE_VITAMIN_B12", "INCREASE_FOLATE"],
    exercise_flags=["NORMAL_ACTIVITY"],
    ai_confidence_score=94.0,
    grounded_in="Fine-tuned Flan-T5-small + FAISS over NidaanKosha 100K Indian lab readings",
    disclaimer="This is an AI-assisted analysis. It is not a medical diagnosis. Please consult a qualified doctor for proper medical advice."
)

LIVER_CASE = AnalyzeResponse(
    is_readable=True,
    report_type="LAB_REPORT",
    findings=[
        Finding(
            parameter="SGPT (ALT)",
            value="98",
            unit="U/L",
            status="HIGH",
            simple_name_hindi="लीवर एंजाइम SGPT",
            simple_name_english="Liver Enzyme SGPT",
            layman_explanation_hindi="आपका लीवर एंजाइम ज्यादा है। इसका मतलब लीवर में हल्की सूजन हो सकती है। तेल और जंक फूड बंद करें।",
            layman_explanation_english="Your liver enzyme is elevated, suggesting mild liver inflammation. Avoid fried and fatty foods.",
            indian_population_mean=35.0,
            indian_population_std=12.0,
            status_vs_india="Above Indian population average (35 U/L)",
            normal_range="7-56 U/L"
        ),
        Finding(
            parameter="SGOT (AST)",
            value="78",
            unit="U/L",
            status="HIGH",
            simple_name_hindi="लीवर एंजाइम SGOT",
            simple_name_english="Liver Enzyme SGOT",
            layman_explanation_hindi="यह एंजाइम भी ज्यादा है। लीवर पर ध्यान देना जरूरी है।",
            layman_explanation_english="This liver enzyme is also elevated. Your liver needs attention and rest.",
            indian_population_mean=30.0,
            indian_population_std=10.0,
            status_vs_india="Above Indian population average (30 U/L)",
            normal_range="10-40 U/L"
        ),
        Finding(
            parameter="Total Bilirubin",
            value="2.4",
            unit="mg/dL",
            status="HIGH",
            simple_name_hindi="पित्त रंजक",
            simple_name_english="Bilirubin",
            layman_explanation_hindi="खून में बिलीरुबिन ज्यादा है जिससे आंखें और त्वचा पीली हो सकती है।",
            layman_explanation_english="Bilirubin is high which can cause yellowing of eyes and skin (jaundice).",
            indian_population_mean=0.8,
            indian_population_std=0.3,
            status_vs_india="Above Indian population average (0.8 mg/dL)",
            normal_range="0.2-1.2 mg/dL"
        ),
    ],
    affected_organs=["LIVER"],
    overall_summary_hindi="आपके लीवर के तीनों एंजाइम बढ़े हुए हैं। यह लीवर में सूजन का संकेत है। शराब, तेल, और जंक फूड बिल्कुल बंद करें। हल्दी, आंवला और हरी सब्जियां खाएं। डॉक्टर से जल्दी मिलें।",
    overall_summary_english="All three liver enzymes are elevated, indicating liver inflammation. Completely avoid alcohol, fried foods and junk food. Eat turmeric, amla and green vegetables. See your doctor soon.",
    severity_level="MODERATE_CONCERN",
    dietary_flags=["AVOID_FATTY_FOODS", "AVOID_ALCOHOL", "INCREASE_ANTIOXIDANTS"],
    exercise_flags=["LIGHT_WALKING_ONLY"],
    ai_confidence_score=91.0,
    grounded_in="Fine-tuned Flan-T5-small + FAISS over NidaanKosha 100K Indian lab readings",
    disclaimer="This is an AI-assisted analysis. It is not a medical diagnosis. Please consult a qualified doctor for proper medical advice."
)

VITAMIN_D_CASE = AnalyzeResponse(
    is_readable=True,
    report_type="LAB_REPORT",
    findings=[
        Finding(
            parameter="Vitamin D (25-OH)",
            value="11.4",
            unit="ng/mL",
            status="LOW",
            simple_name_hindi="विटामिन डी",
            simple_name_english="Vitamin D",
            layman_explanation_hindi="आपके शरीर में विटामिन D बहुत कम है। इससे हड्डियां कमज़ोर होती हैं और थकान रहती है। सुबह की धूप में बैठें।",
            layman_explanation_english="Your Vitamin D is very low. This weakens bones and causes fatigue. Sit in morning sunlight daily for 15-20 minutes.",
            indian_population_mean=22.0,
            indian_population_std=8.0,
            status_vs_india="Well below Indian population average (22 ng/mL)",
            normal_range="20-50 ng/mL"
        ),
        Finding(
            parameter="Calcium",
            value="8.1",
            unit="mg/dL",
            status="LOW",
            simple_name_hindi="कैल्शियम",
            simple_name_english="Calcium",
            layman_explanation_hindi="कैल्शियम थोड़ा कम है। दूध, दही और पनीर खाएं।",
            layman_explanation_english="Calcium is slightly low. Eat more milk, curd and paneer to strengthen your bones.",
            indian_population_mean=9.2,
            indian_population_std=0.5,
            status_vs_india="Below Indian population average (9.2 mg/dL)",
            normal_range="8.5-10.5 mg/dL"
        ),
    ],
    affected_organs=["BLOOD", "SYSTEMIC"],
    overall_summary_hindi="आपके शरीर में विटामिन D और कैल्शियम की कमी है। रोज़ सुबह 15-20 मिनट धूप में बैठें। दूध, दही, अंडे और मशरूम खाएं। डॉक्टर विटामिन D की दवाई दे सकते हैं।",
    overall_summary_english="You have Vitamin D and calcium deficiency. Sit in morning sunlight 15-20 minutes daily. Eat milk, curd, eggs and mushrooms. Your doctor may prescribe Vitamin D supplements.",
    severity_level="MILD_CONCERN",
    dietary_flags=["INCREASE_VITAMIN_D", "INCREASE_CALCIUM"],
    exercise_flags=["NORMAL_ACTIVITY"],
    ai_confidence_score=96.0,
    grounded_in="Fine-tuned Flan-T5-small + FAISS over NidaanKosha 100K Indian lab readings",
    disclaimer="This is an AI-assisted analysis. It is not a medical diagnosis. Please consult a qualified doctor for proper medical advice."
)

MOCK_CASES = [ANEMIA_CASE, LIVER_CASE, VITAMIN_D_CASE]
