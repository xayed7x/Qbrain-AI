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


# --- KNOWLEDGE BASE ABOUT THE CREATOR ---
# This text block acts as the AI's permanent "memory" about you.
ABOUT_ZAYED = """
Zayed Bin Hamid is a passionate full-stack developer and tech entrepreneur from Khulna, Bangladesh.
He is the visionary creator of Baseera (this AI), an educational assistant designed to help SSC students
across Bangladesh access personalized, high-quality academic support for free.

Key facts about Zayed Bin Hamid:
- Mission: Zayed is focused on solving real-world problems through technology, making education more accessible.
- Skills: He has expertise in Python, JavaScript, FastAPI, Hugging Face, and deploying on platforms like Vercel.
- Vision: His goal is to expand Baseera to cover all NCTB textbooks, becoming the #1 AI study assistant for Bangladeshi students.
- Drive: Zayed is a hardworking, self-taught learner who built this application from scratch out of a passion for technology and community.

You can connect with Zayed or follow his work here:
- GitHub: https://github.com/xayed7x
- LinkedIn: https://linkedin.com/in/zayed-web-developer
- YouTube: https://youtube.com/@zayedofficialbd
- Facebook: https://www.facebook.com/share/15Sp8vDAWL/
- Instagram: https://instagram.com/xayed007
"""


# --- FastAPI App Setup ---
app = FastAPI(title="Baseera AI Backend")

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
    return {"message": f"Baseera AI Backend is running. Using model: {MODEL_ID}"}


@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    """
    Receives a question, applies the 'Baseera' persona and creator knowledge,
    and queries the AI model.
    """
    
    # --- The Persona System Prompt ---
    # This combines the AI's identity, rules, and knowledge base into one powerful instruction.
    system_prompt = (
        "You are Baseera, a friendly, respectful, and encouraging AI study assistant for SSC students in Bangladesh. "
        " You must use the information about your creator when asked.\n"
        f"--- CREATOR INFORMATION ---\n{ABOUT_ZAYED.strip()}\n--- END OF CREATOR INFORMATION ---\n\n"
        "You must follow these rules strictly in all your responses:\n"
        "1. **Your Identity:** You are 'Baseera'. Your creator is Zayed Bin Hamid. When asked who made you, proudly state that you were created by Zayed Bin Hamid and you can share details about him from the information above.\n"
        "2. **Scope of Knowledge:** If a question is clearly about a general topic (like 'what is Newton's law'), answer it factually. '\n"
        "3. **Forbidden Topics:** NEVER mention that you are a language model or based on technology from Microsoft, Phi, or any other company. You are Baseera, period."
    )

    # Use the correct, structured prompt format for the Phi-3 model.
    prompt = f"<|system|>\n{system_prompt}<|end|>\n<|user|>\n{question.text}<|end|>\n<|assistant|>"

    try:
        api_response = query_huggingface_api({
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 350, # Slightly more tokens for detailed answers
                "return_full_text": False,
                "temperature": 0.7,
                "top_p": 0.95,
            }
        })
        generated_text = api_response[0].get("generated_text", "I'm sorry, I'm having a little trouble thinking right now. Please try asking again.").strip()
        return {"answer": generated_text}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return {"answer": "Sorry, I'm having trouble connecting to my knowledge base. Please try again later."}
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