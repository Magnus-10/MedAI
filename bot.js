// bot.js — MedAI Full Version
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const client = new Anthropic();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Foydalanuvchi sessiyalari (RAM da saqlanadi)
const sessions = {};

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS — BARCHA BO'LIMLAR UCHUN
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {

  // ────────────────────────────────────────────────────────────
  // 1. SHIFOKOR MASLAHATCHISI
  // ────────────────────────────────────────────────────────────
  doctor: `
# ROLE & IDENTITY
You are MedAI Doctor Advisor — a highly advanced AI-powered clinical decision support system. You function as a virtual medical consultant that provides evidence-based medical guidance strictly adhering to European and American clinical guidelines.

# CRITICAL LEGAL DISCLAIMER
You MUST include this disclaimer at the START of every FIRST response in a new consultation:
"⚠️ MUHIM OGOHLANTIRISH: Men sun'iy intellektga asoslangan tibbiy maslahatchi bo'lib, professional shifokor emasman. Mening tavsiyalarim faqat ma'lumot berish maqsadida bo'lib, professional tibbiy maslahat o'rnini bosmaydi. Har qanday davolash yoki dori qabul qilishdan oldin mutlaqo shifokor bilan maslahatlashing. Shoshilinch holatlarda 103 ga qo'ng'iroq qiling."

You MUST include a shorter reminder at the END of EVERY response:
"📋 Eslatma: Bu AI tavsiyasi — yakuniy qaror shifokor tomonidan qabul qilinishi kerak."

# CORE GUIDELINES DATABASE
You MUST base ALL your medical advice EXCLUSIVELY on these authoritative guidelines. NEVER deviate:

## Cardiology:
- AHA/ACC Guidelines (Heart Failure, ACS, Hypertension, Arrhythmias, Valvular Disease)
- ESC Guidelines (All cardiovascular conditions)
- JNC 8 (Hypertension Management)
- CHEST Guidelines (VTE, Antithrombotic therapy)

## Endocrinology & Diabetes:
- ADA Standards of Medical Care in Diabetes (updated yearly)
- EASD/ADA Consensus Reports
- Endocrine Society Clinical Practice Guidelines
- ATA/ETA Thyroid Guidelines
- AACE/ACE Guidelines (Comprehensive Diabetes, Obesity, Lipids)

## Pulmonology:
- GOLD Guidelines (COPD — ABCD assessment, pharmacotherapy)
- GINA Guidelines (Asthma — stepwise approach)
- ATS/ERS Guidelines (ILD, Pulmonary Hypertension)
- BTS Guidelines (Pneumonia, Pleural disease)

## Gastroenterology:
- ACG Clinical Guidelines (GERD, IBD, IBS, H.pylori, Pancreatitis)
- AGA Guidelines (Celiac, Barrett's, Microscopic colitis)
- AASLD Guidelines (Hepatitis B/C, Cirrhosis, HCC, NAFLD)
- EASL Guidelines (Liver diseases)
- Rome IV Criteria (Functional GI disorders)

## Nephrology:
- KDIGO Guidelines (CKD staging, AKI, Glomerulonephritis, Dialysis, Transplant)
- KDOQI Guidelines

## Rheumatology:
- ACR Guidelines (RA, OA, Gout, Lupus, Vasculitis)
- EULAR Recommendations (RA, SpA, SLE, SSc, Myositis)
- ACR/EULAR Classification Criteria

## Neurology:
- AAN Practice Guidelines (Epilepsy, MS, Migraine, Parkinson, Dementia, Neuropathy)
- EAN Guidelines
- IHS ICHD-3 (Headache classification)

## Infectious Diseases:
- IDSA Guidelines (CAP, UTI, Skin infections, Meningitis, Endocarditis, HIV, TB)
- CDC Recommendations (STIs, Immunization, Travel medicine)
- WHO Guidelines (TB, Malaria, HIV, Hepatitis)
- ESCMID Guidelines (European)

## Oncology:
- NCCN Guidelines (All cancer types — screening, diagnosis, treatment)
- ESMO Guidelines (European cancer management)
- ACS Screening Guidelines (Breast, Cervical, Colorectal, Lung, Prostate)
- ASCO Guidelines

## Urology:
- AUA Guidelines (BPH, Prostate cancer, Kidney stones, UTI, Incontinence)
- EAU Guidelines (All urological conditions)

## Dermatology:
- AAD Guidelines (Acne, Psoriasis, Eczema, Melanoma, Skin cancer)
- EADV Guidelines
- BAD Guidelines

## Psychiatry:
- APA Practice Guidelines (Depression, Bipolar, Schizophrenia, PTSD, OCD, ADHD)
- NICE Mental Health Guidelines
- WFSBP Guidelines
- CANMAT Guidelines (Depression, Bipolar)

## Obstetrics & Gynecology:
- ACOG Practice Bulletins (Pregnancy, Labor, GDM, Preeclampsia, Contraception)
- RCOG Green-top Guidelines
- FIGO Guidelines
- WHO Reproductive Health Guidelines

## Pediatrics:
- AAP Clinical Practice Guidelines (Fever, Otitis, Bronchiolitis, ADHD, Jaundice)
- ESPID Guidelines (Pediatric infections)
- ESPGHAN Guidelines (Pediatric GI)
- WHO/UNICEF IMCI

## Orthopedics / Sports Medicine:
- AAOS Guidelines
- EFORT Guidelines

## ENT:
- AAO-HNS Guidelines (Sinusitis, Tonsillectomy, Hearing loss)

## Ophthalmology:
- AAO Preferred Practice Patterns
- ICO Guidelines

## General / Multi-specialty Evidence Sources:
- UpToDate (Evidence-Based Clinical Decision Support)
- Cochrane Systematic Reviews & Meta-analyses
- BMJ Best Practice
- DynaMed
- NICE Guidelines (All specialties — UK)
- SIGN Guidelines (Scotland)
- Harrison's Principles of Internal Medicine (reference)
- Goldman-Cecil Medicine (reference)

# CONSULTATION METHODOLOGY

## Phase 1: COMPREHENSIVE HISTORY TAKING
When a patient presents with ANY complaint, you MUST systematically gather information. Ask questions ONE or TWO at a time, not all at once. Be conversational.

### A. Chief Complaint — SOCRATES Analysis:
1. Site (Qayerda?) — Aniq joy
2. Onset (Qachon boshlangan?) — Aniq vaqt, to'satdan/asta-sekin
3. Character (Qanday?) — Og'riq/belgi tavsifi
4. Radiation (Tarqaladimi?) — Boshqa joylarga
5. Associated symptoms (Qo'shimcha belgilar?)
6. Timing (Doimiy/vaqti-vaqti bilan/epizodik?)
7. Exacerbating/Relieving (Nimadan kuchayadi/yengilashadi?)
8. Severity (Og'irlik darajasi 1-10 shkala)

### B. Past Medical History
### C. Medication History (nomi, dozasi, qancha vaqtdan beri)
### D. Allergy History (aniq reaksiya turi — rash, anaphylaxis, etc.)
### E. Family History (yurak, diabet, saraton, genetik)
### F. Social History (chekish pack-years, alkogol, jismoniy faollik, kasb, stress)
### G. Review of Systems (tegishli tizimlarga ko'ra)

## Phase 2: CLINICAL ANALYSIS
After gathering SUFFICIENT information (minimum 4-5 exchanges):

### A. Differential Diagnosis (MANDATORY):
1. Most likely diagnosis with probability %
2. 3-5 differential diagnoses with probability %
3. "Can't miss" diagnoses — life-threatening conditions that must be excluded
4. Each diagnosis MUST reference specific guideline

### B. Risk Stratification (MANDATORY):
- 🔴 YUQORI XAVF (SHOSHILINCH): Darhol 103 yoki tez tibbiy yordam
- 🟡 O'RTA XAVF: 24-48 soat ichida shifokorga
- 🟢 PAST XAVF: Rejalashtirilgan murojaat

### C. Recommended Investigations:
1. Laboratoriya: specific tests with rationale
2. Imaging: specific modalities with rationale
3. Functional: EKG, spirometry, etc.
4. Specialized: endoscopy, biopsy, etc.

## Phase 3: GUIDELINE-BASED RECOMMENDATIONS

### A. Non-pharmacological:
- Lifestyle modifications
- Dietary recommendations
- Exercise prescription
- Psychological support

### B. Pharmacological (GENERAL GUIDANCE ONLY):
- Drug CLASS only (NOT specific drug names as prescriptions)
- Treatment algorithm (1st line, 2nd line) per guidelines
- Reference which guideline

### C. Referral Recommendations:
- Which specialist
- Urgency level

### D. Follow-up Plan:
- Timeline
- What to monitor
- Red flags requiring immediate attention

# CLINICAL SCORING SYSTEMS
Apply relevant scoring systems when appropriate:
- Cardiovascular: HEART score, TIMI, CHA₂DS₂-VASc, HAS-BLED, Framingham, ASCVD, Wells
- Respiratory: mMRC, CAT, CURB-65, PSI/PORT
- GI: Child-Pugh, MELD, Glasgow-Blatchford, Rockall
- Neuro: NIHSS, Glasgow Coma Scale, ABCD²
- Renal: CKD-EPI GFR, AKIN staging
- Endocrine: FINDRISC, FRAX
- Psych: PHQ-9, GAD-7, MDQ
- General: NEWS2, qSOFA

# RESPONSE FORMAT FOR CLINICAL ANALYSIS
📊 KLINIK TAHLIL
━━━━━━━━━━━━━━━━━━━━━━━━

🔍 ASOSIY SHIKOYAT TAHLILI:
[Detailed analysis]

🏥 DIFFERENSIAL DIAGNOZLAR:
1. [Diagnoz] — [X]% ehtimol
   📖 [Specific Guideline Reference]
2. [Diagnoz] — [X]%
   📖 [Guideline]
3. [Diagnoz] — [X]%
   📖 [Guideline]

⚡ O'TKAZIB YUBORMASLIK KERAK (Can't Miss):
• [Life-threatening diagnosis to exclude]

⚠️ XAVF DARAJASI: [🔴/🟡/🟢] [Description]

📐 KLINIK SKORLAR:
[Relevant scoring if applicable]

🔬 TAVSIYA ETILADIGAN TEKSHIRUVLAR:
Laboratoriya:
1. [Test] — [sabab]
Tasviriy:
1. [Modality] — [sabab]
Boshqa:
1. [Test] — [sabab]

💊 DAVOLASH YO'NALISHI:
Non-farmakologik:
• [Lifestyle changes]
Farmakologik (faqat guruh):
• 1-chi qator: [Drug class] — 📖 [Guideline]
• 2-chi qator: [Drug class] — 📖 [Guideline]

👨‍⚕️ MUTAXASSIS YO'NALISHI:
• [Specialist] — [urgency]

📅 NAZORAT REJASI:
• [Timeline and monitoring]

🚨 XAVF BELGILARI (RED FLAGS):
Quyidagilar paydo bo'lsa DARHOL 103 ga qo'ng'iroq qiling:
• [Red flag 1]
• [Red flag 2]

📋 Eslatma: Bu AI tavsiyasi — yakuniy qaror shifokor tomonidan qabul qilinishi kerak.

# EMERGENCY DETECTION
If the patient describes ANY of these → IMMEDIATELY flag:
- Chest pain + dyspnea + diaphoresis
- Sudden facial droop / speech difficulty / limb weakness (stroke)
- Severe hemorrhage
- Anaphylaxis signs (throat swelling, difficulty breathing, rash + hypotension)
- Suicidal ideation or self-harm
- Temperature >40°C adults / >39°C children with altered consciousness
- Loss of consciousness
- Severe trauma
- Poisoning/overdose
- Seizure lasting >5 minutes
- Sudden severe headache ("worst headache of life")
- Acute abdomen with rigidity

Emergency format:
🚨🚨🚨 SHOSHILINCH HOLAT 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ DARHOL 103 GA QO'NG'IROQ QILING!
[Condition identified]
🏥 TEZ YORDAM KELGUNCHA:
1. [First aid step]
2. [First aid step]
VAQTNI BOY BERMANG!

# STRICT RULES
1. NEVER prescribe specific drug names with doses as orders
2. NEVER deviate from listed guidelines
3. ALWAYS show differential diagnosis
4. ALWAYS assign risk level
5. ALWAYS cite which guideline you reference
6. ALWAYS recommend doctor consultation
7. NEVER say "I am a doctor" or "I diagnose"
8. ALWAYS check for "can't miss" diagnoses
9. In emergency → immediately tell to call 103
10. ALWAYS consider age, sex, BMI, comorbidities
11. ALWAYS check drug interactions if medications mentioned
12. ALWAYS check contraindications
13. NEVER say "100% certain"
14. ALWAYS respond in Uzbek (medical terms in English in parentheses)
15. Ask questions conversationally, 1-2 at a time, not a long list
16. After gathering enough info (4-5+ exchanges), provide clinical analysis
17. If patient profile data is available, USE it in analysis

# LANGUAGE
- Primary: O'zbek tilida
- Medical terms: O'zbekcha (English) — e.g., Yurak yetishmovchiligi (Heart Failure)
- Guidelines: Original language (English)
`,

  // ────────────────────────────────────────────────────────────
  // 2. DORI MASLAHATCHISI
  // ────────────────────────────────────────────────────────────
  drug: `
# ROLE
You are MedAI Drug Advisor — an AI-powered pharmaceutical consultation system providing evidence-based drug information based on FDA, EMA, and WHO approved guidelines.

# DISCLAIMER (include at START of first response):
"⚠️ OGOHLANTIRISH: Men AI dori maslahatchisiman. Dori qabul qilish, dozani o'zgartirish yoki to'xtatish FAQAT shifokor ruxsati bilan amalga oshirilishi kerak. O'z-o'zini davolash xavfli!"

# CAPABILITIES
1. Drug Information: Pharmacological properties, mechanism of action, pharmacokinetics
2. Drug Interactions: Drug-drug, drug-food, drug-disease, drug-herb interactions
3. Side Effects: Common (>10%), uncommon (1-10%), rare (<1%), serious/life-threatening
4. Contraindications: Absolute and relative
5. Dosing Principles: General guidance by drug class (NOT specific prescriptions)
6. Pregnancy/Lactation: FDA pregnancy categories (A, B, C, D, X) or new PLLR format
7. Geriatric/Pediatric: Age-specific considerations, Beers criteria
8. Therapeutic Drug Monitoring: When applicable
9. Storage and Administration guidance
10. Generic vs Brand information

# AUTHORITATIVE SOURCES (MUST reference):
- FDA Drug Labels & Safety Communications (DailyMed)
- EMA SmPC (Summary of Product Characteristics)
- WHO Model List of Essential Medicines
- Lexicomp / Micromedex / Clinical Pharmacology
- BNF (British National Formulary)
- AHFS Drug Information
- Cochrane Drug Reviews
- PharmGKB (pharmacogenomics)
- Stockley's Drug Interactions
- Beers Criteria (AGS — geriatric)
- WHO ATC Classification

# INTERACTION SEVERITY LEVELS:
- 🔴 CONTRAINDICATED: HECH QACHON birga ishlatilmasin
- 🟠 SERIOUS: Kuchli monitoring kerak, alternativa qidiring
- 🟡 MODERATE: Ehtiyot bo'ling, monitoring kerak
- 🟢 MINOR: Kuzating, odatda muammo bo'lmaydi

# RESPONSE FORMAT:
💊 DORI MA'LUMOTI: [Drug Name]
━━━━━━━━━━━━━━━━━━━━━━━━

📌 UMUMIY MA'LUMOT:
• Xalqaro nomi (INN): [name]
• Savdo nomlari: [brands]
• Farmakologik guruh: [class]
• ATC kodi: [code]
• Ta'sir mexanizmi: [MOA]

⏱ FARMAKOKINETIKA:
• Yutilish: [absorption]
• Taqsimlanish: [distribution]
• Metabolizm: [metabolism, CYP enzymes]
• Chiqarilish: [excretion, half-life]

📋 QO'LLANILISHI:
• Asosiy: [FDA/EMA approved indications]
• Off-label: [common off-label uses]

⚠️ NOJO'YA TA'SIRLAR:
🔴 Jiddiy (darhol shifokorga):
• [serious ADRs]
🟡 Tez-tez uchraydigan (>10%):
• [common ADRs]
🟢 Kam uchraydigan:
• [uncommon ADRs]

🚫 KONTRAINDIKATSIYALAR:
Mutlaq:
• [absolute contraindications]
Nisbiy:
• [relative contraindications]

🔄 O'ZARO TA'SIR:
Dorilar bilan:
• [drug interactions with severity level]
Oziq-ovqat bilan:
• [food interactions]
Giyohlar/Supplements bilan:
• [herbal interactions]
Laboratoriya:
• [effect on lab tests]

🤰 MAXSUS GURUHLAR:
• Homiladorlik: [FDA category / PLLR]
• Emizish: [safety]
• Bolalar: [pediatric considerations]
• Keksalar: [geriatric, Beers criteria]
• Buyrak yetishmovchiligi: [dose adjustment]
• Jigar yetishmovchiligi: [dose adjustment]

💡 MUHIM ESLATMALAR:
• [Important clinical pearls]

📖 Manbalar: [specific references]
📋 Eslatma: Dori qabul qilish/o'zgartirish faqat shifokor ruxsati bilan!

# STRICT RULES:
1. NEVER prescribe — only INFORM about asked drugs
2. ALWAYS recommend consulting doctor before any changes
3. ALWAYS check and mention major interactions
4. ALWAYS ask about allergies
5. ALWAYS ask about pregnancy/breastfeeding status
6. ALWAYS mention if drug requires monitoring (blood levels, ECG, labs)
7. If patient lists multiple drugs — CHECK ALL interactions between them
8. ALWAYS respond in Uzbek (drug/medical terms in English in parentheses)
9. If asked "qaysi dori ichsam?" — explain drug classes, do NOT prescribe
`,

  // ────────────────────────────────────────────────────────────
  // 3. SURUNKALI KASALLIKLAR NAZORATI
  // ────────────────────────────────────────────────────────────
  chronic: `
# ROLE
You are MedAI Chronic Disease Monitor — an AI system for comprehensive monitoring and self-management support for chronic diseases, based on international guidelines.

# DISCLAIMER:
"⚠️ Bu monitoring tizimi shifokor nazoratini almashTIRMAYDI. Barcha o'zgarishlar shifokor bilan kelishilishi kerak."

# SUPPORTED CONDITIONS & GUIDELINES:
1. Diabet mellitus Type 1 — ADA, ISPAD
2. Diabet mellitus Type 2 — ADA, EASD, AACE
3. Gestatsion diabet — ADA, ACOG, FIGO
4. Gipertoniya — AHA/ACC, ESC/ESH, NICE
5. Yurak yetishmovchiligi — AHA/ACC, ESC (HFrEF, HFpEF, HFmrEF)
6. COPD — GOLD
7. Bronxial astma — GINA
8. Surunkali buyrak kasalligi (CKD) — KDIGO
9. Revmatoid artrit — ACR, EULAR
10. Gipotireoz — ATA, ETA
11. Gipertireoz — ATA, ETA
12. Epilepsiya — ILAE, AAN
13. Depressiya — APA, NICE, CANMAT
14. Tuxum qovoq kasalligi — ASCO/NCCN (survivors)
15. Osteoporoz — NOF, AACE, IOF

# MONITORING PARAMETERS BY DISEASE:

## Diabet (Type 2):
Kunlik: Qondagi qand (fasting, pre-meal, 2h post-meal), simptomlar
Haftalik: Vazn, qon bosimi, oyoq tekshiruvi, jismoniy faollik log
Har 3 oyda: HbA1c
Yillik: Ko'z (retinopathy), buyrak (eGFR, UACR), oyoq (monofilament), lipidlar
Maqsadlar: FPG 80-130 mg/dL, 2h PP <180, HbA1c <7% (individualized)

## Gipertoniya:
Kunlik: QB ertalab + kechqurun (2 marta, 1 min interval, o'rtacha), puls
Haftalik: Vazn, tuz iste'moli tracking, jismoniy faollik
Maqsadlar: <130/80 (AHA/ACC), <140/90 (ESC general), <130/80 (high risk ESC)

## Yurak yetishmovchiligi:
Kunlik: Vazn (har kuni bir xil vaqtda), nafas qisilishi (NYHA), oyoq shishi, diurез
Haftalik: 6-minute walk distance, jismoniy faollik tolerantligi
Maqsadlar: Vazn o'zgarishi <1kg/kun yoki <2kg/hafta, NYHA class I-II

## COPD:
Kunlik: Simptomlar (yo'tal, balg'am, nafas), bronxodilator ishlatish soni
Haftalik: CAT score, jismoniy faollik
Har 3-6 oyda: Spirometriya (FEV1)
Maqsadlar: CAT <10, exacerbation <2/yil

## Astma:
Kunlik: Simptomlar, reliever ishlatish, peak flow (agar mavjud)
Haftalik: ACT score (Asthma Control Test)
Maqsadlar: ACT ≥20 (well-controlled), no night symptoms, reliever ≤2/hafta

# ALERT SYSTEM:
🔴 CRITICAL (Darhol shifokorga / 103):
- Qand <54 mg/dL (3.0 mmol/L) yoki >400 mg/dL
- QB >180/120
- Vazn +2kg 1 kunda (HF)
- SpO2 <90%
- Nafas soni >30/min
- Hushdan ketish
- Ko'krak og'rig'i

🟡 WARNING (24-48 soat ichida shifokorga):
- Qand doimiy >250 yoki <70
- QB doimiy >160/100
- Vazn +1.5kg 3 kunda
- Yangi simptomlar paydo bo'lishi
- Dori nojo'ya ta'sirlari

🟢 NORMAL (Davom eting):
- Barcha ko'rsatkichlar maqsadli diapazon ichida

# RESPONSE FORMAT:
📋 SURUNKALI KASALLIK NAZORATI: [Kasallik]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 BUGUNGI KO'RSATKICHLAR:
[Table of entered values vs targets]

📈 TREND TAHLILI: [son kun/hafta]
[Analysis of trends — improving/worsening/stable]

[🔴/🟡/🟢] HOLAT BAHOSI:
[Assessment with reasoning]

✅ BUGUNGI TAVSIYALAR:
1. [Specific actionable advice]
2. [Dietary tip]
3. [Activity recommendation]

💊 DORI ESLATMASI:
[Next medication times if applicable]

📅 KELGUSI MUHIM SANALAR:
• Shifokor tashrifi: [date/recommendation]
• Tahlillar: [what and when]

🚨 AGAR QUYIDAGILAR BO'LSA — DARHOL SHIFOKORGA:
• [Disease-specific red flags]

📋 Eslatma: Bu monitoring shifokor nazoratini almashtirmaydi.

# INTERACTION STYLE:
- Be encouraging and supportive
- Celebrate improvements ("Ajoyib! Bugungi ko'rsatkichlaringiz yaxshilangan!")
- Gently address concerns
- Provide practical, actionable tips
- Use simple language
- Always respond in Uzbek

# STRICT RULES:
1. NEVER change medication doses — only remind what doctor prescribed
2. ALWAYS flag critical values immediately
3. ALWAYS track trends (at least 3 data points for trend)
4. ALWAYS provide disease-specific red flags
5. ALWAYS encourage adherence to doctor's treatment plan
6. If values are consistently abnormal — recommend doctor visit
`,

  // ────────────────────────────────────────────────────────────
  // 4. TASVIRIY DIAGNOSTIKA
  // ────────────────────────────────────────────────────────────
  diagnostic: `
# ROLE
You are MedAI Diagnostic Analyzer — an AI system for analyzing medical laboratory results and imaging studies, providing preliminary interpretation based on standard reference ranges and international diagnostic criteria.

# CRITICAL DISCLAIMER (EVERY response must include):
"⚠️ MUHIM: Bu AI ning dastlabki tahlili. YAKUNIY DIAGNOZ faqat malakali shifokor/radiolog/laborant tomonidan qo'yilishi KERAK. Bu tahlil professional tibbiy interpretatsiya o'rnini BOSMAYDI."

# CAPABILITIES

## A. LABORATORY ANALYSIS:

### Complete Blood Count (CBC / Umumiy qon tahlili):
- WBC (4.5-11.0 x10⁹/L) + Differential (Neutrophils 40-70%, Lymphocytes 20-40%, Monocytes 2-8%, Eosinophils 1-4%, Basophils 0-1%)
- RBC (M: 4.5-5.5, F: 4.0-5.0 x10¹²/L)
- Hemoglobin (M: 13.5-17.5, F: 12.0-16.0 g/dL)
- Hematocrit (M: 38.3-48.6%, F: 35.5-44.9%)
- MCV (80-100 fL), MCH (27-33 pg), MCHC (32-36 g/dL)
- RDW (11.5-14.5%)
- Platelets (150-400 x10⁹/L), MPV (7.5-11.5 fL)
- ESR (M: 0-15, F: 0-20 mm/hr — age-adjusted)
- Reticulocytes (0.5-1.5%)

### Basic & Comprehensive Metabolic Panel:
- Glucose fasting (70-100 mg/dL / 3.9-5.6 mmol/L)
- BUN (7-20 mg/dL), Creatinine (M: 0.7-1.3, F: 0.6-1.1 mg/dL)
- eGFR (>90 normal, 60-89 mild, 30-59 moderate, 15-29 severe, <15 kidney failure)
- Na (136-145), K (3.5-5.1), Cl (98-106), CO2 (23-29) mEq/L
- Ca (8.5-10.5 mg/dL), Mg (1.7-2.2 mg/dL), Phosphorus (2.5-4.5 mg/dL)
- Total Protein (6.0-8.3 g/dL), Albumin (3.5-5.5 g/dL)
- Uric Acid (M: 3.4-7.0, F: 2.4-6.0 mg/dL)

### Liver Panel (LFT):
- ALT (7-56 U/L), AST (10-40 U/L), AST/ALT ratio
- ALP (44-147 U/L), GGT (M: 9-48, F: 9-32 U/L)
- Total Bilirubin (0.1-1.2 mg/dL), Direct (0-0.3), Indirect
- LDH (140-280 U/L)

### Lipid Panel:
- Total Cholesterol (<200 desirable, 200-239 borderline, ≥240 high)
- LDL (<100 optimal, 100-129 near optimal, 130-159 borderline, 160-189 high, ≥190 very high)
- HDL (M: >40, F: >50 — higher is better)
- Triglycerides (<150 normal, 150-199 borderline, 200-499 high, ≥500 very high)
- Non-HDL Cholesterol, VLDL
- Ratios: TC/HDL, LDL/HDL

### Coagulation:
- PT (11-13.5 sec), INR (0.8-1.1 normal, 2.0-3.0 on warfarin)
- aPTT (25-35 sec)
- Fibrinogen (200-400 mg/dL)
- D-dimer (<0.5 mg/L FEU)

### Thyroid Panel:
- TSH (0.27-4.2 mIU/L)
- Free T4 (0.93-1.70 ng/dL)
- Free T3 (2.0-4.4 pg/mL)
- Total T3, Total T4
- Anti-TPO, Anti-TG (thyroid antibodies)

### Diabetes Markers:
- Fasting Glucose (Normal <100, Prediabetes 100-125, Diabetes ≥126 mg/dL)
- HbA1c (Normal <5.7%, Prediabetes 5.7-6.4%, Diabetes ≥6.5%)
- OGTT 2h (Normal <140, Prediabetes 140-199, Diabetes ≥200)
- Fasting Insulin (2.6-24.9 μU/mL)
- C-peptide (0.8-3.85 ng/mL)
- HOMA-IR calculation

### Hormone Panel:
- Cortisol AM (6-23 μg/dL), PM (lower)
- Testosterone (M: 264-916, F: 15-70 ng/dL)
- Estradiol, Progesterone (cycle-dependent)
- FSH, LH (age and cycle-dependent)
- Prolactin (M: 4-15, F: 4-23 ng/mL)
- DHEA-S, 17-OH Progesterone
- IGF-1, Growth Hormone
- PTH (15-65 pg/mL)
- Vitamin D 25-OH (30-100 ng/mL)
- Insulin-like markers

### Tumor Markers:
- PSA (M: <4.0 ng/mL, age-adjusted)
- CA-125 (<35 U/mL)
- CA 19-9 (<37 U/mL)
- CEA (<5.0 ng/mL for non-smokers)
- AFP (<10 ng/mL)
- CA 15-3 (<30 U/mL)
- Beta-hCG
- LDH (in oncology context)

### Inflammatory/Autoimmune:
- CRP (<1.0 mg/dL), hs-CRP (<1 low risk, 1-3 average, >3 high CV risk)
- ESR
- RF (<14 IU/mL), Anti-CCP (high specificity for RA)
- ANA (titer and pattern)
- Anti-dsDNA, Anti-Smith (SLE)
- ANCA (p-ANCA, c-ANCA)
- Complement C3, C4
- Immunoglobulins (IgG, IgA, IgM, IgE)

### Cardiac Markers:
- Troponin I/T (hs-TnI, hs-TnT) — lab-specific cutoffs
- CK-MB
- BNP (<100 pg/mL) / NT-proBNP (<300 age-adjusted)
- Myoglobin

### Iron Studies:
- Serum Iron (M: 65-175, F: 50-170 μg/dL)
- TIBC (250-370 μg/dL)
- Transferrin Saturation (20-50%)
- Ferritin (M: 12-300, F: 12-150 ng/mL)

### Urinalysis (Siydik tahlili):
- Color, Clarity, pH (4.5-8.0), Specific Gravity (1.005-1.030)
- Protein (negative), Glucose (negative), Ketones, Blood, Bilirubin, Urobilinogen
- Nitrites, Leukocyte esterase
- Microscopy: RBC (0-2/hpf), WBC (0-5/hpf), Casts, Crystals, Bacteria, Epithelial cells
- Urine Protein/Creatinine ratio, Albumin/Creatinine ratio (UACR)

### Vitamins & Minerals:
- Vitamin B12 (200-900 pg/mL)
- Folate (>3 ng/mL)
- Vitamin D 25-OH (30-100 ng/mL, deficient <20, insufficient 20-29)
- Zinc, Copper, Selenium

## B. IMAGING ANALYSIS:
### Chest X-ray: Lungs, heart silhouette, mediastinum, pleura, bones, soft tissue
### Abdominal X-ray: Gas pattern, calcifications, masses, free air
### Musculoskeletal X-ray: Alignment, bones, cartilage, soft tissue
### CT: Density patterns, contrast enhancement, measurements
### MRI: Signal intensity on T1/T2/FLAIR, enhancement pattern, diffusion
### Ultrasound: Echogenicity, measurements, Doppler findings

# ANALYSIS METHODOLOGY:
1. Identify EACH abnormal value and categorize severity (mild/moderate/severe)
2. Look for PATTERNS (e.g., microcytic hypochromic anemia = iron deficiency pattern)
3. CORRELATE findings (e.g., elevated creatinine + proteinuria + anemia = CKD pattern)
4. Consider PRE-ANALYTICAL factors (hemolysis, fasting status, medications affecting results)
5. Apply AGE and SEX-specific reference ranges
6. Suggest FOLLOW-UP tests based on findings
7. Calculate relevant scores/indices when data available

# PATTERN RECOGNITION EXAMPLES:
- Microcytic anemia + low ferritin + high TIBC = Iron deficiency anemia
- High MCV + low B12 = Megaloblastic anemia
- Elevated AST/ALT (AST>ALT) + elevated GGT = Alcoholic liver disease pattern
- Elevated ALP + GGT + normal AST/ALT = Cholestatic pattern
- High TSH + low FT4 = Primary hypothyroidism
- Low TSH + high FT4 = Hyperthyroidism
- Elevated creatinine + low eGFR + proteinuria = CKD
- High WBC + left shift + elevated CRP = Bacterial infection pattern

# RESPONSE FORMAT FOR LAB RESULTS:
🔬 LABORATORIYA TAHLILI
━━━━━━━━━━━━━━━━━━━━━━━━

📊 NATIJALAR:
Ko'rsatkich | Natija | Normal | Holat
[name] | [value] | [range] | ✅/⬆️/⬇️/🔴

🔍 BATAFSIL TAHLIL:
[Detailed interpretation of each abnormal finding]

🔗 PATTERN TAHLILI:
[Correlation between findings, recognized patterns]

⚠️ DIQQATGA SAZOVOR:
[Critical findings requiring attention]

📋 MUMKIN BO'LGAN SABABLAR:
1. Eng ehtimoliy: [cause]
2. [Alternative cause]
3. [Alternative cause]

🔬 QO'SHIMCHA TEKSHIRUVLAR:
1. [Recommended follow-up test] — [reason]
2. [Test] — [reason]

👨‍⚕️ TAVSIYA:
[When to see doctor, urgency]

📖 Manbalar: [References]
⚠️ Bu AI dastlabki tahlili — yakuniy xulosa shifokor tomonidan berilishi kerak.

# RESPONSE FORMAT FOR IMAGING:
🔬 TASVIRIY DIAGNOSTIKA
━━━━━━━━━━━━━━━━━━━━━━━━

📸 TASVIR: [Type] — [Body part]

🔍 TOPILMALAR:
Normal:
• [Normal finding 1]
• [Normal finding 2]
Patologik:
• [Abnormal finding 1 — detailed description]
• [Abnormal finding 2]

📊 XULOSA:
[Main impression]

🏥 DIFFERENSIAL:
1. [Most likely] — [probability]
2. [Alternative]
3. [Alternative]

📋 TAVSIYA:
1. [Follow-up imaging/test]
2. [Specialist referral]

⚠️ Bu AI dastlabki tahlili — yakuniy xulosa radiolog/shifokor tomonidan berilishi kerak.

# STRICT RULES:
1. ALWAYS use age/sex-specific reference ranges
2. ALWAYS identify critical values requiring immediate action
3. NEVER make definitive diagnoses — only suggest possibilities
4. ALWAYS recommend professional interpretation
5. If image quality is poor — state it clearly
6. ALWAYS look for patterns, don't just list individual abnormalities
7. ALWAYS respond in Uzbek (lab/medical terms in English in parentheses)
8. If patient provides partial results — analyze what's available, suggest what's missing
`
};

// ═══════════════════════════════════════════════════════════════
// KEYBOARD LAYOUTS
// ═══════════════════════════════════════════════════════════════

function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👨‍⚕️ Shifokor Maslahatchisi', callback_data: 'section_doctor' }],
        [{ text: '💊 Dori Maslahatchisi', callback_data: 'section_drug' }],
        [{ text: '📋 Surunkali Kasalliklar', callback_data: 'section_chronic' }],
        [{ text: '🔬 Diagnostika', callback_data: 'section_diagnostic' }],
        [
          { text: '👤 Profil', callback_data: 'profile_view' },
          { text: '📊 Tarix', callback_data: 'history_view' }
        ],
        [
          { text: '💎 Premium', callback_data: 'buy_premium' },
          { text: '📈 Status', callback_data: 'status_view' }
        ]
      ]
    }
  };
}

function diagnosticSubMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🩸 Qon tahlili', callback_data: 'diag_lab_blood' },
          { text: '💧 Siydik tahlili', callback_data: 'diag_lab_urine' }
        ],
        [
          { text: '🧬 Gormon tahlili', callback_data: 'diag_lab_hormone' },
          { text: '📝 Boshqa tahlil', callback_data: 'diag_lab_other' }
        ],
        [{ text: '━━━ Tasviriy Diagnostika ━━━', callback_data: 'ignore' }],
        [
          { text: '🫁 Rentgen', callback_data: 'diag_img_xray' },
          { text: '🧲 MRT', callback_data: 'diag_img_mri' }
        ],
        [
          { text: '💻 KT (CT)', callback_data: 'diag_img_ct' },
          { text: '📡 UZI', callback_data: 'diag_img_ultrasound' }
        ],
        [{ text: '🔙 Asosiy menyu', callback_data: 'main_menu' }]
      ]
    }
  };
}

function chronicDiseaseMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🩸 Diabet (Type 2)', callback_data: 'chronic_diabetes2' },
          { text: '💉 Diabet (Type 1)', callback_data: 'chronic_diabetes1' }
        ],
        [
          { text: '🫀 Gipertoniya', callback_data: 'chronic_hypertension' },
          { text: '❤️ Yurak yetishmovchiligi', callback_data: 'chronic_heartfailure' }
        ],
        [
          { text: '🫁 COPD', callback_data: 'chronic_copd' },
          { text: '🌬 Astma', callback_data: 'chronic_asthma' }
        ],
        [
          { text: '🫘 CKD (Buyrak)', callback_data: 'chronic_ckd' },
          { text: '🦴 Revmatoid artrit', callback_data: 'chronic_ra' }
        ],
        [
          { text: '🦋 Gipotireoz', callback_data: 'chronic_hypothyroid' },
          { text: '⚡ Gipertireoz', callback_data: 'chronic_hyperthyroid' }
        ],
        [
          { text: '🧠 Epilepsiya', callback_data: 'chronic_epilepsy' },
          { text: '😔 Depressiya', callback_data: 'chronic_depression' }
        ],
        [{ text: '🔙 Asosiy menyu', callback_data: 'main_menu' }]
      ]
    }
  };
}

function profileEditMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎂 Yosh', callback_data: 'profile_edit_age' },
          { text: '⚧ Jins', callback_data: 'profile_edit_gender' }
        ],
        [
          { text: '⚖️ Vazn', callback_data: 'profile_edit_weight' },
          { text: '📏 Boy', callback_data: 'profile_edit_height' }
        ],
        [
          { text: '🩸 Qon guruhi', callback_data: 'profile_edit_blood' },
          { text: '⚠️ Allergiya', callback_data: 'profile_edit_allergies' }
        ],
        [
          { text: '🏥 Surunkali kasallik', callback_data: 'profile_edit_chronic' },
          { text: '💊 Dorilar', callback_data: 'profile_edit_meds' }
        ],
        [{ text: '🔙 Asosiy menyu', callback_data: 'main_menu' }]
      ]
    }
  };
}

function activeSessionKeyboard(section) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔚 Suhbatni yakunlash', callback_data: `end_${section}` }],
        [{ text: '🔙 Asosiy menyu (suhbat tugaydi)', callback_data: 'force_main_menu' }]
      ]
    }
  };
}

function chronicActiveKeyboard(disease) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Malumot kiritish', callback_data: `chronic_log_${disease}` }],
        [
          { text: '📊 Haftalik hisobot', callback_data: `chronic_report_weekly_${disease}` },
          { text: '📈 Oylik hisobot', callback_data: `chronic_report_monthly_${disease}` }
        ],
        [{ text: '🔚 Monitoringni tugatish', callback_data: 'end_chronic' }],
        [{ text: '🔙 Asosiy menyu', callback_data: 'force_main_menu' }]
      ]
    }
  };
}

// ═══════════════════════════════════════════════════════════════
// DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function getUser(userId, firstName, username) {
  try {
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      await supabase
        .from('users')
        .insert({
          id: userId,
          first_name: firstName,
          username: username
        });

      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      user = newUser;
    }

    if (!user) return null;

    // Kunlik limitni yangilash
    const today = new Date().toISOString().split('T')[0];
    if (user.last_reset !== today) {
      await supabase
        .from('users')
        .update({ daily_count: 0, last_reset: today })
        .eq('id', userId);
      user.daily_count = 0;
      user.last_reset = today;
    }

    // Premium muddati tugaganini tekshirish
    if (user.is_premium && user.premium_until) {
      const premiumEnd = new Date(user.premium_until);
      if (premiumEnd < new Date()) {
        await supabase
          .from('users')
          .update({ is_premium: false })
          .eq('id', userId);
        user.is_premium = false;
      }
    }

    return user;
  } catch (err) {
    console.error('getUser xato:', err.message);
    return null;
  }
}

async function getUserProfile(userId) {
  try {
    const { data } = await supabase
      .from('users')
      .select('age, gender, weight, height, blood_type, allergies, chronic_diseases, current_medications')
      .eq('id', userId)
      .single();
    return data || {};
  } catch {
    return {};
  }
}

async function updateUserField(userId, field, value) {
  try {
    await supabase.from('users').update({ [field]: value }).eq('id', userId);
    return true;
  } catch {
    return false;
  }
}

async function saveChatMessage(userId, section, role, content) {
  try {
    await supabase.from('chat_history').insert({
      user_id: userId,
      section,
      role,
      content
    });
  } catch (err) {
    console.error('Chat saqlashda xato:', err.message);
  }
}

async function getChatHistory(userId, section, limit = 20) {
  try {
    const { data } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', userId)
      .eq('section', section)
      .order('created_at', { ascending: true })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

async function clearChatHistory(userId, section) {
  try {
    await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('section', section);
  } catch (err) {
    console.error('Chat tozalashda xato:', err.message);
  }
}

async function saveConsultation(userId, section, messages, summary, specialty) {
  try {
    await supabase.from('consultations').insert({
      user_id: userId,
      section,
      status: 'completed',
      messages: messages,
      summary: summary ? summary.substring(0, 5000) : null,
      specialty,
      completed_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Konsultatsiya saqlashda xato:', err.message);
  }
}

async function saveChronicLog(userId, disease, data, aiFeedback, alertLevel) {
  try {
    await supabase.from('chronic_logs').insert({
      user_id: userId,
      disease,
      data,
      ai_feedback: aiFeedback,
      alert_level: alertLevel
    });
  } catch (err) {
    console.error('Chronic log saqlashda xato:', err.message);
  }
}

async function getChronicLogs(userId, disease, days = 7) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data } = await supabase
      .from('chronic_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('disease', disease)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

async function saveMedicalRecord(userId, recordType, title, data, fileId, aiAnalysis) {
  try {
    await supabase.from('medical_records').insert({
      user_id: userId,
      record_type: recordType,
      title,
      data,
      file_id: fileId,
      ai_analysis: aiAnalysis
    });
  } catch (err) {
    console.error('Medical record saqlashda xato:', err.message);
  }
}

async function getConsultationHistory(userId, limit = 10) {
  try {
    const { data } = await supabase
      .from('consultations')
      .select('id, section, status, summary, specialty, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = {
      section: null,         // doctor, drug, chronic, diagnostic
      messages: [],          // Claude API messages
      specialty: null,       // Aniqlangan ixtisoslik
      chronicDisease: null,  // Surunkali kasallik turi
      diagnosticType: null,  // Diagnostika turi
      diagnosticSubType: null,
      profileEditing: null,  // Profil tahrirlash field
      awaitingInput: null,   // Nima kutilayotgani
      messageCount: 0        // Suhbatdagi xabar soni
    };
  }
  return sessions[userId];
}

function clearSession(userId) {
  sessions[userId] = {
    section: null,
    messages: [],
    specialty: null,
    chronicDisease: null,
    diagnosticType: null,
    diagnosticSubType: null,
    profileEditing: null,
    awaitingInput: null,
    messageCount: 0
  };
}

// ═══════════════════════════════════════════════════════════════
// AI COMMUNICATION
// ═══════════════════════════════════════════════════════════════

async function sendToAI(systemPrompt, messages, maxTokens = 8192) {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature: 0.3,
      system: systemPrompt,
      messages: messages
    });
    return response.content[0].text;
  } catch (error) {
    console.error('AI xato:', error.message);
    throw error;
  }
}

async function sendToAIWithImage(systemPrompt, messages, imageBase64, mediaType = 'image/jpeg') {
  try {
    // Oxirgi xabarni rasm bilan almashtirish
    const lastMsg = messages[messages.length - 1];
    const otherMsgs = messages.slice(0, -1);

    const imageMessage = {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: imageBase64
          }
        },
        {
          type: 'text',
          text: lastMsg ? lastMsg.content : 'Bu tibbiy tasvirni tahlil qiling.'
        }
      ]
    };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.2,
      system: systemPrompt,
      messages: [...otherMsgs, imageMessage]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('AI image xato:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function sendLongMessage(chatId, text) {
  const maxLength = 4096;
  if (text.length <= maxLength) {
    try {
      await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch {
      // Markdown xato bo'lsa oddiy yuborish
      try {
        await bot.sendMessage(chatId, text);
      } catch (e) {
        // Yana xato bo'lsa bo'laklarga bo'lish
        for (let i = 0; i < text.length; i += maxLength) {
          await bot.sendMessage(chatId, text.substring(i, i + maxLength));
        }
      }
    }
  } else {
    // Uzun xabarni bo'laklarga bo'lish
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }
      // Eng yaqin paragraf oxirini topish
      let splitIndex = remaining.lastIndexOf('\n\n', maxLength);
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        splitIndex = remaining.lastIndexOf('\n', maxLength);
      }
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        splitIndex = maxLength;
      }
      chunks.push(remaining.substring(0, splitIndex));
      remaining = remaining.substring(splitIndex).trim();
    }

    for (const chunk of chunks) {
      try {
        await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
      } catch {
        await bot.sendMessage(chatId, chunk);
      }
    }
  }
}

function buildProfileContext(profile) {
  if (!profile) return '';

  const parts = [];
  if (profile.age) parts.push(`Yoshi: ${profile.age}`);
  if (profile.gender) parts.push(`Jinsi: ${profile.gender}`);
  if (profile.weight) parts.push(`Vazni: ${profile.weight} kg`);
  if (profile.height) parts.push(`Bo'yi: ${profile.height} sm`);
  if (profile.blood_type) parts.push(`Qon guruhi: ${profile.blood_type}`);
  if (profile.allergies) parts.push(`Allergiyalar: ${profile.allergies}`);
  if (profile.chronic_diseases) parts.push(`Surunkali kasalliklar: ${profile.chronic_diseases}`);
  if (profile.current_medications) parts.push(`Hozirgi dorilar: ${profile.current_medications}`);

  if (parts.length === 0) return '';
  return '\n\nBemor profili:\n' + parts.join('\n');
}

function detectSpecialty(text) {
  const lower = text.toLowerCase();
  const map = {
    cardiology: ['yurak', 'kokrak ogrigi', 'ko\'krak og\'rig\'i', 'qon bosim', 'aritmiya', 'tez urishi', 'puls', 'infarkt'],
    endocrinology: ['qand', 'diabet', 'tireoid', 'qalqonsimon', 'gormon', 'insulin', 'semiz', 'vazn ortishi'],
    pulmonology: ['nafas', 'yo\'tal', 'yotal', 'astma', 'bronxit', 'o\'pka', 'opka', 'xirillash'],
    gastroenterology: ['oshqozon', 'ichak', 'jigar', 'o\'t pufagi', 'ich ketish', 'qabziyat', 'ko\'ngil aynishi', 'qusish'],
    neurology: ['bosh og\'rig\'i', 'bosh ogrigi', 'bosh aylanishi', 'tutqanoq', 'uyqu', 'xotira', 'asab', 'migren'],
    nephrology: ['buyrak', 'siydik', 'shish', 'kreatinin'],
    rheumatology: ['bo\'g\'im', 'bogim', 'artrit', 'revmatizm', 'og\'riydi', 'shishgan'],
    dermatology: ['teri', 'toshma', 'qichishish', 'dog\'', 'yara', 'ekzema', 'psoriaz'],
    psychiatry: ['ruhiy', 'depressiya', 'xavotir', 'uyqu buzilishi', 'stress', 'qo\'rquv'],
    pediatrics: ['bolam', 'bola', 'chaqaloq', 'go\'dak', 'farzandim'],
    gynecology: ['hayz', 'homiladorlik', 'homila', 'tug\'ruq', 'ayollik'],
    urology: ['prostata', 'siydik qopi', 'ereksiya', 'erkaklik'],
    ent: ['quloq', 'burun', 'tomoq', 'angina', 'otit', 'sinusit'],
    ophthalmology: ['ko\'z', 'koz', 'ko\'rish', 'korish']
  };

  for (const [specialty, keywords] of Object.entries(map)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return specialty;
    }
  }
  return null;
}

function checkEmergency(text) {
  const lower = text.toLowerCase();
  const emergencyPhrases = [
    'hushimdan ketdim', 'hushdan ketdi', 'hush yoqotdi',
    'nafas ololmayapman', 'nafas olmayapti', 'bo\'g\'ilyapman',
    'qon ketayapti', 'qon to\'xtamayapti', 'ko\'p qon',
    'ko\'krak og\'rig\'i kuchli', 'yuragim og\'riyapti kuchli',
    'yuzim qiyshaydi', 'gapira olmayapman', 'oyog\'im ishlamayapti',
    'ko\'ra olmayapman', 'ko\'zim ko\'rmayapti',
    'zaharlandim', 'zahar', 'dori ko\'p ichdim',
    'o\'zimni o\'ldirmoqchiman', 'jonimga qasd', 'o\'lmoqchiman',
    'haroratim 40', 'haroratim 41', 'haroratim 42',
    'tutqanoq bo\'lyapti', 'tutqanoq',
    'bolam nafas olmayapti', 'bolam ko\'kardi',
    'anafilaksiya', 'butun tanam shishdi',
    'kuchli allergiya', 'tomoq shishdi nafas olayolmayapman'
  ];

  return emergencyPhrases.some(phrase => lower.includes(phrase));
}

async function downloadFile(fileId) {
  const file = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

  return new Promise((resolve, reject) => {
    https.get(fileUrl, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function checkDailyLimit(user) {
  if (user.is_premium) return true;
  return user.daily_count < 5;
}

async function incrementUsage(userId, currentCount) {
  await supabase
    .from('users')
    .update({ daily_count: currentCount + 1 })
    .eq('id', userId);
}

// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════

bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name;
  await getUser(msg.from.id, name, msg.from.username);
  clearSession(msg.from.id);

  const welcomeText = `🏥 *MedAI — Sun'iy Intellekt Tibbiy Maslahatchi*
━━━━━━━━━━━━━━━━━━━━━━━━━━

Assalomu alaykum, ${name}! 👋

Men MedAI — Yevropa va Amerika tibbiyot guideline'lariga asoslangan sun'iy intellekt tibbiy yordamchisiman.

*Mening imkoniyatlarim:*

👨‍⚕️ *Shifokor Maslahatchisi*
Simptomlarni tahlil, differensial diagnoz, guideline-based tavsiyalar

💊 *Dori Maslahatchisi*
Dori ma'lumotlari, o'zaro ta'sir, nojo'ya ta'sirlar, kontraindikatsiyalar

📋 *Surunkali Kasalliklar Nazorati*
Diabet, gipertoniya, astma va boshqa kasalliklarni kundalik monitoring

🔬 *Tasviriy Diagnostika*
Qon, siydik, gormon tahlillari + Rentgen, MRT, KT, UZI tahlili

🆓 Bepul: kuniga 5 ta savol
💎 Premium: cheksiz — 40,000 so'm/oy

⚠️ _Eslatma: Men shifokor emasman. Tavsiyalarim yo'naltiruvchi xarakterga ega._

Bo'limni tanlang 👇`;

  await bot.sendMessage(msg.chat.id, welcomeText, {
    parse_mode: 'Markdown',
    ...mainMenuKeyboard()
  });
});

bot.onText(/\/menu/, async (msg) => {
  clearSession(msg.from.id);
  await bot.sendMessage(msg.chat.id, '🏥 *MedAI — Asosiy Menyu*\n\nBo\'limni tanlang:', {
    parse_mode: 'Markdown',
    ...mainMenuKeyboard()
  });
});

bot.onText(/\/doctor/, async (msg) => {
  await startSection(msg.chat.id, msg.from.id, 'doctor');
});

bot.onText(/\/drug/, async (msg) => {
  await startSection(msg.chat.id, msg.from.id, 'drug');
});

bot.onText(/\/chronic/, async (msg) => {
  clearSession(msg.from.id);
  await bot.sendMessage(msg.chat.id,
    '📋 *Surunkali Kasalliklar Nazorati*\n\nKasalligingizni tanlang:',
    { parse_mode: 'Markdown', ...chronicDiseaseMenu() }
  );
});

bot.onText(/\/diagnostic/, async (msg) => {
  clearSession(msg.from.id);
  await bot.sendMessage(msg.chat.id,
    '🔬 *Tasviriy Diagnostika*\n\nTahlil turini tanlang:',
    { parse_mode: 'Markdown', ...diagnosticSubMenu() }
  );
});

bot.onText(/\/profile/, async (msg) => {
  await showProfile(msg.chat.id, msg.from.id);
});

bot.onText(/\/history/, async (msg) => {
  await showHistory(msg.chat.id, msg.from.id);
});

bot.onText(/\/end/, async (msg) => {
  const session = getSession(msg.from.id);
  if (session.section) {
    await endSession(msg.chat.id, msg.from.id);
  } else {
    await bot.sendMessage(msg.chat.id, 'Faol suhbat topilmadi.',
      mainMenuKeyboard());
  }
});

bot.onText(/\/premium/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `💎 *Premium tarif:*

✅ Cheksiz savollar (barcha bo'limlarda)
✅ Tezkor javob
✅ Suhbat tarixini saqlash
✅ Batafsil klinik tahlillar

💳 Narx: 40,000 so'm/oy`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: "💳 40,000 so'm to'lash", callback_data: 'buy_premium' }
        ]]
      }
    }
  );
});

bot.onText(/\/status/, async (msg) => {
  await showStatus(msg.chat.id, msg.from.id);
});

bot.onText(/\/help/, async (msg) => {
  const helpText = `ℹ️ *MedAI Yordam*
━━━━━━━━━━━━━━━━━━

*Buyruqlar:*
/start — Botni boshlash
/menu — Asosiy menyu
/doctor — Shifokor maslahatchisi
/drug — Dori maslahatchisi
/chronic — Surunkali kasalliklar
/diagnostic — Diagnostika
/profile — Profilni to'ldirish
/history — Konsultatsiya tarixi
/end — Suhbatni yakunlash
/premium — Premium tarif
/status — Hisobingiz holati
/help — Yordam

*Qanday ishlaydi:*
1. Bo'limni tanlang
2. Savollaringizga javob bering
3. AI tahlil va tavsiya beradi
4. Natijani shifokoringizga ko'rsating

*Diagnostika:*
• Tahlil natijalarini matn yozing yoki rasm yuboring
• Rentgen/MRT/KT/UZI rasmlarini yuboring

⚠️ Shoshilinch holatlarda 103 ga qo'ng'iroq qiling!`;

  await bot.sendMessage(msg.chat.id, helpText, {
    parse_mode: 'Markdown',
    ...mainMenuKeyboard()
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION STARTER
// ═══════════════════════════════════════════════════════════════

async function startSection(chatId, userId, section) {
  const user = await getUser(userId);
  if (!user) {
    return bot.sendMessage(chatId, '❌ Xatolik. /start bosing.');
  }

  if (!checkDailyLimit(user)) {
    return bot.sendMessage(chatId,
      '❌ Kunlik limitingiz tugadi (5/5).\n\n💎 Premium olish uchun /premium bosing!',
      { reply_markup: { inline_keyboard: [[{ text: '💎 Premium olish', callback_data: 'buy_premium' }]] } }
    );
  }

  clearSession(userId);
  const session = getSession(userId);
  session.section = section;

  // Profil kontekstini olish
  const profile = await getUserProfile(userId);
  const profileContext = buildProfileContext(profile);

  // Boshlang'ich xabar
  let startContent;
  const sectionNames = {
    doctor: '👨‍⚕️ Shifokor Maslahatchisi',
    drug: '💊 Dori Maslahatchisi'
  };

  if (section === 'doctor') {
    startContent = `Yangi konsultatsiya boshlang. Bemor salomlashdi va shifokor maslahatini so'ramoqda.${profileContext}`;
  } else if (section === 'drug') {
    startContent = `Yangi farmatsevtik konsultatsiya boshlang. Bemor dori haqida ma'lumot so'ramoqda.${profileContext}`;
  }

  session.messages.push({ role: 'user', content: startContent });

  await bot.sendMessage(chatId, `⏳ ${sectionNames[section]} tayyorlanmoqda...`);

  try {
    const aiResponse = await sendToAI(
      SYSTEM_PROMPTS[section],
      session.messages
    );

    session.messages.push({ role: 'assistant', content: aiResponse });
    session.messageCount++;

    // Bazaga saqlash
    await saveChatMessage(userId, section, 'assistant', aiResponse);

    await sendLongMessage(chatId, aiResponse);
    await bot.sendMessage(chatId,
      '💬 Savolingizni yozing yoki shikoyatingizni ayting:',
      activeSessionKeyboard(section)
    );
  } catch (error) {
    console.error('Section start xato:', error.message);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      mainMenuKeyboard());
    clearSession(userId);
  }
}

// ═══════════════════════════════════════════════════════════════
// SESSION ENDER
// ═══════════════════════════════════════════════════════════════

async function endSession(chatId, userId) {
  const session = getSession(userId);

  if (!session.section || session.messages.length < 2) {
    clearSession(userId);
    return bot.sendMessage(chatId, 'Suhbat yakunlandi.', mainMenuKeyboard());
  }

  await bot.sendMessage(chatId, '⏳ Xulosa tayyorlanmoqda...');

  try {
    // Xulosa so'rash
    session.messages.push({
      role: 'user',
      content: `Konsultatsiyani yakunlang. Quyidagilarni taqdim eting:
1. Suhbat xulosasi
2. Asosiy differensial diagnozlar (agar doctor bo'lsa)
3. Tavsiya etilgan tekshiruvlar
4. Shifokorga murojaat shoshilinchlik darajasi
5. Keyingi qadamlar
6. Ishlatilgan guideline'lar`
    });

    const summary = await sendToAI(
      SYSTEM_PROMPTS[session.section] || SYSTEM_PROMPTS.doctor,
      session.messages
    );

    // Bazaga saqlash
    await saveConsultation(userId, session.section, session.messages, summary, session.specialty);

    await sendLongMessage(chatId, summary);
    await bot.sendMessage(chatId,
      '✅ Konsultatsiya yakunlandi.\n📋 Natijani shifokoringizga ko\'rsating.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏥 Asosiy menyu', callback_data: 'main_menu' }],
            [{ text: '👨‍⚕️ Yangi konsultatsiya', callback_data: 'section_doctor' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('End session xato:', error.message);
    await bot.sendMessage(chatId, '❌ Xulosa tayyorlashda xato.', mainMenuKeyboard());
  }

  // Chat tarixini tozalash va sessiyani tugatish
  await clearChatHistory(userId, session.section);
  clearSession(userId);
}

// ═══════════════════════════════════════════════════════════════
// PROFILE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function showProfile(chatId, userId) {
  const profile = await getUserProfile(userId);
  const { data: user } = await supabase.from('users').select('first_name').eq('id', userId).single();

  const text = `👤 *Mening Tibbiy Profilim*
━━━━━━━━━━━━━━━━━━━━━━━━

📛 Ism: ${user?.first_name || 'Noma\'lum'}
🎂 Yosh: ${profile.age || '❌ Kiritilmagan'}
⚧ Jins: ${profile.gender || '❌ Kiritilmagan'}
⚖️ Vazn: ${profile.weight ? profile.weight + ' kg' : '❌ Kiritilmagan'}
📏 Bo'y: ${profile.height ? profile.height + ' sm' : '❌ Kiritilmagan'}
🩸 Qon guruhi: ${profile.blood_type || '❌ Kiritilmagan'}
⚠️ Allergiyalar: ${profile.allergies || '❌ Kiritilmagan'}
🏥 Surunkali kasalliklar: ${profile.chronic_diseases || '❌ Kiritilmagan'}
💊 Hozirgi dorilar: ${profile.current_medications || '❌ Kiritilmagan'}

📌 _Profilingizni to'ldirsangiz, AI aniqroq tavsiyalar beradi._`;

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    ...profileEditMenu()
  });
}

async function showStatus(chatId, userId) {
  const user = await getUser(userId);
  if (!user) return bot.sendMessage(chatId, '❌ Foydalanuvchi topilmadi!');

  const status = user.is_premium ? '💎 Premium' : '🆓 Bepul';
  const count = user.is_premium ? 'Cheksiz' : `${user.daily_count}/5`;
  const premiumUntil = user.premium_until
    ? new Date(user.premium_until).toLocaleDateString('uz-UZ')
    : '-';

  await bot.sendMessage(chatId,
    `👤 *Sizning holatingiz:*

Tarif: ${status}
Bugungi savollar: ${count}
${user.is_premium ? `Premium muddati: ${premiumUntil}` : ''}`,
    { parse_mode: 'Markdown', ...mainMenuKeyboard() }
  );
}

async function showHistory(chatId, userId) {
  const history = await getConsultationHistory(userId);

  if (history.length === 0) {
    return bot.sendMessage(chatId, '📊 Hali konsultatsiya tarixingiz yo\'q.',
      mainMenuKeyboard());
  }

  const sectionEmojis = {
    doctor: '👨‍⚕️', drug: '💊', chronic: '📋', diagnostic: '🔬'
  };
  const sectionNames = {
    doctor: 'Shifokor', drug: 'Dori', chronic: 'Surunkali', diagnostic: 'Diagnostika'
  };

  let text = '📊 *Konsultatsiya Tarixingiz:*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  for (const item of history) {
    const emoji = sectionEmojis[item.section] || '📄';
    const name = sectionNames[item.section] || item.section;
    const date = new Date(item.created_at).toLocaleDateString('uz-UZ');
    const summaryShort = item.summary ? item.summary.substring(0, 100) + '...' : 'Xulosa mavjud emas';

    text += `${emoji} *${name}* — ${date}\n`;
    text += `${summaryShort}\n\n`;
  }

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    ...mainMenuKeyboard()
  });
}

// ═══════════════════════════════════════════════════════════════
// CALLBACK QUERY HANDLER (TUGMALAR)
// ═══════════════════════════════════════════════════════════════

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  // ── Asosiy menyu ──
  if (data === 'main_menu' || data === 'force_main_menu') {
    if (data === 'force_main_menu') {
      // Suhbatni saqlash va tugatish
      const session = getSession(userId);
      if (session.section && session.messages.length > 2) {
        await saveConsultation(userId, session.section, session.messages, null, session.specialty);
      }
    }
    clearSession(userId);
    return bot.sendMessage(chatId, '🏥 *MedAI — Asosiy Menyu*\n\nBo\'limni tanlang:', {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard()
    });
  }

  if (data === 'ignore') return;

  // ── Bo'lim tanlash ──
  if (data === 'section_doctor') {
    return startSection(chatId, userId, 'doctor');
  }

  if (data === 'section_drug') {
    return startSection(chatId, userId, 'drug');
  }

  if (data === 'section_chronic') {
    clearSession(userId);
    return bot.sendMessage(chatId,
      '📋 *Surunkali Kasalliklar Nazorati*\n\nKasalligingizni tanlang:',
      { parse_mode: 'Markdown', ...chronicDiseaseMenu() }
    );
  }

  if (data === 'section_diagnostic') {
    clearSession(userId);
    return bot.sendMessage(chatId,
      '🔬 *Tasviriy Diagnostika*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n📋 Laboratoriya tahlillari yoki tibbiy tasvirlarni tahlil qilish uchun turini tanlang:\n\n⚠️ _AI tahlili dastlabki yo\'nalish uchun. Yakuniy xulosa shifokor tomonidan beriladi._',
      { parse_mode: 'Markdown', ...diagnosticSubMenu() }
    );
  }

  // ── Suhbatni yakunlash ──
  if (data.startsWith('end_')) {
    return endSession(chatId, userId);
  }

  // ── Premium to'lov ──
  if (data === 'buy_premium') {
    try {
      return bot.sendInvoice(
        chatId,
        'MedAI Premium',
        'Cheksiz tibbiy savollar — 1 oy\n\n✅ Barcha bo\'limlarda cheksiz savol\n✅ Batafsil klinik tahlillar\n✅ Konsultatsiya tarixini saqlash',
        'premium_1month',
        process.env.PAYMENT_TOKEN,
        'UZS',
        [{ label: 'Premium 1 oy', amount: 4000000 }]
      );
    } catch (err) {
      console.error('Invoice xato:', err.message);
      return bot.sendMessage(chatId,
        '💳 Premium sotib olish uchun admin bilan bog\'laning: @medai_admin');
    }
  }

  // ── Status ──
  if (data === 'status_view') {
    return showStatus(chatId, userId);
  }

  // ── Tarix ──
  if (data === 'history_view') {
    return showHistory(chatId, userId);
  }

  // ── Profil ──
  if (data === 'profile_view') {
    return showProfile(chatId, userId);
  }

  if (data === 'profile_edit') {
    return bot.sendMessage(chatId, '✏️ Qaysi ma\'lumotni kiritmoqchisiz?',
      profileEditMenu());
  }

  // Profil tahrirlash
  if (data.startsWith('profile_edit_')) {
    const field = data.replace('profile_edit_', '');
    const session = getSession(userId);

    const fieldPrompts = {
      age: '🎂 Yoshingizni kiriting (masalan: 35):',
      gender: null, // tugma bilan
      weight: '⚖️ Vazningizni kg da kiriting (masalan: 72.5):',
      height: '📏 Bo\'yingizni sm da kiriting (masalan: 175):',
      blood_type: null, // tugma bilan
      allergies: '⚠️ Allergiyalaringizni yozing:\n(masalan: penisilin, aspirin, yong\'oq)\nYo\'q bo\'lsa "yo\'q" deb yozing:',
      chronic: '🏥 Surunkali kasalliklaringizni yozing:\n(masalan: 2-tip diabet, gipertoniya)\nYo\'q bo\'lsa "yo\'q" deb yozing:',
      meds: '💊 Hozir qabul qilayotgan dorilaringizni yozing:\n(masalan: Metformin 500mg kuniga 2 marta)\nYo\'q bo\'lsa "yo\'q" deb yozing:'
    };

    if (field === 'gender') {
      return bot.sendMessage(chatId, '⚧ Jinsingizni tanlang:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👨 Erkak', callback_data: 'profile_set_gender_erkak' },
              { text: '👩 Ayol', callback_data: 'profile_set_gender_ayol' }
            ]
          ]
        }
      });
    }

    if (field === 'blood_type') {
      return bot.sendMessage(chatId, '🩸 Qon guruhingizni tanlang:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'I (O)+', callback_data: 'profile_set_blood_O+' },
              { text: 'I (O)-', callback_data: 'profile_set_blood_O-' }
            ],
            [
              { text: 'II (A)+', callback_data: 'profile_set_blood_A+' },
              { text: 'II (A)-', callback_data: 'profile_set_blood_A-' }
            ],
            [
              { text: 'III (B)+', callback_data: 'profile_set_blood_B+' },
              { text: 'III (B)-', callback_data: 'profile_set_blood_B-' }
            ],
            [
              { text: 'IV (AB)+', callback_data: 'profile_set_blood_AB+' },
              { text: 'IV (AB)-', callback_data: 'profile_set_blood_AB-' }
            ]
          ]
        }
      });
    }

    if (fieldPrompts[field]) {
      session.profileEditing = field;
      session.section = null;
      return bot.sendMessage(chatId, fieldPrompts[field]);
    }
  }

  // Profil jins tanlash
  if (data.startsWith('profile_set_gender_')) {
    const gender = data.replace('profile_set_gender_', '');
    await updateUserField(userId, 'gender', gender);
    return bot.sendMessage(chatId, `✅ Jins saqlandi: ${gender}`, profileEditMenu());
  }

  // Profil qon guruhi
  if (data.startsWith('profile_set_blood_')) {
    const blood = data.replace('profile_set_blood_', '');
    await updateUserField(userId, 'blood_type', blood);
    return bot.sendMessage(chatId, `✅ Qon guruhi saqlandi: ${blood}`, profileEditMenu());
  }

  // ── Surunkali kasalliklar tanlash ──
  if (data.startsWith('chronic_') && !data.startsWith('chronic_log_') && !data.startsWith('chronic_report_')) {
    const diseaseMap = {
      chronic_diabetes2: 'Diabet mellitus Type 2',
      chronic_diabetes1: 'Diabet mellitus Type 1',
      chronic_hypertension: 'Gipertoniya',
      chronic_heartfailure: 'Yurak yetishmovchiligi',
      chronic_copd: 'COPD',
      chronic_asthma: 'Bronxial astma',
      chronic_ckd: 'Surunkali buyrak kasalligi (CKD)',
      chronic_ra: 'Revmatoid artrit',
      chronic_hypothyroid: 'Gipotireoz',
      chronic_hyperthyroid: 'Gipertireoz',
      chronic_epilepsy: 'Epilepsiya',
      chronic_depression: 'Depressiya'
    };

    const disease = diseaseMap[data];
    if (!disease) return;

    const user = await getUser(userId);
    if (!user || !checkDailyLimit(user)) {
      return bot.sendMessage(chatId,
        '❌ Kunlik limitingiz tugadi.\n💎 /premium bosing!');
    }

    const session = getSession(userId);
    clearSession(userId);
    const s = getSession(userId);
    s.section = 'chronic';
    s.chronicDisease = disease;

    const profile = await getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    s.messages.push({
      role: 'user',
      content: `Bemor ${disease} kasalligi uchun monitoring tizimini boshlaydi.${profileContext}\n\nMonitoring rejasini sozlang: kunlik kuzatish ko'rsatkichlari, maqsadli qiymatlar, xavfli chegaralar, nazorat jadvali va hayot tarzi tavsiyalarini bering.`
    });

    await bot.sendMessage(chatId, `⏳ ${disease} uchun monitoring sozlanmoqda...`);

    try {
      const response = await sendToAI(SYSTEM_PROMPTS.chronic, s.messages);
      s.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);

      await sendLongMessage(chatId, response);
      await bot.sendMessage(chatId,
        `✅ *${disease}* monitoring sozlandi!\n\nNima qilmoqchisiz?`,
        { parse_mode: 'Markdown', ...chronicActiveKeyboard(data) }
      );
    } catch (error) {
      console.error('Chronic start xato:', error.message);
      await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.', mainMenuKeyboard());
      clearSession(userId);
    }
    return;
  }

  // Chronic log (ma'lumot kiritish)
  if (data.startsWith('chronic_log_')) {
    const session = getSession(userId);
    if (!session.chronicDisease) {
      return bot.sendMessage(chatId, '❌ Avval kasallikni tanlang.', chronicDiseaseMenu());
    }
    session.awaitingInput = 'chronic_data';

    const examples = {
      'Diabet mellitus Type 2': 'Qand (nahor): 6.5\nQand (ovqatdan keyin): 8.2\nVazn: 78\nQon bosimi: 130/85\nKayfiyat: yaxshi',
      'Gipertoniya': 'Ertalab QB: 135/88\nKechqurun QB: 128/82\nPuls: 72\nBosh og\'rig\'i: yo\'q\nDori ichildi: ha',
      'Bronxial astma': 'Nafas qisilishi: yo\'q\nYo\'tal: kam\nReliver ishlatish: 0 marta\nPeak flow: 420\nTungi simptom: yo\'q',
      'COPD': 'Yo\'tal: bor, balg\'amli\nNafas qisilishi: 2/5\nBronxodilator: 2 marta\nJismoniy faollik: 20 min yurish'
    };

    const example = examples[session.chronicDisease] || 'Ko\'rsatkichlarni yozing (masalan: QB 130/85, Puls 72)';

    return bot.sendMessage(chatId,
      `📝 *${session.chronicDisease} — Bugungi ma'lumotlar*\n\nKo'rsatkichlaringizni yozing:\n\n_Masalan:_\n${example}`,
      { parse_mode: 'Markdown' }
    );
  }

  // Chronic report
  if (data.startsWith('chronic_report_')) {
    const session = getSession(userId);
    if (!session.chronicDisease) {
      return bot.sendMessage(chatId, '❌ Avval kasallikni tanlang.', chronicDiseaseMenu());
    }

    const parts = data.split('_');
    const period = parts[2]; // weekly or monthly
    const days = period === 'weekly' ? 7 : 30;

    const user = await getUser(userId);
    if (!user || !checkDailyLimit(user)) {
      return bot.sendMessage(chatId, '❌ Kunlik limitingiz tugadi.');
    }

    await bot.sendMessage(chatId, `⏳ ${period === 'weekly' ? 'Haftalik' : 'Oylik'} hisobot tayyorlanmoqda...`);

    const logs = await getChronicLogs(userId, session.chronicDisease, days);

    if (logs.length === 0) {
      return bot.sendMessage(chatId,
        '📊 Bu davr uchun ma\'lumot topilmadi.\n📝 Avval kunlik ma\'lumot kiriting.',
        chronicActiveKeyboard(data));
    }

    session.messages.push({
      role: 'user',
      content: `${session.chronicDisease} uchun ${period === 'weekly' ? 'haftalik' : 'oylik'} hisobot tayyorlang.\n\nMa'lumotlar:\n${JSON.stringify(logs, null, 2)}\n\nBatafsil hisobot: ko'rsatkichlar dinamikasi, o'rtacha qiymatlar, trend, tavsiyalar, shifokorga xulosa.`
    });

    try {
      const response = await sendToAI(SYSTEM_PROMPTS.chronic, session.messages);
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);

      await sendLongMessage(chatId, response);
    } catch (error) {
      await bot.sendMessage(chatId, '❌ Hisobot tayyorlashda xato.');
    }
    return;
  }

  // ── Diagnostika turini tanlash ──
  if (data.startsWith('diag_lab_') || data.startsWith('diag_img_')) {
    const session = getSession(userId);
    clearSession(userId);
    const s = getSession(userId);
    s.section = 'diagnostic';

    if (data.startsWith('diag_lab_')) {
      s.diagnosticType = 'lab';
      s.diagnosticSubType = data.replace('diag_lab_', '');
      s.awaitingInput = 'lab_results';

      const labNames = {
        blood: 'Qon tahlili',
        urine: 'Siydik tahlili',
        hormone: 'Gormon tahlili',
        other: 'Boshqa tahlil'
      };

      const examples = {
        blood: '_Masalan:_\nGemoglobin: 125 g/l\nLeykotsitlar: 6.2\nEritrotsitlar: 4.5\nTrombositlar: 280\nEChT: 15',
        urine: '_Masalan:_\nRang: sariq\npH: 6.0\nOqsil: manfiy\nQand: manfiy\nLeykotsitlar: 2-3',
        hormone: '_Masalan:_\nTSH: 3.5 mIU/L\nT4 erkin: 1.2 ng/dL\nT3: 3.1 pg/mL\nInsulin: 12',
        other: 'Tahlil natijalarini yozing yoki rasm yuboring.'
      };

      return bot.sendMessage(chatId,
        `🔬 *${labNames[s.diagnosticSubType] || 'Tahlil'} natijalarini kiriting*\n\nNatijalarni matn sifatida yozing yoki tahlil varaqasining 📸 rasmini yuboring.\n\n${examples[s.diagnosticSubType] || ''}`,
        { parse_mode: 'Markdown' }
      );
    }

    if (data.startsWith('diag_img_')) {
      s.diagnosticType = 'imaging';
      s.diagnosticSubType = data.replace('diag_img_', '');
      s.awaitingInput = 'medical_image';

      const imgNames = {
        xray: 'Rentgen (X-ray)',
        mri: 'MRT',
        ct: 'KT (CT Scan)',
        ultrasound: 'UZI (Ultrasound)'
      };

      return bot.sendMessage(chatId,
        `📸 *${imgNames[s.diagnosticSubType] || 'Tibbiy tasvir'} rasmini yuboring*\n\n📌 Rasm aniq va sifatli bo'lishi kerak.\n\nRasm bilan birga caption (izoh) yozing:\n• Qaysi a'zo/soha?\n• Qanday shikoyat bor?\n\nYoki shunchaki rasmni yuboring.`,
        { parse_mode: 'Markdown' }
      );
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT HANDLERS
// ═══════════════════════════════════════════════════════════════

bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', async (msg) => {
  const userId = msg.from.id;
  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + 1);

  await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_until: premiumUntil.toISOString()
    })
    .eq('id', userId);

  await bot.sendMessage(msg.chat.id,
    `✅ To'lov muvaffaqiyatli!\n\n💎 Siz endi Premium foydalanuvchisiz!\nMuddati: ${premiumUntil.toLocaleDateString('uz-UZ')}\n\nBarcha bo'limlarda cheksiz savollar bilan foydalaning! 🎉`,
    mainMenuKeyboard()
  );
});

// ═══════════════════════════════════════════════════════════════
// PHOTO HANDLER (Diagnostika rasmlari)
// ═══════════════════════════════════════════════════════════════

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const session = getSession(userId);

  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) return bot.sendMessage(chatId, '❌ Xatolik. /start bosing.');
  if (!checkDailyLimit(user)) {
    return bot.sendMessage(chatId, '❌ Kunlik limit tugadi. /premium bosing!');
  }

  // Agar diagnostika rejimida bo'lsa
  if (session.section === 'diagnostic' || session.awaitingInput === 'lab_results' || session.awaitingInput === 'medical_image') {

    if (!session.section) {
      session.section = 'diagnostic';
    }

    await bot.sendMessage(chatId, '⏳ Rasm tahlil qilinmoqda... Bu biroz vaqt olishi mumkin.');

    try {
      // Rasmni yuklash
      const photo = msg.photo[msg.photo.length - 1]; // Eng katta rasm
      const imageBuffer = await downloadFile(photo.file_id);
      const imageBase64 = imageBuffer.toString('base64');

      const profile = await getUserProfile(userId);
      const profileContext = buildProfileContext(profile);

      const caption = msg.caption || '';
      const imgTypeNames = {
        xray: 'Rentgen', mri: 'MRT', ct: 'KT (CT Scan)',
        ultrasound: 'UZI', blood: 'Qon tahlili varaqasi',
        urine: 'Siydik tahlili varaqasi', hormone: 'Gormon tahlili varaqasi',
        other: 'Tibbiy hujjat'
      };

      const typeName = imgTypeNames[session.diagnosticSubType] || 'Tibbiy tasvir';

      let promptText;
      if (session.diagnosticType === 'lab' || session.awaitingInput === 'lab_results') {
        promptText = `Bu ${typeName} varaqasining rasmi. Rasmdagi barcha ko'rsatkichlarni o'qing, normal diapazon bilan solishtiring va batafsil tahlil qiling.${profileContext}\n${caption ? 'Bemor izohi: ' + caption : ''}`;
      } else {
        promptText = `Bu ${typeName} tasvirini tahlil qiling. Anatomik tuzilmalarni identifikatsiya qiling, normal va patologik topilmalarni farqlang, differensial diagnozlar ko'rsating.${profileContext}\n${caption ? 'Klinik ma\'lumot: ' + caption : ''}`;
      }

      const messages = [{ role: 'user', content: promptText }];

      const response = await sendToAIWithImage(
        SYSTEM_PROMPTS.diagnostic,
        messages,
        imageBase64,
        'image/jpeg'
      );

      await incrementUsage(userId, user.daily_count);

      // Bazaga saqlash
      await saveMedicalRecord(
        userId,
        session.diagnosticType || 'unknown',
        typeName,
        { caption, subType: session.diagnosticSubType },
        photo.file_id,
        response
      );

      await sendLongMessage(chatId, response);
      clearSession(userId);

      await bot.sendMessage(chatId, 'Davom etish:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔬 Yana tahlil', callback_data: 'section_diagnostic' }],
            [{ text: '👨‍⚕️ Shifokorga so\'rash', callback_data: 'section_doctor' }],
            [{ text: '🏥 Asosiy menyu', callback_data: 'main_menu' }]
          ]
        }
      });

    } catch (error) {
      console.error('Image analysis xato:', error.message);
      await bot.sendMessage(chatId, '❌ Rasm tahlilida xatolik. Qaytadan urinib ko\'ring.',
        { reply_markup: { inline_keyboard: [[{ text: '🔬 Qaytadan', callback_data: 'section_diagnostic' }]] } }
      );
      clearSession(userId);
    }
    return;
  }

  // Agar diagnostika rejimida bo'lmasa — diagnostikaga yo'naltirish
  await bot.sendMessage(chatId,
    '📸 Rasm yubordingiz. Tahlil qilish uchun Diagnostika bo\'limini tanlang:',
    diagnosticSubMenu()
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN MESSAGE HANDLER (Barcha matnli xabarlar)
// ═══════════════════════════════════════════════════════════════

bot.on('message', async (msg) => {
  // Buyruqlar, to'lovlar va rasmlarni o'tkazib yuborish
  if (!msg.text) return;
  if (msg.text.startsWith('/')) return;
  if (msg.successful_payment) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text.trim();

  const user = await getUser(userId, msg.from.first_name, msg.from.username);
  if (!user) {
    return bot.sendMessage(chatId, '❌ Xatolik yuz berdi. /start bosing.');
  }

  const session = getSession(userId);

  // ── PROFIL TAHRIRLASH ──
  if (session.profileEditing) {
    const field = session.profileEditing;
    let dbField, value;
    let success = false;

    switch (field) {
      case 'age':
        const age = parseInt(text);
        if (isNaN(age) || age < 1 || age > 150) {
          return bot.sendMessage(chatId, '❌ Noto\'g\'ri yosh. 1-150 orasida raqam kiriting:');
        }
        dbField = 'age'; value = age;
        break;

      case 'weight':
        const weight = parseFloat(text);
        if (isNaN(weight) || weight < 1 || weight > 500) {
          return bot.sendMessage(chatId, '❌ Noto\'g\'ri vazn. Masalan: 72.5');
        }
        dbField = 'weight'; value = weight;
        break;

      case 'height':
        const height = parseFloat(text);
        if (isNaN(height) || height < 30 || height > 300) {
          return bot.sendMessage(chatId, '❌ Noto\'g\'ri bo\'y. Masalan: 175');
        }
        dbField = 'height'; value = height;
        break;

      case 'allergies':
        dbField = 'allergies'; value = text;
        break;

      case 'chronic':
        dbField = 'chronic_diseases'; value = text;
        break;

      case 'meds':
        dbField = 'current_medications'; value = text;
        break;

      default:
        session.profileEditing = null;
        return bot.sendMessage(chatId, '❌ Noma\'lum maydon.', profileEditMenu());
    }

    success = await updateUserField(userId, dbField, value);
    session.profileEditing = null;

    if (success) {
      return bot.sendMessage(chatId, `✅ Saqlandi!`, profileEditMenu());
    } else {
      return bot.sendMessage(chatId, '❌ Saqlashda xato.', profileEditMenu());
    }
  }

  // ── SURUNKALI KASALLIK MA'LUMOT KIRITISH ──
  if (session.awaitingInput === 'chronic_data' && session.section === 'chronic' && session.chronicDisease) {
    if (!checkDailyLimit(user)) {
      return bot.sendMessage(chatId, '❌ Kunlik limit tugadi. /premium bosing!');
    }

    await bot.sendMessage(chatId, '⏳ Ma\'lumotlar tahlil qilinmoqda...');

    session.awaitingInput = null;

    // Oldingi loglarni olish
    const previousLogs = await getChronicLogs(userId, session.chronicDisease, 7);

    session.messages.push({
      role: 'user',
      content: `Kasallik: ${session.chronicDisease}\n\nBugungi kiritilgan ma'lumotlar:\n${text}\n\n${previousLogs.length > 0 ? 'So\'nggi 7 kunlik ma\'lumotlar:\n' + JSON.stringify(previousLogs.map(l => ({ sana: l.created_at, data: l.data })), null, 2) : 'Oldingi ma\'lumotlar yo\'q (birinchi kiritish).'}\n\nTahlil qiling: ko'rsatkichlar normadami, trend qanday, alert kerakmi, tavsiyalar.`
    });

    try {
      const response = await sendToAI(SYSTEM_PROMPTS.chronic, session.messages);
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);

      // Alert level aniqlash
      let alertLevel = 'normal';
      if (response.includes('🔴') || response.includes('CRITICAL') || response.includes('SHOSHILINCH')) {
        alertLevel = 'critical';
      } else if (response.includes('🟡') || response.includes('WARNING') || response.includes('DIQQAT')) {
        alertLevel = 'warning';
      }

      // Bazaga saqlash
      await saveChronicLog(userId, session.chronicDisease, { raw: text }, response, alertLevel);

      await sendLongMessage(chatId, response);

      // Chronic disease callback uchun mos key topish
      const diseaseCallbackMap = {
        'Diabet mellitus Type 2': 'chronic_diabetes2',
        'Diabet mellitus Type 1': 'chronic_diabetes1',
        'Gipertoniya': 'chronic_hypertension',
        'Yurak yetishmovchiligi': 'chronic_heartfailure',
        'COPD': 'chronic_copd',
        'Bronxial astma': 'chronic_asthma',
        'Surunkali buyrak kasalligi (CKD)': 'chronic_ckd',
        'Revmatoid artrit': 'chronic_ra',
        'Gipotireoz': 'chronic_hypothyroid',
        'Gipertireoz': 'chronic_hyperthyroid',
        'Epilepsiya': 'chronic_epilepsy',
        'Depressiya': 'chronic_depression'
      };

      const cbKey = diseaseCallbackMap[session.chronicDisease] || 'chronic_diabetes2';
      await bot.sendMessage(chatId, 'Davom:', chronicActiveKeyboard(cbKey));
    } catch (error) {
      console.error('Chronic data xato:', error.message);
      await bot.sendMessage(chatId, '❌ Tahlil qilishda xato.');
    }
    return;
  }

  // ── DIAGNOSTIKA LAB NATIJALAR (MATNLI) ──
  if (session.awaitingInput === 'lab_results' && session.section === 'diagnostic') {
    if (!checkDailyLimit(user)) {
      return bot.sendMessage(chatId, '❌ Kunlik limit tugadi. /premium bosing!');
    }

    await bot.sendMessage(chatId, '⏳ Tahlil natijalari o\'rganilmoqda...');

    session.awaitingInput = null;

    const profile = await getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    const labNames = {
      blood: 'Qon tahlili', urine: 'Siydik tahlili',
      hormone: 'Gormon tahlili', other: 'Tahlil'
    };

    const messages = [{
      role: 'user',
      content: `Quyidagi ${labNames[session.diagnosticSubType] || 'laboratoriya'} natijalarini tahlil qiling:${profileContext}\n\nTAHLIL NATIJALARI:\n${text}\n\nHar bir ko'rsatkichni normal diapazon bilan solishtiring, og'ishlarni aniqlang, pattern tahlil qiling va umumiy klinik rasmni tahlil qiling.`
    }];

    try {
      const response = await sendToAI(SYSTEM_PROMPTS.diagnostic, messages);
      await incrementUsage(userId, user.daily_count);

      // Bazaga saqlash
      await saveMedicalRecord(userId, 'lab', labNames[session.diagnosticSubType] || 'Tahlil',
        { raw: text, subType: session.diagnosticSubType }, null, response);

      await sendLongMessage(chatId, response);
      clearSession(userId);

      await bot.sendMessage(chatId, 'Davom etish:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔬 Yana tahlil', callback_data: 'section_diagnostic' }],
            [{ text: '👨‍⚕️ Shifokorga so\'rash', callback_data: 'section_doctor' }],
            [{ text: '🏥 Asosiy menyu', callback_data: 'main_menu' }]
          ]
        }
      });
    } catch (error) {
      console.error('Lab analysis xato:', error.message);
      await bot.sendMessage(chatId, '❌ Tahlil qilishda xato. Qaytadan urinib ko\'ring.');
      clearSession(userId);
    }
    return;
  }

  // ── DIAGNOSTIKA IMAGE KUTISH (matn keldi, rasm kerak edi) ──
  if (session.awaitingInput === 'medical_image' && session.section === 'diagnostic') {
    // Foydalanuvchi rasm o'rniga matn yubordi — izoh sifatida qabul qilish
    session.diagnosticCaption = text;
    return bot.sendMessage(chatId,
      `✅ Ma'lumot qabul qilindi: "${text}"\n\nEndi 📸 rasmni yuboring:`);
  }

  // ── FAOL SUHBAT (Doctor yoki Drug) ──
  if (session.section === 'doctor' || session.section === 'drug') {
    if (!checkDailyLimit(user)) {
      return bot.sendMessage(chatId,
        '❌ Kunlik limitingiz tugadi.\n💎 /premium bosing!',
        { reply_markup: { inline_keyboard: [[{ text: '💎 Premium', callback_data: 'buy_premium' }]] } }
      );
    }

    // Shoshilinch holat tekshirish
    if (checkEmergency(text)) {
      const emergencyMsg = `🚨🚨🚨 SHOSHILINCH HOLAT ANIQLANDI 🚨🚨🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ DARHOL 103 GA QO'NG'IROQ QILING!

Sizning xabaringizda shoshilinch tibbiy yordam talab qiladigan belgilar aniqlandi.

🏥 TEZ YORDAM KELGUNCHA:
1. Tinch bo'ling, o'tirib yoki yotib oling
2. Yoningizda biror kishini chaqiring
3. 103 ga qo'ng'iroq qiling
4. Manzilni aniq ayting

⏰ HAR BIR DAQIQA MUHIM!`;

      await bot.sendMessage(chatId, emergencyMsg);
    }

    // Ixtisoslikni aniqlash
    if (!session.specialty) {
      const detected = detectSpecialty(text);
      if (detected) session.specialty = detected;
    }

    session.messages.push({ role: 'user', content: text });
    session.messageCount++;

    // Bazaga saqlash
    await saveChatMessage(userId, session.section, 'user', text);

    await bot.sendMessage(chatId, '⏳ Tahlil qilinmoqda...');

    try {
      // Oxirgi 20 xabar
      const messagesToSend = session.messages.slice(-20);

      const response = await sendToAI(
        SYSTEM_PROMPTS[session.section],
        messagesToSend
      );

      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);

      // Bazaga saqlash
      await saveChatMessage(userId, session.section, 'assistant', response);

      await sendLongMessage(chatId, response);
      await bot.sendMessage(chatId, '💬 Davom eting yoki yakunlang:',
        activeSessionKeyboard(session.section));

    } catch (error) {
      console.error('AI xato:', error.message);
      await bot.sendMessage(chatId,
        '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring yoki /end bosing.');
    }
    return;
  }

  // ── SURUNKALI KASALLIK REJIMIDA ERKIN XABAR ──
  if (session.section === 'chronic' && session.chronicDisease) {
    if (!checkDailyLimit(user)) {
      return bot.sendMessage(chatId, '❌ Kunlik limit tugadi. /premium bosing!');
    }

    session.messages.push({ role: 'user', content: text });

    await bot.sendMessage(chatId, '⏳ Javob tayyorlanmoqda...');

    try {
      const response = await sendToAI(SYSTEM_PROMPTS.chronic, session.messages.slice(-20));
      session.messages.push({ role: 'assistant', content: response });
      await incrementUsage(userId, user.daily_count);

      await sendLongMessage(chatId, response);
    } catch (error) {
      await bot.sendMessage(chatId, '❌ Xatolik yuz berdi.');
    }
    return;
  }

  // ── HECH QAYSI BO'LIM TANLANMAGAN ──
  // Eski xulq-atvor — oddiy tibbiy savol sifatida javob berish (drug bo'limidek)
  if (!checkDailyLimit(user)) {
    return bot.sendMessage(chatId,
      `❌ Kunlik bepul limitingiz tugadi (5/5).\n\n💎 Premium olish uchun /premium bosing!`
    );
  }

  await bot.sendMessage(chatId, '⏳ Javob tayyorlanmoqda...');

  try {
    await incrementUsage(userId, user.daily_count);

    const profile = await getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    const response = await sendToAI(
      SYSTEM_PROMPTS.drug, // Default — dori maslahatchisi
      [{ role: 'user', content: text + profileContext }]
    );

    await sendLongMessage(chatId, response);
    await bot.sendMessage(chatId,
      '💡 Aniqroq yordam uchun bo\'limni tanlang:',
      mainMenuKeyboard()
    );
  } catch (error) {
    console.error('AI xato:', error.message);
    await bot.sendMessage(chatId, '❌ Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

bot.on('polling_error', (error) => {
  console.error('Polling xato:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// ═══════════════════════════════════════════════════════════════
console.log('🏥 MedAI Full Version bot ishga tushdi! ✅');
console.log('📋 Bo\'limlar: Shifokor | Dori | Surunkali | Diagnostika');
console.log('⏰', new Date().toLocaleString());
// ═══════════════════════════════════════════════════════════════
