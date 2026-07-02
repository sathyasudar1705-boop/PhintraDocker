from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import os
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.database import get_db
from app.models.employee import Employee
from app.models.company import Company
from app.models.reported_email import ReportedEmail
from app.models.certificate import Reward
from app.models.user import User
from app.models.notification import Notification
from app.models.audit_log import SecurityScore
from app.models.campaign import Campaign, CampaignRecipient
from app.models.email_log import EmailLog
from app.services.ai_service import analyze_email_risk

router = APIRouter(tags=["Outlook Add-in"])

class OutlookReportEmailRequest(BaseModel):
    sender_email: str
    sender_name: str
    subject: str
    received_time: Optional[str] = None
    message_id: str
    internet_message_id: Optional[str] = None
    email_body_preview: Optional[str] = None
    employee_email: EmailStr

@router.post("/outlook/report-email", status_code=status.HTTP_200_OK)
def report_email_from_outlook(req: OutlookReportEmailRequest, request: Request, db: Session = Depends(get_db)):
    """Ingest a suspicious email report from Outlook Add-in, analyze risk, store, and reward employee."""
    try:
        # Validate company key if set
        addon_key = os.getenv("PHINTRA_ADDON_KEY", "phintra-dev-key-123")
        req_key = request.headers.get("X-PHINTRA-ADDON-KEY")
        is_authenticated = (req_key == addon_key)

        # Confirm employee exists
        normalized_email = req.employee_email.strip().lower()
        emp = db.query(Employee).filter(func.lower(Employee.email) == normalized_email).first()
        if not emp:
            return JSONResponse(
                status_code=403,
                content={"success": False, "error": "Employee email not registered under Phintra."}
            )

        email_subject = req.subject or "No Subject"
        email_sender = req.sender_email or "Unknown Sender"
        email_body = req.email_body_preview or ""
        
        reported_at_val = datetime.now()
        if req.received_time:
            try:
                reported_at_val = datetime.fromisoformat(req.received_time.replace("Z", "+00:00"))
            except Exception:
                pass

        # Analyze risk with local/Gemini AI
        analysis = analyze_email_risk(email_subject, email_sender, email_body)
        
        employee_id = emp.id
        employee_name = f"{emp.first_name} {emp.last_name}" if emp.first_name else (emp.name or "Outlook Employee")
        employee_email = emp.email
        department_id = emp.department_id

        # Campaign Auto-Mapping
        campaign_id = None
        campaign_name = "External Outlook Report"
        is_campaign = False

        if employee_email and email_subject:
            email_log = db.query(EmailLog).filter(
                EmailLog.recipient_email == employee_email.strip(),
                EmailLog.subject == email_subject.strip()
            ).order_by(EmailLog.sent_at.desc()).first()
            
            if email_log:
                campaign_id = email_log.campaign_id
                campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
                if campaign:
                    campaign_name = campaign.name
                is_campaign = True
                
                # Update CampaignRecipient status
                recipient = db.query(CampaignRecipient).filter(
                    CampaignRecipient.campaign_id == campaign_id,
                    CampaignRecipient.employee_id == employee_id
                ).first()
                if recipient:
                    recipient.status = "Reported"
                email_log.status = "Reported"

        # Award XP points
        points_added = 150 if is_campaign else 10
        reward_desc = f"Successfully Spotted Simulated Phishing: {email_subject}" if is_campaign else f"Phishing Threat Reported: {email_subject}"
        
        existing_reward = db.query(Reward).filter(
            Reward.employee_id == employee_id,
            Reward.description == reward_desc
        ).first()
        
        if not existing_reward:
            reward = Reward(
                employee_id=employee_id,
                xp_amount=points_added,
                description=reward_desc
            )
            db.add(reward)

        # Update risk score
        reduction = 15.0 if is_campaign else 2.0
        emp.risk_score = max(0.0, emp.risk_score - reduction)
        if emp.risk_score < 20.0:
            emp.status = "Low Risk"
        elif emp.risk_score < 50.0:
            emp.status = "Medium Risk"
        elif emp.risk_score < 80.0:
            emp.status = "High Risk"
        else:
            emp.status = "Critical"

        score_entry = SecurityScore(employee_id=employee_id, score=(100.0 - emp.risk_score))
        db.add(score_entry)

        # Create ReportedEmail record
        db_report = ReportedEmail(
            employee_id=employee_id,
            employee_name=employee_name,
            employee_email=employee_email,
            campaign_id=campaign_id,
            campaign_name=campaign_name,
            department_id=department_id,
            report_source="outlook_addin",
            provider="microsoft",
            message_id=req.message_id,
            outlook_message_id=req.message_id,
            internet_message_id=req.internet_message_id,
            reported_from="outlook",
            email_subject=email_subject,
            email_sender=email_sender,
            sender_email=req.sender_email,
            email_body=email_body,
            threat_score=analysis["risk_score"],
            risk_score=analysis["risk_score"],
            risk_level=analysis["risk_level"],
            status="Pending",
            report_status="Pending",
            report_reason="Reported from Outlook Add-in",
            subject=email_subject,
            sender=email_sender,
            email_date=reported_at_val,
            reported_at=reported_at_val,
            created_at=reported_at_val,
            analysis_results=analysis
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        # Admin notifications
        target_admin_id = emp.admin_id
        if not target_admin_id and emp.company_id:
            company_row = db.query(Company).filter(Company.id == emp.company_id).first()
            if company_row:
                target_admin_id = company_row.admin_id
        
        scoped_admins = db.query(User).filter(User.id == target_admin_id).all() if target_admin_id else db.query(User).filter(User.role == "Admin").all()

        for admin in scoped_admins:
            sec_notif = Notification(
                user_id=admin.id,
                employee_id=employee_id,
                title="New Email Reported",
                message=f"Employee {employee_name} reported a suspicious email.",
                notification_type="security_alert",
                is_read=False
            )
            db.add(sec_notif)

        db.commit()

        # Calculate score
        employee_score = db.query(func.sum(Reward.xp_amount)).filter(Reward.employee_id == employee_id).scalar() or 0

        return {
            "success": True,
            "report_id": str(db_report.id),
            "status": "Reported",
            "subject": email_subject,
            "sender": email_sender,
            "risk_score": analysis["risk_score"],
            "risk_level": analysis["risk_level"],
            "points_added": points_added,
            "employee_score": employee_score
        }
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Internal server error: {str(e)}"}
        )

@router.get("/outlook/report-status")
def get_outlook_report_status(employee_email: EmailStr, db: Session = Depends(get_db)):
    """Retrieve reporting statistics status for the employee."""
    emp = db.query(Employee).filter(func.lower(Employee.email) == employee_email.strip().lower()).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    total_reports = db.query(ReportedEmail).filter(ReportedEmail.employee_id == emp.id).count()
    outlook_reports = db.query(ReportedEmail).filter(ReportedEmail.employee_id == emp.id, ReportedEmail.reported_from == "outlook").count()
    
    return {
        "success": True,
        "employee_email": employee_email,
        "total_reports": total_reports,
        "outlook_reports": outlook_reports,
        "status": "active"
    }

@router.get("/reported-emails")
def fetch_reported_emails(db: Session = Depends(get_db)):
    """Fetch reported emails (admin view)."""
    reports = db.query(ReportedEmail).order_by(ReportedEmail.reported_at.desc()).all()
    output = []
    for r in reports:
        output.append({
            "id": str(r.id),
            "employeeName": r.employee_name,
            "employeeEmail": r.employee_email,
            "campaignName": r.campaign_name or "External Outlook Report",
            "subject": r.email_subject,
            "sender": r.email_sender,
            "body": r.email_body,
            "threatScore": r.threat_score,
            "riskLevel": r.risk_level,
            "status": r.report_status,
            "reportedAt": r.reported_at.isoformat() if r.reported_at else None,
            "provider": r.provider or "microsoft",
            "reported_from": r.reported_from or "outlook"
        })
    return output
