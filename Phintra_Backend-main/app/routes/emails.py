from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.email_log import EmailLog, ThreatFeed
from app.models.reported_email import ReportedEmail
from app.models.campaign import EmailTemplate
from app.models.employee import Employee
from app.models.user import User
from app.schemas.email_schema import ThreatFeedCreate, ThreatFeedResponse, EmailLogResponse, EmailSendRequest, EmailSendBulkRequest, EmailTestRequest, EmailCampaignSendRequest
from app.schemas.certificate_schema import ReportedEmailCreate, ReportedEmailUpdate, ReportedEmailResponse, OutlookReportEmailCreate, ReportedEmailStatusUpdate, ReportedEmailReview, OutlookAdminMessageCreate
from app.services.email_service import send_email
from app.dependencies import require_manager, require_employee
from app.config import settings
from uuid import UUID
from typing import List, Optional

router = APIRouter(tags=["Emails & Feeds"])

# =====================================================================
# EMAIL SEND & LOGS ENDPOINTS
# =====================================================================

@router.post("/emails/send")
def send_custom_email(req: EmailSendRequest, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Dispatch custom awareness SMTP email (Managers & Admins)."""
    try:
        success = send_email(db, req.to_email, req.subject, req.body, raise_on_error=True)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to dispatch email via SMTP service")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "recipient": req.to_email,
        "status": "sent"
    }

@router.post("/emails/send-bulk")
def send_bulk_emails(req: EmailSendBulkRequest, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Dispatch bulk custom awareness SMTP emails to a list of recipients (Managers & Admins)."""
    sent_count = 0
    failed_count = 0
    results = []
    
    for email_addr in req.emails:
        try:
            success = send_email(db, email_addr, req.subject, req.body, raise_on_error=True)
            if success:
                sent_count += 1
                results.append({"email": email_addr, "status": "sent"})
            else:
                failed_count += 1
                results.append({"email": email_addr, "status": "failed", "error": "Unknown error"})
        except Exception as e:
            failed_count += 1
            results.append({"email": email_addr, "status": "failed", "error": str(e)})
            
    return {
        "total": len(req.emails),
        "sent": sent_count,
        "failed": failed_count,
        "results": results
    }

@router.post("/emails/send-campaign")
def send_campaign_emails(req: EmailCampaignSendRequest, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Dispatch custom awareness campaign SMTP emails to selected employees (Managers & Admins)."""
    if not req.emails:
        raise HTTPException(status_code=400, detail="The emails list must not be empty.")
        
    template = db.query(EmailTemplate).filter(EmailTemplate.id == req.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
        
    if req.subject and req.subject.strip() != template.subject.strip():
        raise HTTPException(status_code=400, detail="Provided subject does not match the selected template subject")
    if req.body and req.body.strip() != template.body_html.strip():
        raise HTTPException(status_code=400, detail="Provided body does not match the selected template body")
        
    sent_count = 0
    failed_count = 0
    results = []
    
    from app.models.campaign import CampaignRecipient
    import uuid

    for email_addr in req.emails:
        try:
            # 1. Lookup employee under this admin
            emp = db.query(Employee).filter(Employee.email == email_addr, Employee.admin_id == current_user.id).first()
            if not emp:
                failed_count += 1
                results.append({"email": email_addr, "status": "failed", "error": f"Employee {email_addr} not found for this admin"})
                continue
                
            # 2. Get or create CampaignRecipient
            recipient = db.query(CampaignRecipient).filter(
                CampaignRecipient.campaign_id == req.campaign_id,
                CampaignRecipient.employee_id == emp.id
            ).first()
            if not recipient:
                recipient = CampaignRecipient(campaign_id=req.campaign_id, employee_id=emp.id)
                db.add(recipient)
                db.commit()
                db.refresh(recipient)
                
            # 3. Ensure track_id is set
            if not recipient.track_id:
                recipient.track_id = uuid.uuid4()
                db.commit()
                db.refresh(recipient)
                
            # 4. Generate unique tracking link
            tracking_link = f"{settings.FRONTEND_URL}/report/{recipient.track_id}"
            
            # 5. Personalize body
            employee_name = f"{emp.first_name} {emp.last_name}" if (emp.first_name or emp.last_name) else (emp.name or "Valued Employee")
            company_name = "Phintra Enterprise"
            if emp.company and emp.company.company_name:
                company_name = emp.company.company_name
                
            body_content = template.body_html or template.body_text or ""
            personalized_body = body_content.replace("{{EmployeeName}}", employee_name)\
                                            .replace("{{Company}}", company_name)\
                                            .replace("{{TrackingLink}}", tracking_link)\
                                            .replace("{{employee_name}}", employee_name)\
                                            .replace("{{company_name}}", company_name)\
                                            .replace("{{login_link}}", tracking_link)
            
            success = send_email(
                db, 
                email_addr, 
                template.subject, 
                personalized_body, 
                campaign_id=req.campaign_id, 
                template_id=req.template_id, 
                employee_id=emp.id,
                raise_on_error=True
            )
            if success:
                sent_count += 1
                results.append({"email": email_addr, "status": "sent"})
            else:
                failed_count += 1
                results.append({"email": email_addr, "status": "failed", "error": "Unknown SMTP error"})
        except Exception as e:
            failed_count += 1
            results.append({"email": email_addr, "status": "failed", "error": str(e)})
            
    return {
        "total": len(req.emails),
        "sent": sent_count,
        "failed": failed_count,
        "results": results,
        "selected_recipients": req.emails,
        "sent_results": results
    }

@router.post("/emails/test")
def send_test_email(req: EmailTestRequest, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Send a mock security test email to verify SMTP server connectivity (Managers & Admins)."""
    test_recipient = req.to_email
    subject = "Phintra SMTP Connectivity Test"
    body = "This is a secure connection test email dispatched by the Phintra Security Platform to verify SMTP relay functionality."
    
    success = send_email(db, test_recipient, subject, body)
    if not success:
        raise HTTPException(
            status_code=500,
            detail="SMTP test email dispatch failed. Please verify your connection settings in .env."
        )
    return {
        "recipient": test_recipient,
        "status": "sent"
    }

@router.get("/emails/sender-info")
def get_sender_info(current_user: User = Depends(require_manager)):
    """Retrieve sender configuration details (Managers & Admins)."""
    return {
        "smtp_from_email": settings.SMTP_FROM_EMAIL
    }

@router.get("/emails/logs", response_model=List[EmailLogResponse])
def get_email_logs(db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Retrieve history of dispatched SMTP communications (Managers & Admins)."""
    from app.dependencies import get_user_admin_id
    from app.models.company import Company

    admin_id = get_user_admin_id(db, current_user)
    company = db.query(Company).filter(Company.admin_id == admin_id).first()

    return db.query(EmailLog).filter(EmailLog.admin_id == admin_id).order_by(EmailLog.sent_at.desc()).all()


# =====================================================================
# THREAT FEED ENDPOINTS
# =====================================================================

@router.get("/threat-feed", response_model=List[ThreatFeedResponse])
def list_threat_feed(db: Session = Depends(get_db), current_user: User = Depends(require_employee)):
    """List threat intelligence indicators (Employees, Managers, Admins)."""
    return db.query(ThreatFeed).order_by(ThreatFeed.published_at.desc()).all()

@router.post("/threat-feed", response_model=ThreatFeedResponse, status_code=status.HTTP_201_CREATED)
def create_threat_feed_item(item_in: ThreatFeedCreate, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Publish a new threat intelligence feed alert (Managers & Admins)."""
    db_item = ThreatFeed(**item_in.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# =====================================================================
# REPORTED EMAIL ENDPOINTS
# =====================================================================

@router.get("/emails/my-simulation-inbox")
def get_my_simulation_inbox(db: Session = Depends(get_db), current_user: User = Depends(require_employee)):
    """Fetch all campaign simulation emails sent to the currently logged in employee."""
    from app.models.employee import Employee
    from app.models.campaign import CampaignRecipient, Campaign, EmailTemplate
    from app.models.email_log import EmailLog
    import json
    
    # 1. Get employee record
    emp = db.query(Employee).filter(Employee.id == current_user.id).first()
    if not emp:
        emp = db.query(Employee).filter(Employee.email == current_user.email).first()
    if not emp:
        return []
        
    # 2. Query CampaignRecipients
    recipients = db.query(CampaignRecipient).filter(CampaignRecipient.employee_id == emp.id).all()
    
    inbox_items = []
    for r in recipients:
        campaign = db.query(Campaign).filter(Campaign.id == r.campaign_id).first()
        if not campaign:
            continue
            
        # Try to find corresponding EmailLog
        log = db.query(EmailLog).filter(
            EmailLog.campaign_id == r.campaign_id,
            EmailLog.employee_id == emp.id
        ).first()
        
        subject = log.subject if log else f"Simulation Alert: {campaign.name}"
        
        # Try to reconstruct sender and body from EmailTemplate
        sender_name = "IT Security Dept"
        sender_email = "security@company-alert.com"
        email_body = "This is a simulated phishing training email."
        
        # Find template ID from EmailLog or look up any template
        template = None
        if log and log.template_id:
            template = db.query(EmailTemplate).filter(EmailTemplate.id == log.template_id).first()
        if not template:
            # Fallback: get the first template
            template = db.query(EmailTemplate).first()
            
        if template:
            try:
                # Our templates store JSON inside body_html
                data = json.loads(template.body_html)
                sender_name = data.get("sender_name", sender_name)
                sender_email = data.get("sender_email", sender_email)
                email_body = data.get("body", template.body_html)
            except Exception:
                email_body = template.body_html
                
        # Reconstruct tracking link
        tracking_link = f"{settings.FRONTEND_URL}/report/{r.track_id}"
        
        inbox_items.append({
            "track_id": str(r.track_id),
            "campaign_id": str(r.campaign_id),
            "campaign_name": campaign.name,
            "subject": subject,
            "sender_name": sender_name,
            "sender_email": sender_email,
            "body": email_body,
            "status": r.status,
            "sent_at": (log.sent_at if log else r.created_at).isoformat(),
            "tracking_link": tracking_link
        })
        
    return inbox_items


@router.get("/reported-emails", response_model=List[ReportedEmailResponse])
def list_reported_emails(
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    employee_id: Optional[UUID] = None,
    campaign_id: Optional[UUID] = None,
    sort_by: Optional[str] = "reported_at",
    sort_order: Optional[str] = "desc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Retrieve all reported emails with filtering and sorting capabilities."""
    from app.models.company import Company
    
    admin_id = current_user.id
    if current_user.role not in ["Admin", "admin"] and hasattr(current_user, "admin_id") and current_user.admin_id:
        admin_id = current_user.admin_id
        
    query = db.query(ReportedEmail).filter(ReportedEmail.admin_id == admin_id)
    
    # Apply filters
    if status and status != "All Statuses" and status != "All":
        query = query.filter(ReportedEmail.report_status == status)
    if risk_level and risk_level != "All Risks" and risk_level != "All":
        query = query.filter(ReportedEmail.risk_level == risk_level)
    if employee_id:
        query = query.filter(ReportedEmail.employee_id == employee_id)
    if campaign_id:
        query = query.filter(ReportedEmail.campaign_id == campaign_id)
        
    # Apply sorting
    sort_column = getattr(ReportedEmail, sort_by, ReportedEmail.reported_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
        
    return query.offset(skip).limit(limit).all()

@router.get("/reported-emails/{id}", response_model=ReportedEmailResponse)
def get_reported_email_detail(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Retrieve details of a single reported email including the AI analysis results."""
    from app.models.company import Company
    
    admin_id = current_user.id
    if current_user.role not in ["Admin", "admin"] and hasattr(current_user, "admin_id") and current_user.admin_id:
        admin_id = current_user.admin_id
        
    report = db.query(ReportedEmail).filter(ReportedEmail.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Reported email not found")
    if report.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this report")
    return report

@router.post("/reported-emails", response_model=ReportedEmailResponse, status_code=status.HTTP_201_CREATED)
def submit_reported_email(req: ReportedEmailCreate, db: Session = Depends(get_db), current_user: User = Depends(require_employee)):
    """File a suspicious email report (Employees, Managers, Admins) and run AI analysis."""
    from app.services.ai_service import analyze_email_risk
    from app.models.employee import Employee
    from app.models.campaign import Campaign
    from app.models.notification import Notification
    from datetime import datetime, timedelta

    # 1. Fetch employee details
    if current_user.role in ["Employee", "employee"]:
        employee_id = current_user.id
    else:
        employee_id = req.employee_id
        
    if not employee_id:
        raise HTTPException(status_code=400, detail="Employee ID is required")
        
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    if current_user.role not in ["Employee", "employee"]:
        admin_id = get_user_admin_id(db, current_user)
        if emp.admin_id != admin_id:
            raise HTTPException(status_code=403, detail="Forbidden: Employee does not belong to your organization")

    employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown Employee"
    employee_email = emp.email if emp else "unknown@company.com"

    # 2. Fetch campaign details
    campaign_name = None
    if req.campaign_id:
        camp = db.query(Campaign).filter(Campaign.id == req.campaign_id).first()
        if camp:
            campaign_name = camp.name

    # 3. Run AI threat analysis
    analysis = analyze_email_risk(req.email_subject, req.email_sender, req.email_body or "")

    # Resolve target admin
    target_admin_id = emp.admin_id if emp else None

    # 4. Create database record
    db_report = ReportedEmail(
        employee_id=employee_id,
        employee_name=employee_name,
        employee_email=employee_email,
        campaign_id=req.campaign_id,
        campaign_name=campaign_name,
        email_subject=req.email_subject,
        email_sender=req.email_sender,
        email_body=req.email_body,
        report_reason=req.report_reason,
        report_status="Pending",
        reported_at=datetime.now(),
        reviewed_at=None,
        reviewed_by=None,
        admin_id=target_admin_id,
        department_id=emp.department_id if emp else None,
        
        # Backward compatibility fields
        # reported_by is a FK to users table — only set for Admin/Manager users, not employees
        # Only set reported_by for Admin/Manager (they exist in the users table)
        # Employees are stored in the employees table, so keep this field NULL.
        reported_by=current_user.id if current_user.role in ["Admin", "admin", "Manager", "manager"] else None,
        subject=req.email_subject,
        sender=req.email_sender,
        email_date=datetime.now(),
        risk_score=analysis["risk_score"],
        risk_level=analysis["risk_level"],
        status="Pending",
        analysis_results=analysis
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    from app.utils.scoring import recalculate_employee_score
    if employee_id:
        recalculate_employee_score(employee_id, db)

    # 5. Admin alerts and notifications — scoped to employee's own company admin only
    from app.models.company import Company as CompanyModel
    from app.dependencies import get_user_admin_id
    # Resolve the admin that owns this employee
    target_admin_id = emp.admin_id if emp else None
    if not target_admin_id and emp and emp.company_id:
        comp_row = db.query(CompanyModel).filter(CompanyModel.id == emp.company_id).first()
        if comp_row:
            target_admin_id = comp_row.admin_id
    if target_admin_id:
        admins = db.query(User).filter(User.id == target_admin_id).all()
    else:
        admins = db.query(User).filter(User.role == "Admin").all()

    for admin in admins:
        admin_notif = Notification(
            user_id=admin.id,
            title="New Phishing Email Reported",
            message=f"A new phishing report has been submitted by {employee_name} regarding subject '{req.email_subject}'."
        )
        db.add(admin_notif)

    # Critical risk alerts
    if analysis["risk_level"] == "Critical":
        for admin in admins:
            admin_notif = Notification(
                user_id=admin.id,
                title="Critical Phishing Threat Reported",
                message=f"Critical threat reported by {req.email_sender}: '{req.email_subject}' (Score: {analysis['risk_score']})"
            )
            db.add(admin_notif)

    # Coordinated checks (same subject and sender) — scoped to same admin's reports
    dup_filter = db.query(ReportedEmail).join(
        Employee, ReportedEmail.employee_id == Employee.id, isouter=True
    ).filter(
        ReportedEmail.email_sender == req.email_sender,
        ReportedEmail.email_subject == req.email_subject,
        ReportedEmail.id != db_report.id
    )
    if target_admin_id:
        dup_filter = dup_filter.filter(Employee.admin_id == target_admin_id)
    dup_reports_count = dup_filter.count()
    if dup_reports_count > 0:
        for admin in admins:
            admin_notif = Notification(
                user_id=admin.id,
                title="Coordinated Phishing Target",
                message=f"Multiple employees reported the same email from {req.email_sender}: '{req.email_subject}'."
            )
            db.add(admin_notif)

    # Campaign checks — scoped to same admin's reports
    one_day_ago = datetime.now() - timedelta(days=1)
    campaign_filter = db.query(ReportedEmail).join(
        Employee, ReportedEmail.employee_id == Employee.id, isouter=True
    ).filter(
        ReportedEmail.email_sender == req.email_sender,
        ReportedEmail.reported_at >= one_day_ago
    )
    if target_admin_id:
        campaign_filter = campaign_filter.filter(Employee.admin_id == target_admin_id)
    campaign_reports_count = campaign_filter.count()
    if campaign_reports_count >= 3:
        for admin in admins:
            admin_notif = Notification(
                user_id=admin.id,
                title="Active Phishing Campaign Detected",
                message=f"Active campaign pattern: {campaign_reports_count} reports received for sender '{req.email_sender}' within 24 hours."
            )
            db.add(admin_notif)

    # 6. Check campaign matches to update status and award XP
    if req.employee_id:
        from app.models.campaign import CampaignRecipient
        from app.models.email_log import EmailLog
        from app.models.certificate import Reward
        
        # Check if there is an EmailLog matching this employee and subject
        match_log = None
        if req.campaign_id:
            match_log = db.query(EmailLog).filter(
                EmailLog.campaign_id == req.campaign_id,
                EmailLog.employee_id == req.employee_id
            ).first()
        else:
            match_log = db.query(EmailLog).filter(
                EmailLog.employee_id == req.employee_id,
                EmailLog.subject == req.email_subject
            ).first()

        if match_log:
            r = db.query(CampaignRecipient).filter(
                CampaignRecipient.campaign_id == match_log.campaign_id,
                CampaignRecipient.employee_id == req.employee_id
            ).first()
            if r:
                r.status = "Reported"
            match_log.status = "Reported"
            
            # Award +150 XP
            reward_desc = f"Successfully Spotted Simulated Phishing: {req.email_subject}"
            existing_reward = db.query(Reward).filter(
                Reward.employee_id == req.employee_id,
                Reward.description == reward_desc
            ).first()
            if not existing_reward:
                reward = Reward(
                    employee_id=req.employee_id,
                    xp_amount=150,
                    description=reward_desc
                )
                db.add(reward)
                
                # Reduce risk rating on employee
                if emp:
                    emp.risk_score = max(0.0, emp.risk_score - 15.0)
                    if emp.risk_score < 20.0:
                        emp.status = "Low Risk"
                    elif emp.risk_score < 50.0:
                        emp.status = "Medium Risk"
                    elif emp.risk_score < 80.0:
                        emp.status = "High Risk"
                    else:
                        emp.status = "Critical"
                    
                    from app.models.audit_log import SecurityScore
                    score_entry = SecurityScore(employee_id=emp.id, score=(100.0 - emp.risk_score))
                    db.add(score_entry)

    db.commit()
    return db_report


@router.put("/reported-emails/{id}/status", response_model=ReportedEmailResponse)
def update_reported_email_status(
    id: UUID, 
    req: ReportedEmailStatusUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_manager)
):
    """Update report verification status (Safe, Verified Phish, Pending) and award XP if verified malicious."""
    from app.models.certificate import Reward
    from app.models.company import Company
    
    admin_id = current_user.id
    if current_user.role not in ["Admin", "admin"] and hasattr(current_user, "admin_id") and current_user.admin_id:
        admin_id = current_user.admin_id
        
    report = db.query(ReportedEmail).filter(ReportedEmail.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Reported email not found")
    if report.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this report")
        
    old_status = report.report_status
    new_status = req.report_status
    
    report.report_status = new_status
    report.status = new_status # Keep in sync for backward compatibility
    
    # Award XP (+150 XP) if it transitions to Verified Phish and hasn't been rewarded already
    if new_status == "Verified Phish" and old_status != "Verified Phish" and report.employee_id:
        existing_reward = db.query(Reward).filter(
            Reward.employee_id == report.employee_id,
            Reward.description == f"Phishing Threat Reported: {report.subject}"
        ).first()
        if not existing_reward:
            reward = Reward(
                employee_id=report.employee_id,
                xp_amount=150,
                description=f"Phishing Threat Reported: {report.subject}"
            )
            db.add(reward)
            
    db.commit()
    db.refresh(report)
    from app.utils.scoring import recalculate_employee_score
    if report.employee_id:
        recalculate_employee_score(report.employee_id, db)
    return report

@router.put("/reported-emails/{id}", response_model=ReportedEmailResponse)
def resolve_reported_email(id: UUID, req: ReportedEmailUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Resolve/validate employee reported email status (Managers & Admins) - Keep for backward compatibility."""
    status_update = ReportedEmailStatusUpdate(report_status=req.status)
    return update_reported_email_status(id, status_update, db, current_user)

@router.put("/reported-emails/{id}/review", response_model=ReportedEmailResponse)
def review_reported_email(
    id: UUID,
    req: ReportedEmailReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Update report verification status and mark as reviewed by admin."""
    from datetime import datetime
    from app.models.company import Company
    
    admin_id = current_user.id
    if current_user.role not in ["Admin", "admin"] and hasattr(current_user, "admin_id") and current_user.admin_id:
        admin_id = current_user.admin_id
        
    report = db.query(ReportedEmail).filter(ReportedEmail.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Reported email not found")
    if report.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this report")
        
    old_status = report.report_status
    new_status = req.report_status
    
    # Supported status values: "Pending", "Safe", "Suspicious", "Closed"
    if new_status not in ["Pending", "Safe", "Suspicious", "Closed"]:
        raise HTTPException(status_code=400, detail="Invalid status value. Must be Pending, Safe, Suspicious, or Closed.")
        
    report.report_status = new_status
    report.status = new_status # Keep in sync for backward compatibility
    
    # Set reviewed metadata
    report.reviewed_at = datetime.now()
    report.reviewed_by = current_user.id
    
    # Keep compatibility: award XP (+150 XP) if it transitions to "Suspicious"
    if new_status == "Suspicious" and old_status != "Suspicious" and report.employee_id:
        from app.models.certificate import Reward
        existing_reward = db.query(Reward).filter(
            Reward.employee_id == report.employee_id,
            Reward.description == f"Phishing Threat Reported: {report.email_subject or report.subject}"
        ).first()
        if not existing_reward:
            reward = Reward(
                employee_id=report.employee_id,
                xp_amount=150,
                description=f"Phishing Threat Reported: {report.email_subject or report.subject}"
            )
            db.add(reward)
            
    db.commit()
    db.refresh(report)
    return report
