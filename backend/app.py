import os
import requests
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from a .env file for local development.
# On Hugging Face Spaces, we set the secret in the settings.
load_dotenv()

# --- Configuration ---
# **FINAL MODEL CHOICE:** Using flan-t5-large for its speed and strong
# performance on multilingual Question-Answering tasks.
MODEL_ID = "google/flan-t5-large"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = f"https://api-inference.huggingface.co/models/{MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}


# --- FastAPI App Setup ---
app = FastAPI(title="QBrain AI Backend")

# CORS Middleware is crucial for allowing the Vercel frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, you can restrict this to your Vercel domain.
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
    """ A simple root endpoint to check if the server is live and what model it's using. """
    return {"message": f"QBrain AI Backend is running. Using model: {MODEL_ID}"}

def query_huggingface_api(payload):
    """ Helper function to call the Hugging Face Inference API. """
    response = requests.post(API_URL, headers=HEADERS, json=payload)
    response.raise_for_status()  # This will raise an HTTPError for bad responses (4xx or 5xx)
    return response.json()

@app.post("/api/chat-paste errors.

Here is the complete and final `app.py` code, updated to use `google/flan-t5-large`.

**Copy this entire block of code and use it to completely replace the content of your `backend/app.py` file.**

### File: `backend/app.py`

```python
import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from a .env file (for local development)
# On Hugging Face Spaces, this will use the Repository secrets.
load_dotenv()

# --- Configuration ---
# We are now using a model specifically designed for multilingual Question-Answering.
MODEL_ID = "google/flan-t5-large"
HF_API_TOKEN = os.getenv("HF_API_TOKEN") # Get the token from environment/secrets
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

# --- Pydantic Models (Data structure for request/response) ---
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
    response.raise_for_status() # Raise an exception for bad status codes (like 401, 404)
    return response.json()

@app.post("/api/chat", response_model=Response)
async def chat_with_ai(question: Question):
    
    try:
        # Call the external Hugging Face API
        # NOTE: Flan-T5 models are not chat models. They don't need a complex prompt template.
        # We just send the user's question directly as the input.
        api_response = query_huggingface_api({
            "inputs": question.text, # Send the user's text directly
            "parameters": {
                "max_new_tokens": 200,  # Control response length
                "temperature": 0.7,     # A bit of creativity
                "top_p": 0.95,
                "return_full_text": False, # We only want the generated answer
            }
        })
        
        # The API returns a list, and the T5 response is in the 'generated_text' key.
        generated_text = api_response[0].get("generated_text", "Sorry, I couldn't generate a response.").strip()
        
        return {"answer": generated_text}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Hugging Face API: {e}")
        return {"answer": "Sorry, I'm having trouble connecting to the AI brain. Please try again later."}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"answer": "An unexpected error occurred. Please contact support."}


# This block makes the app runnable when executed directly
# which is how Hugging Face Spaces starts the application.
if __name__ == "__main__":
    import uvicorn

    # Run the FastAPI app with uvicorn, listening on the port HF Spaces expects
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=False)