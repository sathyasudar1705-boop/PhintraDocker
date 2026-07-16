from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.approved_sender import ApprovedSender
from app.models.user import User
from app.dependencies import require_manager, require_admin

router = APIRouter(prefix="/approved-senders", tags=["Approved Senders"])

@router.get("", response_model=List[dict])
def list_approved_senders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """List all approved senders (Managers & Admins)."""
    senders = db.query(ApprovedSender).all()
    return [
        {
            "id": str(s.id),
            "email": s.email,
            "display_name": s.display_name,
            "domain": s.domain,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in senders
    ]

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_approved_sender(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Add a new approved sender address (Admins only)."""
    required = ["email", "display_name"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

    email = payload["email"].strip()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")

    domain = email.split("@")[-1].lower()

    # Prevent duplicate emails
    existing = db.query(ApprovedSender).filter(ApprovedSender.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="This sender email is already approved")

    sender = ApprovedSender(
        email=email,
        display_name=payload["display_name"].strip(),
        domain=domain,
        is_active=payload.get("is_active", True)
    )
    db.add(sender)
    db.commit()
    db.refresh(sender)

    return {
        "id": str(sender.id),
        "email": sender.email,
        "display_name": sender.display_name,
        "domain": sender.domain,
        "is_active": sender.is_active,
        "created_at": sender.created_at.isoformat() if sender.created_at else None
    }

@router.put("/{id}", response_model=dict)
def update_approved_sender(
    id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update approved sender details or active status (Admins only)."""
    sender = db.query(ApprovedSender).filter(ApprovedSender.id == id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Approved sender not found")

    if "email" in payload:
        email = payload["email"].strip()
        if "@" not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        domain = email.split("@")[-1].lower()
        sender.email = email
        sender.domain = domain

    if "display_name" in payload:
        sender.display_name = payload["display_name"].strip()

    if "is_active" in payload:
        sender.is_active = bool(payload["is_active"])

    db.commit()
    db.refresh(sender)

    return {
        "id": str(sender.id),
        "email": sender.email,
        "display_name": sender.display_name,
        "domain": sender.domain,
        "is_active": sender.is_active,
        "created_at": sender.created_at.isoformat() if sender.created_at else None
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_approved_sender(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete an approved sender (Admins only)."""
    sender = db.query(ApprovedSender).filter(ApprovedSender.id == id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Approved sender not found")
    db.delete(sender)
    db.commit()
    return None
