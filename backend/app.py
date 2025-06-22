import os
import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}

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
    return {"message": f"QBrain AI Backend is running. Using model: {MODEL_ID}"}

@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    """
    Receives a question and queries the Phi-3 model.
    """
    try:
        prompt = f"<|user|>\n{question.text}</s>\n<|assistant|>"
        api_response = query_huggingface_api({
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 250,
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False
            }
        })
        generated_text = api_response[0].get("generated_text", "Sorry, I couldn't generate a response.").strip()
        return {"answer": generated_text}
    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return {"answer": "Sorry, the AI model seems to be unavailable right now. Please try again in a moment."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"answer": "An unexpected error occurred. Please contact the administrator."}

def query_huggingface_api(payload):
    """ Helper function to call the Hugging Face Inference API. """
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

# This block makes the app runnable for Hugging Face Spaces.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)