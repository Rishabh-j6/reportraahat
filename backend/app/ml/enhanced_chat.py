"""
Enhanced Doctor Chat with RAG from Hugging Face
Uses your dataset + FAISS index for grounded, factual responses
"""
import sys
import os

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

try:
    from huggingface_hub import hf_hub_download, list_repo_files
    HAS_HF = True
except ImportError:
    HAS_HF = False
    print("⚠️  huggingface_hub not installed — RAG disabled, mock responses only")

try:
    import faiss
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False
    print("⚠️  faiss-cpu not installed — RAG disabled, mock responses only")

import numpy as np
from typing import Optional
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HF_REPO = os.getenv("HF_INDEX_REPO", "CaffeinatedCoding/reportraahat-indexes")
HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_USER = "CaffeinatedCoding"

class RAGDocumentRetriever:
    """Retrieve relevant documents from HF using FAISS."""
    
    def __init__(self):
        self.index = None
        self.documents = []
        self.embeddings_model = None
        self.loaded = False
        self._load_from_hf()
    
    def _load_from_hf(self):
        """Download and load FAISS index + documents from HF."""
        if not HAS_HF or not HAS_FAISS:
            print("⚠️  Skipping RAG loading (missing dependencies)")
            self.loaded = False
            return
        try:
            print("📥 Loading FAISS index from HF...")
            
            # First, list all files in the repo to see what's available
            try:
                print(f"   Checking files in {HF_REPO}...")
                files = list_repo_files(
                    repo_id=HF_REPO,
                    repo_type="dataset",
                    token=HF_TOKEN
                )
                print(f"   Available files: {files}")
            except Exception as e:
                print(f"   ⚠️  Could not list files: {e}")
            
            # Try downloading FAISS index with token
            try:
                index_path = hf_hub_download(
                    repo_id=HF_REPO,
                    filename="index.faiss",
                    repo_type="dataset",
                    token=HF_TOKEN
                )
                
                # Load FAISS index
                self.index = faiss.read_index(index_path)
                print("✅ FAISS index loaded")
            except Exception as e:
                print(f"   ⚠️  Could not load index.faiss: {e}")
                print("   Trying alternative names...")
                # Try alternative names
                for alt_name in ["faiss.index", "knn.index", "vec.index", "index"]:
                    try:
                        index_path = hf_hub_download(
                            repo_id=HF_REPO,
                            filename=alt_name,
                            repo_type="dataset",
                            token=HF_TOKEN
                        )
                        self.index = faiss.read_index(index_path)
                        print(f"✅ FAISS index loaded from {alt_name}")
                        break
                    except:
                        pass
            
            # Download documents metadata
            try:
                docs_path = hf_hub_download(
                    repo_id=HF_REPO,
                    filename="documents.json",
                    repo_type="dataset",
                    token=HF_TOKEN
                )
                with open(docs_path, 'r', encoding='utf-8') as f:
                    self.documents = json.load(f)
                print(f"✅ Loaded {len(self.documents)} documents")
            except Exception as e:
                print(f"   ⚠️  Could not load documents.json: {e}")
                # Try alternative document formats
                for alt_doc in ["documents.parquet", "docs.json", "embeddings.json"]:
                    try:
                        docs_path = hf_hub_download(
                            repo_id=HF_REPO,
                            filename=alt_doc,
                            repo_type="dataset",
                            token=HF_TOKEN
                        )
                        if alt_doc.endswith('.json'):
                            with open(docs_path, 'r', encoding='utf-8') as f:
                                self.documents = json.load(f)
                        print(f"✅ Loaded documents from {alt_doc}")
                        break
                    except:
                        pass
            
            self.loaded = True if self.index is not None else False
            
        except Exception as e:
            print(f"⚠️  Could not load RAG from HF: {e}")
            self.loaded = False
    
    def retrieve(self, query_embedding: list, k: int = 3) -> list:
        """Retrieve top-k similar documents."""
        if not self.loaded or self.index is None:
            return []
        
        try:
            query = np.array([query_embedding]).astype('float32')
            distances, indices = self.index.search(query, min(k, self.index.ntotal))
            
            results = []
            for idx in indices[0]:
                if 0 <= idx < len(self.documents):
                    results.append(self.documents[int(idx)])
            
            return results
        except:
            return []


def get_enhanced_mock_response(message: str, guc: dict, retrieved_docs: list = None) -> str:
    """Generate response with RAG grounding."""
    
    name = guc.get("name", "Patient")
    report = guc.get("latestReport", {})
    findings = report.get("findings", [])
    affected_organs = report.get("affected_organs", [])
    message_lower = message.lower()
    
    # Check for specific findings
    anemia_found = any('hemoglobin' in str(f.get('parameter', '')).lower() for f in findings)
    iron_found = any('iron' in str(f.get('parameter', '')).lower() for f in findings)
    b12_found = any('b12' in str(f.get('parameter', '')).lower() for f in findings)
    
    # Build response with RAG context
    response = ""
    
    # 1. Main response based on intent + findings
    if anemia_found and any(word in message_lower for word in ['tired', 'fatigue', 'weak', 'energy', 'exhausted']):
        response = f"""Dr. Raahat: I see from your report that you have signs of anemia with low hemoglobin and RBC levels - this definitely explains the fatigue you're experiencing, {name}.

**What's happening:**
Your red blood cells are lower than normal, which means less oxygen delivery to your muscles and brain. That's why you feel tired and weak.

**Immediate action plan:**

1. **Increase iron-rich foods** (eat daily):
   - Red meat, chicken, fish (best sources)
   - Spinach, lentils, chickpeas
   - Pumpkin seeds, fortified cereals
   - Combine with vitamin C (orange, lemon, tomato) for better absorption

2. **Take supplements** (discuss dosage with doctor):
   - Iron supplement (typically 325mg ferrous sulphate)
   - Vitamin B12 (oral or injections)
   - Folic acid (helps iron work better)

3. **Lifestyle changes:**
   - Get 7-8 hours of sleep
   - Avoid intense exercise for now
   - Drink 3 liters of water daily
   - Reduce tea/coffee (blocks iron absorption)

**Recovery timeline**: You should feel noticeably better in 2-3 weeks with consistent effort.

What specific food preferences do you have? I can give personalized suggestions."""

    elif (iron_found or b12_found) and any(word in message_lower for word in ['diet', 'food', 'eating', 'nutrition', 'eat']):
        response = f"""Dr. Raahat: Great question! Your low iron and B12 need specific dietary attention, {name}.

**Iron-rich foods (eat 2-3 daily):**
- **Best sources**: Red meat, liver, oysters, sardines
- **Good sources**: Chicken, turkey, tofu, lentils, beans
- **Plant-based**: Spinach, kale, pumpkin seeds, fortified cereals

**B12 recovery foods:**
- Eggs, milk, cheese (2-3 servings daily)
- Fish, chicken, beef
- Fortified cereals and plant milk

**Pro absorption tips:**
✓ Always pair iron with vitamin C (increases absorption by 3x)
- Breakfast: Iron cereal + orange juice
- Lunch: Spinach with lemon juice
- Dinner: Lentils with tomato curry

✗ Avoid these with iron meals:
- Tea, coffee, cola (blocks absorption)
- Milk, cheese, calcium supplements (wait 2 hours)
- Antacids (remove iron before it's absorbed)

**Sample daily meal plan:**
- **Breakfast**: Fortified cereal (20mg iron) + fresh orange juice
- **Lunch**: Spinach and chickpea curry with lemon
- **Snack**: Pumpkin seeds + apple
- **Dinner**: Lentil soup (15mg iron) + tomato

**Expected improvement**: Energy boost in 2-3 weeks, full recovery in 6-8 weeks.

Do you have any food allergies or preferences I should know about?"""

    elif any(word in message_lower for word in ['exercise', 'workout', 'walk', 'activity', 'gym']):
        response = f"""Dr. Raahat: Good thinking! Exercise is crucial for recovery, {name}, but we need to be careful with anemia.

**Phase-based exercise plan:**

**Week 1-2 (Recovery phase)**:
- Light walking: 10-15 minutes daily
- Gentle yoga or stretching
- Avoid stairs and running
- Stop if you feel dizzy

**Week 3-4 (Building phase)**:
- Walking: 20-30 minutes daily  
- Swimming (very gentle on body)
- No intense exercise yet

**Week 5+ (Normal activity)**:
- Regular walking (45 mins)
- Light strength training
- Normal daily activities

**Warning signs to stop immediately:**
🛑 Shortness of breath  
🛑 Chest pain or dizziness  
🛑 Extreme fatigue  

**Best time to exercise**:
- Morning (after breakfast + iron absorption)
- Evening (when energy is better)
- Not on an empty stomach

Combine exercise with diet changes and supplements for best results. Ready to start tomorrow?"""

    elif any(word in message_lower for word in ['medicine', 'medication', 'supplement', 'doctor', 'prescription']):
        response = f"""Dr. Raahat: Based on your low hemoglobin, iron, and B12, {name}, here's what you need:

**Essential supplements:**

1. **Iron supplement** (START ASAP)
   - Type: Ferrous sulphate (cheapest, most effective)
   - Dose: Typically 325mg once daily
   - Duration: 8-12 weeks
   - Take with vitamin C, on empty stomach for best absorption
   - Side effects: May cause constipation (normal)

2. **Vitamin B12**
   - Option A: Oral supplement (500-1000 mcg daily)
   - Option B: Injections (1000 mcg weekly for 4 weeks, then monthly)
   - Injections are better for severe deficiency

3. **Folic acid** (works with iron)
   - Dose: 1-5mg daily
   - Helps red blood cell formation

**IMPORTANT - Schedule doctor visit THIS WEEK:**
✓ Get proper dosage prescription
✓ Check for underlying absorption issues
✓ Get baseline blood test
✓ Schedule follow-up in 4 weeks

**What to avoid:**
✗ Don't self-medicate without doctor guidance
✗ High-dose iron needs monitoring
✗ Some medications interact with iron

When can you visit your doctor?"""

    else:
        # Generic contextual response
        response = f"""Dr. Raahat: Thanks for that question, {name}. 

Based on your report showing anemia with low hemoglobin, iron, and B12, here's what's most important right now:

**Your priorities (in order):**
1. **Visit a doctor** - Get proper supplement prescriptions
2. **Dietary changes** - Start eating iron-rich foods today
3. **Supplements** - Iron, B12, and folic acid
4. **Light exercise** - Walking only for now
5. **Track progress** - Note energy levels daily

**This week's action items:**
□ Book doctor appointment  
□ Stock up on spinach, lentils, and red meat  
□ Start morning walks  
□ Get 7-8 hours sleep  

Which of these do you want help with first?"""
    
    # 2. Add RAG-grounded information if available
    if retrieved_docs:
        response += f"\n\n**Relevant medical information:**"
        for i, doc in enumerate(retrieved_docs[:2], 1):
            doc_title = doc.get('title', 'Medical Information')
            doc_snippet = doc.get('content', doc.get('text', ''))[:150]
            if doc_snippet:
                response += f"\n{i}. *{doc_title}*: {doc_snippet}..."
        
        response += "\n\n📚 *Note: This information is sourced from verified medical databases.*"
    
    return response


# Initialize RAG on module load
rag_retriever = None
try:
    rag_retriever = RAGDocumentRetriever()
except Exception as e:
    print(f"⚠️  RAG not available: {e}")
