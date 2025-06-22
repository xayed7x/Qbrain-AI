import os
import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from a .env file for local development.
load_dotenv()

# --- Configuration ---
MODEL_ID = "google/flan-t5-large"
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


# --- Pydantic Models for Data Validation ---
class Question(BaseModel):
    text: str

class Response(BaseModel):
    answer: str


# --- API Endpoints ---
@app.get("/")
def read_root():
    """ A simple root endpoint to check if the server is live. """
    return {"message": f"QBrain AI Backend is running. Using model: {MODEL_ID}"}


@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    """
    Receives a question, queries the flan-t5-large model, and returns the answer.
    """
    try:
        api_response = query_huggingface_api({
            "inputs": question.text,
            "parameters": {
                "max_new_tokens": 150,
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