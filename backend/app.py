import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from a .env file (for local development)
# On Hugging Face Spaces, we'll set this as a secret.
load_dotenv()

# --- Configuration ---
# The model we want to use from the Hugging Face Hub
# Let's use a very capable model that works well with the free Inference API
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"
HF_API_TOKEN = os.getenv("HF_API_TOKEN") # Get the token from environment/secrets
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}

# --- FastAPI App Setup ---
app = FastAPI(title="QBrain AI Backend Proxy")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now, lock this down in production
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

def query_huggingface_api(payload):
    """Function to call the Hugging Face Inference API"""
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    response.raise_for_status() # Raise an exception for bad status codes
    return response.json()

@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    prompt = f"[INST] {question.text} [/INST]"
    
    try:
        # Call the external Hugging Face API
        api_response = query_huggingface_api({
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 250, # Control response length
                "temperature": 0.7,
                "top_p": 0.95,
                "return_full_text": False, # IMPORTANT: Only return the generated part
            }
        })
        
        # The API returns a list, we take the first element's generated text
        generated_text = api_response[0].get("generated_text", "Sorry, I couldn't generate a response.").strip()
        
        return {"answer": generated_text}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return {"answer": "Sorry, I'm having trouble connecting to the AI brain. Please try again later."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"answer": "An unexpected error occurred. Please contact support."}
    

    # --- Add this block at the very end of the file ---
# This makes the app runnable when executed directly
if __name__ == "__main__":
    import uvicorn

    # Run the FastAPI app with uvicorn
    # The host and port are set to what Hugging Face Spaces expects
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=False)