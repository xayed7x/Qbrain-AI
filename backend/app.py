import os
import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables.
load_dotenv()

# --- Configuration ---
MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}


# --- KNOWLEDGE BASE ABOUT THE CREATOR (with Social Media Links) ---
# This text block acts as the AI's "memory" about Zayed Bin Hamid.
ABOUT_ZAYED = """
Zayed Bin Hamid is a passionate full-stack developer and tech entrepreneur from Khulna, Bangladesh.
He is the visionary creator behind QBrain AI — an educational AI assistant designed to help SSC students
across Bangladesh access personalized, high-quality academic support for free.

Key facts about Zayed Bin Hamid:
- 🎯 Mission-Driven: Zayed is focused on solving real-world problems through technology and making education more accessible.
- 💻 Skilled Developer: He has expertise in Python, JavaScript, FastAPI, Hugging Face, and modern deployment platforms like Vercel.
- 🌍 Future-Oriented: His goal is to expand QBrain AI to cover all NCTB textbooks and subjects, becoming the #1 AI study assistant for Bangladeshi students.
- 🚀 Self-Taught & Determined: Zayed is a hardworking learner who built QBrain AI from scratch, driven by passion and a belief in the power of tech to uplift his community.
- 🧠 AI Ethos: He envisions a future where AI supports — not replaces — learners, and tools like QBrain reflect Islamic values and positive impact.

You can connect with Zayed or follow his work here:
- GitHub: https://github.com/xayed7x
- LinkedIn: linkedin.com/in/zayed-web-developer
- YouTube: https://youtube.com/@zayedofficialbd?si=IbhhzeLwwOO6yYUm
- Facebook: https://www.facebook.com/share/15Sp8vDAWL/
- X: x.com/Xayed007?t=6lu-_OrAbQRrd-U-xy8oPw&s=09
- Instagram: instagram.com/xayed007?igsh=ZDRnNW1zaWx1Y2x6
"""


# --- FastAPI App Setup ---
app = FastAPI(title="QBrain AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---
class Question(BaseModel):
    text: str

class Response(BaseModel):
    answer: str


# --- API Endpoints ---
@app.get("/")
def read_root():
    """ A simple root endpoint to check if the server is live. """
    return {"message": f"QBrain AI Backend is running. Using model: {MODEL_ID}"}


@app.get("/whoami", summary="Get Creator Information")
def whoami():
    """Returns a JSON object with information about the creator, Zayed Bin Hamid."""
    return {"creator": "Zayed Bin Hamid", "bio": ABOUT_ZAYED.strip()}


@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    """
    Receives a question, formats it with a system prompt including the creator's bio,
    queries the AI model, and returns the answer.
    """
    # Define the AI's persona and knowledge base in a system prompt.
    system_prompt = (
        "You are QBrain AI, a friendly and helpful AI study assistant for students in Bangladesh.\n"
        "Here is information about your creator:\n"
        f"--- ABOUT THE CREATOR ---\n{ABOUT_ZAYED.strip()}\n--- END OF INFO ---\n\n"
        "When a user asks about who made you, your creator, your developer, or about Zayed Bin Hamid, "
        "use the information provided above to give a comprehensive and respectful answer. "
        "If they ask for more details or how to connect with him, offer the social media links. "
        "Do not mention Microsoft or the base model name (Phi-3)."
    )

    # Use the correct, structured prompt format for the Phi-3 model.
    prompt = f"<|system|>\n{system_prompt}<|end|>\n<|user|>\n{question.text}<|end|>\n<|assistant|>"

    try:
        api_response = query_huggingface_api({
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 250,
                "return_full_text": False,
                "temperature": 0.7,
            }
        })
        generated_text = api_response[0].get("generated_text", "Sorry, I couldn't generate a response.").strip()
        return {"answer": generated_text}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return {"answer": "Sorry, I'm having trouble connecting to the AI brain. Please try again later."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"answer": "An unexpected error occurred. Please contact the administrator."}


def query_huggingface_api(payload):
    """ Helper function to call the Hugging Face Inference API. """
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()


# This block makes the app runnable for Hugging Face Spaces deployment.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)