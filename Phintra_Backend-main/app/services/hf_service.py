import urllib.request
import json
import time
import re
from typing import List, Dict, Any, Optional
from app.config import settings

def call_hf_model(model_id: str, prompt: str, max_retries: int = 3) -> str:
    token = settings.HF_API_TOKEN
    if not token:
        raise ValueError("Hugging Face API token is not configured on the backend. Please add HF_API_TOKEN to your environment variables.")

    url = f"https://api-inference.huggingface.co/models/{model_id}"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 200,
            "temperature": 0.4,
            "return_full_text": False
        }
    }

    retry_delay = 1.0  # seconds
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                return response.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            # Handle HTTP 503 (Model loading) or 429 (Rate limit)
            is_transient = e.code in [429, 503]
            if is_transient and attempt < max_retries - 1:
                # If 503 model is loading, wait a bit longer
                sleep_time = 5.0 if e.code == 503 else retry_delay
                time.sleep(sleep_time)
                retry_delay *= 2
                continue
            
            # Read detailed error body if possible
            err_body = ""
            try:
                err_body = e.read().decode("utf-8")
            except Exception:
                pass
            raise HTTPException_wrapper(e.code, f"HF HTTP Error {e.code}: {e.reason}. Detail: {err_body}")
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            raise Exception(f"Failed to reach Hugging Face model {model_id}: {str(e)}")

class HTTPException_wrapper(Exception):
    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code

def parse_hf_response(response_body: str) -> str:
    try:
        data = json.loads(response_body)
    except Exception as e:
        raise ValueError(f"Failed to parse response body as JSON. Raw body: {response_body}")

    generated_text = ""
    format_parsed = ""

    # Parse formats analogous to JS huggingFaceService
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict) and "generated_text" in data[0]:
        generated_text = data[0]["generated_text"]
        format_parsed = "response[0].generated_text (array)"
    elif isinstance(data, dict) and "generated_text" in data:
        generated_text = data["generated_text"]
        format_parsed = "response.generated_text (object)"
    elif isinstance(data, dict) and "generatedText" in data:
        generated_text = data["generatedText"]
        format_parsed = "response.generatedText (camelCase)"
    elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], str):
        generated_text = data[0]
        format_parsed = "response[0] (string array)"
    elif isinstance(data, dict) and "error" in data:
        raise ValueError(f"API returned error response: {data['error']}")
    else:
        generated_text = json.dumps(data)
        format_parsed = "fallback serialization"

    print(f"[DEBUG HF] Response format parsed successfully: {format_parsed}")
    return generated_text

def clean_ai_response(text: str) -> str:
    # Clean output analogously to JS huggingFaceService
    clean = text.strip()
    # Remove prefix "Assistant:" or "Assistant Assistant:"
    clean = re.sub(r'^(Assistant:|Assistant\sAssistant:)\s*', '', clean, flags=re.IGNORECASE)
    # Remove emojis (regex matching range of standard emoji unicode blocks)
    clean = re.sub(r'[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]', '', clean)
    return clean.strip()

def send_chat_message_to_hf(message: str, chat_history: List[Dict[str, Any]]) -> str:
    # 1. Build prompt template
    prompt = "<s>[INST] You are a professional cybersecurity awareness assistant for the Phintra platform. Reply with a professional, educational, concise, and actionable tone. Never use emojis. Keep responses short and direct.\n\n"
    
    if chat_history:
        for msg in chat_history:
            msg_id = msg.get("id", "")
            if msg_id == 'welcome' or msg_id.startswith('error-fallback') or msg_id.startswith('bot-fallback'):
                continue
            sender = msg.get("sender", "")
            text = msg.get("text", "")
            if sender == 'user':
                prompt += f"User: {text}\n"
            else:
                prompt += f"Assistant: {text}\n"
                
    prompt += f"User: {message} [/INST]"

    # 2. Try Primary Model: mistralai/Mistral-7B-Instruct-v0.2
    try:
        response_body = call_hf_model("mistralai/Mistral-7B-Instruct-v0.2", prompt)
        parsed_text = parse_hf_response(response_body)
        print("[DEBUG HF] Successfully queried primary model: mistralai/Mistral-7B-Instruct-v0.2")
        return clean_ai_response(parsed_text)
    except Exception as e:
        print(f"[DEBUG HF] Primary model failed. Attempting fallback model... Error: {str(e)}")
        # 3. Try Fallback Model: google/gemma-2-2b-it
        try:
            response_body = call_hf_model("google/gemma-2-2b-it", prompt)
            parsed_text = parse_hf_response(response_body)
            print("[DEBUG HF] Successfully queried fallback model: google/gemma-2-2b-it")
            return clean_ai_response(parsed_text)
        except Exception as fallback_err:
            raise Exception(f"Both AI models failed. Primary Error: {str(e)}. Fallback Error: {str(fallback_err)}")

def test_hf_connection() -> Dict[str, Any]:
    # Test connection to Hugging Face models (used for diagnostic console)
    token = settings.HF_API_TOKEN
    token_loaded = bool(token)
    
    if not token_loaded:
        return {
            "tokenLoaded": False,
            "apiStatus": "Failed",
            "modelStatus": "Unavailable",
            "lastError": "Hugging Face API token not found on backend settings.",
            "lastResponseBody": "",
            "activeModel": "mistralai/Mistral-7B-Instruct-v0.2",
            "lastHttpStatus": None,
            "lastParsedFormat": ""
        }

    active_model = "mistralai/Mistral-7B-Instruct-v0.2"
    last_status = None
    last_parsed_format = ""
    last_response_body = ""
    last_err = ""
    api_status = "Failed"
    model_status = "Unavailable"

    # Try Primary
    try:
        res = call_hf_model(active_model, "Test", max_retries=1)
        last_response_body = res
        last_status = 200
        parsed = parse_hf_response(res)
        last_parsed_format = "Parsed successfully"
        api_status = "Connected"
        model_status = "Ready"
    except HTTPException_wrapper as e:
        last_status = e.code
        last_err = str(e)
        # Try Fallback
        active_model = "google/gemma-2-2b-it"
        try:
            res = call_hf_model(active_model, "Test", max_retries=1)
            last_response_body = res
            last_status = 200
            parsed = parse_hf_response(res)
            last_parsed_format = "Parsed successfully"
            api_status = "Connected"
            model_status = "Ready"
        except HTTPException_wrapper as fallback_e:
            last_status = fallback_e.code
            last_err = f"Primary Failed: {str(e)}. Fallback Failed: {str(fallback_e)}"
        except Exception as fallback_e:
            last_err = f"Primary Failed: {str(e)}. Fallback Failed: {str(fallback_e)}"
    except Exception as e:
        last_err = str(e)
        # Try Fallback
        active_model = "google/gemma-2-2b-it"
        try:
            res = call_hf_model(active_model, "Test", max_retries=1)
            last_response_body = res
            last_status = 200
            parsed = parse_hf_response(res)
            last_parsed_format = "Parsed successfully"
            api_status = "Connected"
            model_status = "Ready"
        except Exception as fallback_e:
            last_err = f"Primary Failed: {str(e)}. Fallback Failed: {str(fallback_e)}"

    return {
        "tokenLoaded": token_loaded,
        "apiStatus": api_status,
        "modelStatus": model_status,
        "lastError": last_err,
        "lastResponseBody": last_response_body,
        "activeModel": active_model,
        "lastHttpStatus": last_status,
        "lastParsedFormat": last_parsed_format
    }
