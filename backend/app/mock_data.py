# ============================================================
# mock_data.py — 3 realistic hackathon demo reports
#
# MOCK_REPORT_ANEMIA      → iron-deficiency anaemia + Vit D
#                           severity: MODERATE_CONCERN
#                           organs:   BLOOD
#                           used when: Gemini timeout
#
# MOCK_REPORT_LIVER       → fatty liver + cholesterol + pre-diabetes
#                           severity: MILD_CONCERN
#                           organs:   LIVER
#                           used when: Gemini 429 rate-limit
#
# MOCK_REPORT_VITAMIN_D   → critical Vit D + calcium + thyroid edge case
#                           severity: MODERATE_CONCERN
#                           organs:   SYSTEMIC
#                           used when: Gemini bad JSON / parse error
#
# All three pass Pydantic validation. All enum values are legal.
# ============================================================

# ─────────────────────────────────────────────────────────────
# MOCK 1 — Iron-Deficiency Anaemia (8 findings)
# Great demo: RED rows in lab table, BLOOD organ glow on body map
# ─────────────────────────────────────────────────────────────
MOCK_REPORT_ANEMIA = {
    "is_readable": True,
    "report_type": "LAB_REPORT",
    "patient_summary": {
        "name": "Priya Sharma",
        "age": 28,
        "gender": "FEMALE",
        "report_date": "2025-03-15",
    },
    "findings": [
        {
            "parameter": "Hemoglobin",
            "value": "9.2 g/dL",
            "normal_range": "12.0–16.0 g/dL",
            "status": "LOW",
            "simple_name_hindi": "खून की मात्रा",
            "simple_name_english": "Blood Haemoglobin",
            "layman_explanation_hindi": "आपके खून में लाल कणों की मात्रा कम है जो पूरे शरीर में ऑक्सीजन ले जाते हैं। इसीलिए आपको थकान और कमज़ोरी महसूस होती है।",
            "layman_explanation_english": "Your blood has fewer red cells than normal — these carry oxygen to every part of your body. Low levels cause tiredness, weakness, and breathlessness.",
        },
        {
            "parameter": "Serum Ferritin",
            "value": "6 ng/mL",
            "normal_range": "12–150 ng/mL",
            "status": "CRITICAL",
            "simple_name_hindi": "आयरन का भंडार",
            "simple_name_english": "Iron Storage (Ferritin)",
            "layman_explanation_hindi": "फेरिटिन आपके शरीर का आयरन भंडार है। यह बहुत खाली हो गया है — इसे दवाई और सही खाने से भरना होगा।",
            "layman_explanation_english": "Ferritin is your body's iron storage tank. Yours is critically empty — this is the main reason your haemoglobin is so low.",
        },
        {
            "parameter": "Serum Iron",
            "value": "32 µg/dL",
            "normal_range": "60–170 µg/dL",
            "status": "LOW",
            "simple_name_hindi": "खून में आयरन",
            "simple_name_english": "Iron in Blood",
            "layman_explanation_hindi": "खून में आयरन की मात्रा कम है। यह सीधे हीमोग्लोबिन बनाने में काम आता है।",
            "layman_explanation_english": "The iron circulating in your blood right now is low. Iron is needed to make haemoglobin, which carries oxygen.",
        },
        {
            "parameter": "Serum Vitamin D (25-OH)",
            "value": "16 ng/mL",
            "normal_range": "30–100 ng/mL",
            "status": "LOW",
            "simple_name_hindi": "विटामिन डी",
            "simple_name_english": "Vitamin D Level",
            "layman_explanation_hindi": "विटामिन डी हड्डियों और रोग प्रतिरोधक क्षमता के लिए जरूरी है। आपका स्तर कम है — सुबह की धूप और सप्लीमेंट लेना जरूरी है।",
            "layman_explanation_english": "Vitamin D is needed for strong bones and a good immune system. Your level is low — take supplements and get morning sunlight daily.",
        },
        {
            "parameter": "Total Iron Binding Capacity (TIBC)",
            "value": "480 µg/dL",
            "normal_range": "250–370 µg/dL",
            "status": "HIGH",
            "simple_name_hindi": "आयरन पकड़ने की क्षमता",
            "simple_name_english": "Iron Binding Capacity",
            "layman_explanation_hindi": "TIBC ज़्यादा होने का मतलब है आपका शरीर और ज़्यादा आयरन अवशोषित करने की कोशिश कर रहा है — यह खून की कमी का एक और संकेत है।",
            "layman_explanation_english": "A high TIBC means your body is desperately trying to grab more iron. It confirms iron-deficiency anaemia.",
        },
        {
            "parameter": "WBC Count",
            "value": "7,200 cells/mcL",
            "normal_range": "4,500–11,000 cells/mcL",
            "status": "NORMAL",
            "simple_name_hindi": "सफेद रक्त कोशिकाएं (प्रतिरोधक क्षमता)",
            "simple_name_english": "White Blood Cells (Immunity)",
            "layman_explanation_hindi": "आपकी रोग प्रतिरोधक क्षमता ठीक है। कोई संक्रमण नहीं दिखता।",
            "layman_explanation_english": "Your immune system is working normally. No sign of infection.",
        },
        {
            "parameter": "Platelet Count",
            "value": "2,45,000 /mcL",
            "normal_range": "1,50,000–4,00,000 /mcL",
            "status": "NORMAL",
            "simple_name_hindi": "प्लेटलेट्स (खून जमाने वाले कण)",
            "simple_name_english": "Platelets (Blood Clotting)",
            "layman_explanation_hindi": "प्लेटलेट्स सामान्य हैं — चोट लगने पर खून जल्दी बंद होगा।",
            "layman_explanation_english": "Platelet count is normal — your blood clotting ability is fine.",
        },
        {
            "parameter": "MCV (Mean Corpuscular Volume)",
            "value": "72 fL",
            "normal_range": "80–100 fL",
            "status": "LOW",
            "simple_name_hindi": "लाल कोशिका का आकार",
            "simple_name_english": "Red Cell Size (MCV)",
            "layman_explanation_hindi": "आपकी लाल रक्त कोशिकाएं सामान्य से छोटी हैं। यह आयरन की कमी की वजह से होता है।",
            "layman_explanation_english": "Your red blood cells are smaller than normal — a classic sign of iron deficiency anaemia.",
        },
    ],
    "affected_organs": ["BLOOD"],
    "overall_summary_hindi": (
        "प्रिया जी, आपकी रिपोर्ट में आयरन की कमी से एनीमिया यानी खून की कमी दिखती है। "
        "यह बहुत आम बीमारी है और सही दवाई और खाने से 2–3 महीनों में ठीक हो जाती है। "
        "घबराने की कोई बात नहीं — डॉक्टर द्वारा बताई गई आयरन की गोलियां लें और पालक, "
        "चना, रागी, बाजरा जैसे भोजन खाएं।"
    ),
    "overall_summary_english": (
        "Priya, your report shows iron-deficiency anaemia — your haemoglobin and iron stores are both low. "
        "This is one of the most common and treatable conditions in India, especially in young women. "
        "With prescribed iron supplements and iron-rich foods like spinach, ragi, and chana dal, "
        "you should see significant improvement within 2–3 months."
    ),
    "severity_level": "MODERATE_CONCERN",
    "next_steps": [
        "Take iron supplements (ferrous sulphate or ferrous ascorbate) as prescribed — take with Vitamin C juice, not milk",
        "Take Vitamin D3 supplement (60,000 IU weekly) as prescribed by your doctor",
        "Eat iron-rich foods daily: palak, methi, chana dal, rajma, bajra, ragi, til",
        "AVOID tea, coffee, and dairy within 1 hour of taking iron tablets — they block absorption",
        "Get 20 minutes of morning sunlight (before 10am) daily for Vitamin D",
        "Repeat CBC and ferritin test after 3 months to track improvement",
    ],
    "dietary_flags": ["INCREASE_IRON", "INCREASE_VITAMIN_D"],
    "exercise_flags": ["LIGHT_WALKING_ONLY"],
    "ai_confidence_score": 94.0,
    "disclaimer": (
        "This analysis is for informational purposes only and does not constitute medical advice. "
        "Please consult a qualified healthcare professional for diagnosis and treatment."
    ),
}


# ─────────────────────────────────────────────────────────────
# MOCK 2 — Fatty Liver + High Cholesterol + Pre-Diabetes (9 findings)
# Great demo: multiple ORANGE/RED rows, LIVER organ glow
# ─────────────────────────────────────────────────────────────
MOCK_REPORT_LIVER = {
    "is_readable": True,
    "report_type": "LAB_REPORT",
    "patient_summary": {
        "name": "Ramesh Gupta",
        "age": 45,
        "gender": "MALE",
        "report_date": "2025-03-10",
    },
    "findings": [
        {
            "parameter": "SGPT / ALT (Liver Enzyme)",
            "value": "92 U/L",
            "normal_range": "7–56 U/L",
            "status": "HIGH",
            "simple_name_hindi": "जिगर एंजाइम (SGPT)",
            "simple_name_english": "Liver Enzyme (ALT/SGPT)",
            "layman_explanation_hindi": "SGPT एक एंजाइम है जो जिगर की कोशिकाओं में होता है। इसका ज़्यादा होना मतलब है जिगर में थोड़ी सूजन है।",
            "layman_explanation_english": "SGPT is an enzyme released when liver cells are damaged or inflamed. Your elevated level suggests fatty liver or mild liver inflammation.",
        },
        {
            "parameter": "SGOT / AST (Liver Enzyme)",
            "value": "68 U/L",
            "normal_range": "10–40 U/L",
            "status": "HIGH",
            "simple_name_hindi": "जिगर एंजाइम (SGOT)",
            "simple_name_english": "Liver Enzyme (AST/SGOT)",
            "layman_explanation_hindi": "SGOT भी जिगर की सूजन का संकेत देता है। दोनों एंजाइम बढ़े होने का मतलब जिगर को ध्यान देने की जरूरत है।",
            "layman_explanation_english": "Both SGOT and SGPT being elevated together is a clear sign of liver stress. Lifestyle changes can reverse this.",
        },
        {
            "parameter": "Total Cholesterol",
            "value": "238 mg/dL",
            "normal_range": "< 200 mg/dL",
            "status": "HIGH",
            "simple_name_hindi": "कुल कोलेस्ट्रॉल",
            "simple_name_english": "Total Cholesterol",
            "layman_explanation_hindi": "आपके खून में चर्बी की कुल मात्रा ज़्यादा है। यह धमनियों में जमा होकर दिल की बीमारी का खतरा बढ़ाती है।",
            "layman_explanation_english": "Your total blood fat is elevated, which increases the risk of heart disease and stroke if not managed.",
        },
        {
            "parameter": "LDL Cholesterol (Bad Cholesterol)",
            "value": "158 mg/dL",
            "normal_range": "< 100 mg/dL",
            "status": "HIGH",
            "simple_name_hindi": "बुरा कोलेस्ट्रॉल (LDL)",
            "simple_name_english": "LDL Bad Cholesterol",
            "layman_explanation_hindi": "LDL को 'बुरा कोलेस्ट्रॉल' कहते हैं क्योंकि यह नसों में जमता है। आपका LDL काफी ज़्यादा है।",
            "layman_explanation_english": "LDL is the 'bad' cholesterol that clogs arteries. Yours is significantly high and needs dietary intervention.",
        },
        {
            "parameter": "HDL Cholesterol (Good Cholesterol)",
            "value": "38 mg/dL",
            "normal_range": "> 40 mg/dL",
            "status": "LOW",
            "simple_name_hindi": "अच्छा कोलेस्ट्रॉल (HDL)",
            "simple_name_english": "HDL Good Cholesterol",
            "layman_explanation_hindi": "HDL 'अच्छा कोलेस्ट्रॉल' है जो खराब कोलेस्ट्रॉल को साफ करता है। आपका HDL थोड़ा कम है।",
            "layman_explanation_english": "HDL is the 'good' cholesterol that cleans arteries. Low HDL combined with high LDL doubles the risk for heart disease.",
        },
        {
            "parameter": "Triglycerides",
            "value": "210 mg/dL",
            "normal_range": "< 150 mg/dL",
            "status": "HIGH",
            "simple_name_hindi": "ट्राइग्लिसराइड्स (खून में वसा)",
            "simple_name_english": "Triglycerides (Blood Fat)",
            "layman_explanation_hindi": "ट्राइग्लिसराइड्स खून में एक और प्रकार की चर्बी है। इसका ज़्यादा होना फैटी लिवर और दिल की बीमारी दोनों का संकेत है।",
            "layman_explanation_english": "Triglycerides are blood fats that spike from excess sugar and refined carbs. Your elevated level is likely contributing to your fatty liver.",
        },
        {
            "parameter": "Fasting Blood Glucose",
            "value": "108 mg/dL",
            "normal_range": "70–99 mg/dL",
            "status": "HIGH",
            "simple_name_hindi": "खाली पेट रक्त शर्करा",
            "simple_name_english": "Fasting Blood Sugar",
            "layman_explanation_hindi": "आपकी खाली पेट शुगर थोड़ी बढ़ी हुई है — इसे 'प्री-डायबिटीज़' कहते हैं। अभी से सावधानी बरतें तो डायबिटीज़ से बचा जा सकता है।",
            "layman_explanation_english": "Your fasting sugar is in the pre-diabetes range. With diet and exercise changes now, you can prevent full diabetes from developing.",
        },
        {
            "parameter": "HbA1c (3-Month Sugar Average)",
            "value": "6.1%",
            "normal_range": "< 5.7% (Normal) | 5.7–6.4% (Pre-diabetes)",
            "status": "HIGH",
            "simple_name_hindi": "3 महीने की औसत शुगर (HbA1c)",
            "simple_name_english": "3-Month Blood Sugar Average",
            "layman_explanation_hindi": "HbA1c पिछले 3 महीनों की औसत शुगर बताता है। आपका 6.1% प्री-डायबिटीज़ ज़ोन में है।",
            "layman_explanation_english": "HbA1c shows your average blood sugar over 3 months — not just today. At 6.1%, you are in the pre-diabetes zone.",
        },
        {
            "parameter": "Serum Bilirubin (Total)",
            "value": "0.9 mg/dL",
            "normal_range": "0.2–1.2 mg/dL",
            "status": "NORMAL",
            "simple_name_hindi": "बिलिरुबिन (पित्त रंगद्रव्य)",
            "simple_name_english": "Bilirubin (Bile Pigment)",
            "layman_explanation_hindi": "बिलिरुबिन सामान्य है — जिगर अभी भी पित्त को ठीक से बाहर निकाल रहा है। कोई पीलिया नहीं है।",
            "layman_explanation_english": "Bilirubin is normal — your liver is still processing bile correctly and there is no jaundice.",
        },
    ],
    "affected_organs": ["LIVER"],
    "overall_summary_hindi": (
        "रमेश जी, आपकी रिपोर्ट में फैटी लिवर, बढ़ा हुआ कोलेस्ट्रॉल, और प्री-डायबिटीज़ के संकेत हैं। "
        "घबराएं नहीं — यह सब खान-पान और व्यायाम में बदलाव से 3 महीने में काफी सुधर सकता है। "
        "तला हुआ खाना, मैदा, और मीठे पेय बिल्कुल बंद करें और रोज़ 30 मिनट पैदल चलें।"
    ),
    "overall_summary_english": (
        "Ramesh, your report shows early fatty liver disease, elevated cholesterol, and pre-diabetes. "
        "The good news: all three conditions are fully reversible at this stage with lifestyle changes. "
        "Cut out fried foods, maida, and sugary drinks, walk 30 minutes daily, and these numbers "
        "can return to normal within 3 months."
    ),
    "severity_level": "MILD_CONCERN",
    "next_steps": [
        "Stop all fried, oily, and ultra-processed foods immediately — this is the single most important change",
        "Walk 30 minutes every day at a comfortable pace — this alone improves liver and sugar levels",
        "Eliminate sugary beverages: cold drinks, packaged juices, chai with excess sugar",
        "Eat bitter gourd (karela), methi, and garlic — proven to lower liver enzymes and sugar",
        "Get HbA1c, LFT, and lipid profile retested in 3 months to track improvement",
        "Discuss statin medication for cholesterol with your doctor if diet changes are not enough",
    ],
    "dietary_flags": ["AVOID_FATTY_FOODS", "REDUCE_SUGAR", "REDUCE_SODIUM"],
    "exercise_flags": ["NORMAL_ACTIVITY"],
    "ai_confidence_score": 91.0,
    "disclaimer": (
        "This analysis is for informational purposes only and does not constitute medical advice. "
        "Please consult a qualified healthcare professional."
    ),
}


# ─────────────────────────────────────────────────────────────
# MOCK 3 — Critical Vitamin D + Hypothyroidism + Low Calcium (7 findings)
# Great demo: CRITICAL badge on Vit D, SYSTEMIC body glow
# ─────────────────────────────────────────────────────────────
MOCK_REPORT_VITAMIN_D = {
    "is_readable": True,
    "report_type": "LAB_REPORT",
    "patient_summary": {
        "name": "Sunita Patel",
        "age": 38,
        "gender": "FEMALE",
        "report_date": "2025-03-18",
    },
    "findings": [
        {
            "parameter": "25-OH Vitamin D (Serum)",
            "value": "9.4 ng/mL",
            "normal_range": "30–100 ng/mL",
            "status": "CRITICAL",
            "simple_name_hindi": "विटामिन डी",
            "simple_name_english": "Vitamin D",
            "layman_explanation_hindi": "आपके शरीर में विटामिन डी बहुत ही कम है — यह खतरे के निशान से भी नीचे है। इससे हड्डियों में दर्द, थकान, और कमज़ोर प्रतिरक्षा होती है।",
            "layman_explanation_english": "Your Vitamin D is critically low — well below even the deficient range. This causes bone pain, extreme fatigue, muscle weakness, and poor immunity.",
        },
        {
            "parameter": "Serum Calcium",
            "value": "7.9 mg/dL",
            "normal_range": "8.5–10.5 mg/dL",
            "status": "LOW",
            "simple_name_hindi": "कैल्शियम (हड्डियों की मजबूती)",
            "simple_name_english": "Calcium (Bone Strength)",
            "layman_explanation_hindi": "कैल्शियम हड्डियों और दांतों को मजबूत रखता है। आपका स्तर कम है — यह विटामिन डी की कमी की वजह से है क्योंकि डी के बिना कैल्शियम अवशोषित नहीं होता।",
            "layman_explanation_english": "Calcium keeps bones and teeth strong. Your level is low partly because Vitamin D is needed to absorb calcium — one deficiency causes the other.",
        },
        {
            "parameter": "TSH (Thyroid Stimulating Hormone)",
            "value": "7.2 mIU/L",
            "normal_range": "0.4–4.0 mIU/L",
            "status": "HIGH",
            "simple_name_hindi": "थायरॉइड हार्मोन (TSH)",
            "simple_name_english": "Thyroid Hormone (TSH)",
            "layman_explanation_hindi": "TSH ज़्यादा होने का मतलब है आपकी थायरॉइड ग्रंथि धीरे काम कर रही है — इसे हाइपोथायरॉइडिज्म कहते हैं। इससे वजन बढ़ना, थकान, और ठंड ज़्यादा लगना होता है।",
            "layman_explanation_english": "High TSH means your thyroid gland is underactive (hypothyroidism). This causes weight gain, fatigue, cold intolerance, and dry skin — many of your symptoms may be from this.",
        },
        {
            "parameter": "Free T4 (Thyroxine)",
            "value": "0.7 ng/dL",
            "normal_range": "0.8–1.8 ng/dL",
            "status": "LOW",
            "simple_name_hindi": "T4 हार्मोन (थायरॉइड)",
            "simple_name_english": "Thyroid T4 Hormone",
            "layman_explanation_hindi": "T4 थायरॉइड का मुख्य हार्मोन है। यह कम है — इसका मतलब थायरॉइड पर्याप्त हार्मोन नहीं बना रही।",
            "layman_explanation_english": "T4 is the main hormone made by your thyroid. A low level confirms hypothyroidism — your doctor will likely prescribe Levothyroxine.",
        },
        {
            "parameter": "Serum Phosphorus",
            "value": "2.3 mg/dL",
            "normal_range": "2.5–4.5 mg/dL",
            "status": "LOW",
            "simple_name_hindi": "फास्फोरस",
            "simple_name_english": "Phosphorus (Bone Mineral)",
            "layman_explanation_hindi": "फास्फोरस हड्डियों के निर्माण में कैल्शियम के साथ काम करता है। यह कम होना विटामिन डी की कमी का और एक असर है।",
            "layman_explanation_english": "Phosphorus works with calcium for bone structure. Low phosphorus alongside low calcium confirms that your bones are not getting the minerals they need.",
        },
        {
            "parameter": "Haemoglobin",
            "value": "11.4 g/dL",
            "normal_range": "12.0–16.0 g/dL",
            "status": "LOW",
            "simple_name_hindi": "हीमोग्लोबिन (खून)",
            "simple_name_english": "Haemoglobin (Blood)",
            "layman_explanation_hindi": "हीमोग्लोबिन थोड़ा कम है — यह हाइपोथायरॉइडिज्म की वजह से हो सकता है। थायरॉइड का इलाज होने पर यह खुद ठीक हो जाता है।",
            "layman_explanation_english": "Your haemoglobin is mildly low. This is commonly seen with hypothyroidism and Vitamin D deficiency and usually improves once those are treated.",
        },
        {
            "parameter": "Random Blood Sugar",
            "value": "94 mg/dL",
            "normal_range": "70–140 mg/dL",
            "status": "NORMAL",
            "simple_name_hindi": "रक्त शर्करा (शुगर)",
            "simple_name_english": "Blood Sugar (Glucose)",
            "layman_explanation_hindi": "आपकी शुगर बिल्कुल सामान्य है — कोई मधुमेह नहीं।",
            "layman_explanation_english": "Your blood sugar is completely normal — no sign of diabetes.",
        },
    ],
    "affected_organs": ["SYSTEMIC"],
    "overall_summary_hindi": (
        "सुनीता जी, आपकी रिपोर्ट में विटामिन डी की गंभीर कमी, हाइपोथायरॉइडिज्म (थायरॉइड की कमी), "
        "और कैल्शियम की कमी दिखती है। ये तीनों मिलकर आपकी थकान, हड्डियों में दर्द, और वजन बढ़ने "
        "की वजह हैं। डॉक्टर से मिलें — सही दवाई और सप्लीमेंट से आप 3–6 महीनों में बहुत बेहतर महसूस करेंगी।"
    ),
    "overall_summary_english": (
        "Sunita, your report reveals critical Vitamin D deficiency, hypothyroidism (underactive thyroid), "
        "and low calcium — a trio that often appear together and explain your fatigue, bone pain, "
        "and weight changes. The great news is all three are very treatable with the right medications "
        "and supplements. See your doctor soon to start treatment."
    ),
    "severity_level": "MODERATE_CONCERN",
    "next_steps": [
        "See your doctor urgently for Vitamin D3 injection or high-dose weekly supplement (60,000 IU/week)",
        "Start Levothyroxine (thyroid hormone tablet) as prescribed — take on empty stomach every morning",
        "Take calcium + Vitamin D3 combination supplement daily as prescribed",
        "Spend 20–30 minutes in morning sunlight (before 10am) every day — do not skip",
        "Eat calcium-rich foods: ragi, sesame seeds (til), milk, drumstick leaves (sahjan), almonds",
        "Retest TSH, Vitamin D, and calcium after 8 weeks of treatment",
    ],
    "dietary_flags": ["INCREASE_VITAMIN_D", "INCREASE_CALCIUM", "INCREASE_PROTEIN"],
    "exercise_flags": ["LIGHT_WALKING_ONLY"],
    "ai_confidence_score": 96.0,
    "disclaimer": (
        "This analysis is for informational purposes only and does not constitute medical advice. "
        "Consult your doctor before starting any supplements or medications."
    ),
}