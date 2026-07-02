from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.hf_service import send_chat_message_to_hf, test_hf_connection

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

class ChatMessage(BaseModel):
    id: Optional[str] = None
    sender: str
    text: str
    timestamp: Optional[str] = None

class ChatPayload(BaseModel):
    message: str
    chatHistory: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    answer: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_hf(payload: ChatPayload):
    """Proxy chatbot messages to Hugging Face models using secure backend credentials."""
    try:
        # Convert Pydantic chat history models to dict lists
        history_list = []
        if payload.chatHistory:
            history_list = [msg.dict() for msg in payload.chatHistory]
            
        answer = send_chat_message_to_hf(payload.message, history_list)
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/diagnostics")
def get_hf_diagnostics():
    """Execute Hugging Face Inference API connection tests from the backend and return diagnostic status logs."""
    try:
        return test_hf_connection()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
