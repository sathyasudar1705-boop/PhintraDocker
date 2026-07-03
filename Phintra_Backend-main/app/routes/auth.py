from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse, Token
from app.services.auth_service import register_user, authenticate_user
from app.dependencies import get_current_user
from app.models.user import User
from pydantic import BaseModel, EmailStr
from typing import Optional

import sqlalchemy as sa
from app.models.employee import Employee
from app.models.company import Company
from app.models.department import Department
from app.models.certificate import Reward, Certificate
from app.models.training import TrainingModule, TrainingAssignment, TrainingCompletion
from app.models.quiz import Quiz, QuizAttempt
from app.models.notification import Notification
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/auth", tags=["Authentication"])

import logging
import traceback

logger = logging.getLogger("app.routes.auth")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register portal access credentials."""
    # Temporary debug log of incoming request payload
    logger.info(f"[DEBUG] Incoming registration payload: email={user_in.email}, full_name={user_in.full_name}, company={user_in.company_name}")
    try:
        return register_user(db, user_in)
    except HTTPException as he:
        logger.warning(f"[DEBUG] Registration HTTP error: status={he.status_code}, detail={he.detail}")
        raise he
    except Exception as e:
        logger.error(f"[DEBUG] Registration unexpected error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Log in to retrieve bearer JWT authorization token."""
    access_token = authenticate_user(db, form_data.username, form_data.password)
    user = db.query(User).filter(User.email == form_data.username).first()
    if user:
        audit = AuditLog(user_id=user.id, action="Login", details=f"User {user.email} logged in successfully.")
        db.add(audit)
        db.commit()
    else:
        from app.models.employee import Employee
        emp = db.query(Employee).filter(Employee.email == form_data.username).first()
        if emp:
            audit = AuditLog(action="Employee Login", details=f"Employee {emp.email} logged in successfully.")
            db.add(audit)
            db.commit()
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel, EmailStr

class EmployeeLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/employee-login")
def employee_login(login_data: EmployeeLoginRequest, db: Session = Depends(get_db)):
    """Log in to retrieve bearer JWT token and employee details (Employees only)."""
    from app.utils.security import verify_password, create_access_token
    from app.models.employee import Employee
    from app.models.department import Department
    
    # Try Employee table lookup
    emp = db.query(Employee).filter(Employee.email == login_data.email).first()
            
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )
        
    if not emp.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Employee account is inactive"
        )
        
    # Verify password against hashed_password (or fallback to password_hash)
    stored_hash = emp.hashed_password or emp.password_hash
    if not stored_hash or not verify_password(login_data.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )
        
    # Confirm role is "employee"
    role = getattr(emp, "role", "employee")
    if role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Employees only."
        )
        
    access_token = create_access_token(data={
        "sub": emp.email,
        "role": "Employee",
        "employee_id": str(emp.id)
    })
    
    # Get department name
    dept = db.query(Department).filter(Department.id == emp.department_id).first()
    dept_name = dept.name if dept else "Unknown"
    
    # Write audit log
    audit = AuditLog(action="Employee Login", details=f"Employee {emp.email} logged in successfully.")
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "employee": {
            "name": emp.name or f"{emp.first_name} {emp.last_name}".strip(),
            "email": emp.email,
            "department": dept_name,
            "role": role
        }
    }

@router.get("/verify-dashboard-token")
def verify_dashboard_token(token: str, db: Session = Depends(get_db)):
    """Verify short-lived dashboard token or a valid Phintra JWT access token, and return profile info."""
    from datetime import datetime, timezone
    from app.utils.security import create_access_token, decode_access_token
    from app.models.employee import Employee
    from app.models.department import Department
    from app.models.audit_log import AuditLog
    
    # Try decoding as standard access token first
    payload = decode_access_token(token)
    if payload:
        email = payload.get("sub")
        role = payload.get("role", "Employee")
        if role == "Employee":
            emp = db.query(Employee).filter(Employee.email == email).first()
            if emp:
                dept = db.query(Department).filter(Department.id == emp.department_id).first()
                dept_name = dept.name if dept else "Unknown"
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "employee": {
                        "name": emp.name or f"{emp.first_name} {emp.last_name}".strip(),
                        "email": emp.email,
                        "department": dept_name,
                        "role": "Employee",
                        "personal_score": 100.0 - emp.risk_score
                    }
                }
        else:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "user": {
                        "id": str(user.id),
                        "name": user.name or "Admin",
                        "email": user.email,
                        "role": user.role
                    }
                }

    # 1. Lookup employee by token
    emp = db.query(Employee).filter(Employee.dashboard_token == token).first()
    if not emp:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    # 2. Check expiration
    now = datetime.now(timezone.utc) if emp.dashboard_token_expires_at.tzinfo else datetime.now()
    if emp.dashboard_token_expires_at < now:
        raise HTTPException(status_code=401, detail="Token has expired")
        
    # 3. Clear token to prevent reuse (one-time use)
    emp.dashboard_token = None
    emp.dashboard_token_expires_at = None
    
    # 4. Generate access token
    access_token = create_access_token(data={
        "sub": emp.email,
        "role": "Employee",
        "employee_id": str(emp.id)
    })
    
    # 5. Get department name
    dept = db.query(Department).filter(Department.id == emp.department_id).first()
    dept_name = dept.name if dept else "Unknown"
    
    # Write audit log
    audit = AuditLog(action="Token Auto-Login", details=f"Employee {emp.email} logged in via dashboard token.")
    db.add(audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "employee": {
            "name": emp.name or f"{emp.first_name} {emp.last_name}".strip(),
            "email": emp.email,
            "department": dept_name,
            "role": "Employee",
            "personal_score": 100.0 - emp.risk_score
        }
    }

@router.get("/validate")
def validate_token(current_user: User = Depends(get_current_user)):
    """Validate active JWT token."""
    return {"valid": True, "email": current_user.email, "role": current_user.role}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch details of currently logged-in portal account."""
    return current_user

@router.get("/me/profile")
def get_me_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch rich integrated user profile including employee/department parameters."""
    emp = db.query(Employee).filter(sa.func.lower(Employee.email) == current_user.email.strip().lower()).first()
    
    # Default fallbacks
    xp = 0
    level = 1
    certificates = []
    dept_name = "Security Operations" if current_user.role == "Admin" else "Information Technology"
    personal_score = 100.0
    name = current_user.email.split("@")[0].replace(".", " ").title()
    employee_id = None
    admin_id = str(current_user.id)
    
    if emp:
        name = f"{emp.first_name} {emp.last_name}"
        personal_score = 100.0 - emp.risk_score
        employee_id = str(emp.id)
        admin_id = str(emp.admin_id) if emp.admin_id else str(current_user.id)
        
        dept = db.query(Department).filter(Department.id == emp.department_id).first()
        if dept:
            dept_name = dept.name
            
        xp_sum = db.query(sa.func.sum(Reward.xp_amount)).filter(Reward.employee_id == emp.id).scalar()
        if xp_sum:
            xp = int(xp_sum)
            level = int(xp / 1000) + 1
            
        certs = db.query(Certificate).filter(Certificate.employee_id == emp.id).all()
        for cert in certs:
            mod = db.query(TrainingModule).filter(TrainingModule.id == cert.module_id).first()
            if mod:
                certificates.append(mod.title)
                
    return {
        "email": current_user.email,
        "name": name,
        "role": current_user.role,
        "department": dept_name,
        "personal_score": int(personal_score),
        "xp": xp if xp > 0 else (2450 if current_user.role == "Admin" else 500),
        "level": level if level > 1 else (12 if current_user.role == "Admin" else 2),
        "certificates": certificates,
        "employee_id": employee_id,
        "admin_id": admin_id
    }

@router.put("/me/profile")
def update_me_profile(name: str, email: str, department_name: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update details of active logged-in employee profile."""
    # Find user
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    user.email = email
    
    # Find employee
    emp = db.query(Employee).filter(Employee.email == current_user.email).first()
    if emp:
        emp.email = email
        names = name.split(" ")
        emp.first_name = names[0]
        emp.last_name = " ".join(names[1:]) if len(names) > 1 else ""
        
        # Find department
        dept = db.query(Department).filter(Department.name == department_name).first()
        if dept:
            emp.department_id = dept.id
            
    db.commit()
    audit = AuditLog(user_id=user.id, action="Profile Update", details=f"User {user.email} updated profile information.")
    db.add(audit)
    db.commit()
    return {"message": "Profile successfully updated"}

@router.get("/employee/dashboard")
def get_employee_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve detailed dashboard data for the logged-in employee."""
    emp = db.query(Employee).filter(Employee.id == current_user.id).first()
    if not emp:
        emp = db.query(Employee).filter(Employee.email == current_user.email).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee profile not found")
        
    # Company info
    company = db.query(Company).filter(Company.id == emp.company_id).first()
    company_name = company.company_name if company else "Phintra Enterprise"
    company_address = company.company_address if company else "123 Cyber Way"

    # Assigned Trainings
    assignments = db.query(TrainingAssignment).filter(
        TrainingAssignment.admin_id == emp.admin_id
    ).filter(
        sa.or_(
            TrainingAssignment.employee_id == emp.id,
            TrainingAssignment.department_id == emp.department_id,
            TrainingAssignment.company_id == emp.company_id,
            (TrainingAssignment.employee_id.is_(None)) & (TrainingAssignment.department_id.is_(None)) & (TrainingAssignment.company_id.is_(None))
        )
    ).all()

    module_ids = {a.training_module_id for a in assignments}
    assigned_trainings = []
    
    if module_ids:
        modules = db.query(TrainingModule).filter(
            TrainingModule.id.in_(module_ids),
            TrainingModule.admin_id == emp.admin_id
        ).all()
        
        completions = db.query(TrainingCompletion).filter(
            TrainingCompletion.employee_id == emp.id,
            TrainingCompletion.training_module_id.in_(module_ids)
        ).all()
        completions_dict = {c.training_module_id: c.status.value for c in completions}
        completions_obj = {c.training_module_id: c for c in completions}

        for mod in modules:
            status_val = completions_dict.get(mod.id, "not_started")
            comp_obj = completions_obj.get(mod.id)
            
            assigned_trainings.append({
                "module_id": str(mod.id),
                "title": mod.title,
                "description": mod.description,
                "duration_minutes": mod.duration or 10,
                "xp_reward": 100,
                "progress": 100 if status_val == "completed" else (50 if status_val == "in_progress" else 0),
                "completed": status_val == "completed",
                "completed_at": comp_obj.completed_at.isoformat() if (comp_obj and comp_obj.completed_at) else None
            })

    # Calculate training completion percentage
    completed_training_count = sum(1 for t in assigned_trainings if t["completed"])
    total_assigned_count = len(assigned_trainings)
    training_completion_percentage = int((completed_training_count / total_assigned_count) * 100) if total_assigned_count > 0 else 100

    # Quiz attempts
    attempts = db.query(QuizAttempt).filter(QuizAttempt.employee_id == emp.id).all()
    quiz_results = []
    for att in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        mod_title = "Unknown Module"
        if quiz:
            mod = db.query(TrainingModule).filter(TrainingModule.id == quiz.module_id).first()
            if mod:
                mod_title = mod.title
        quiz_results.append({
            "id": str(att.id),
            "module_title": mod_title,
            "score": att.score,
            "passed": att.passed,
            "attempted_at": att.attempted_at.isoformat()
        })
        
    # Certificates
    certs = db.query(Certificate).filter(Certificate.employee_id == emp.id).all()
    certificates = []
    for c in certs:
        mod = db.query(TrainingModule).filter(TrainingModule.id == c.module_id).first()
        certificates.append({
            "id": str(c.id),
            "module_title": mod.title if mod else "Unknown Course",
            "verification_code": c.verification_code,
            "issued_at": c.issued_at.isoformat()
        })
        
    # Rewards
    rew_list = db.query(Reward).filter(Reward.employee_id == emp.id).all()
    rewards = [{
        "id": str(r.id),
        "xp_amount": r.xp_amount,
        "description": r.description,
        "earned_at": r.earned_at.isoformat()
    } for r in rew_list]
    rewards_balance = sum(r.xp_amount for r in rew_list)
    
    # Notifications
    notifs = db.query(Notification).filter(Notification.employee_id == emp.id).all()
    notifications = [{
        "id": str(n.id),
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifs]
    
    # Campaign participation details
    from app.models.campaign import CampaignRecipient
    campaign_recipients = db.query(CampaignRecipient).filter(CampaignRecipient.employee_id == emp.id).all()
    campaign_participation = []
    for cr in campaign_recipients:
        campaign_participation.append({
            "campaign_id": str(cr.campaign_id),
            "campaign_name": cr.campaign.name if cr.campaign else "Unknown Campaign",
            "status": cr.status,
            "updated_at": (cr.updated_at or cr.created_at).isoformat()
        })

    campaigns_received = len(campaign_recipients)
    campaigns_opened = sum(1 for cr in campaign_recipients if cr.status in ["Opened", "Clicked", "Reported"])
    campaigns_clicked = sum(1 for cr in campaign_recipients if cr.status == "Clicked")
    campaigns_reported = sum(1 for cr in campaign_recipients if cr.status == "Reported")

    # Reported emails
    from app.models.reported_email import ReportedEmail
    rep_emails = db.query(ReportedEmail).filter(ReportedEmail.employee_id == emp.id).all()
    reported_emails_list = []
    for re in rep_emails:
        reported_emails_list.append({
            "id": str(re.id),
            "subject": re.email_subject if re.email_subject else re.subject,
            "sender": re.email_sender if re.email_sender else re.sender,
            "status": re.report_status if re.report_status else re.status,
            "reported_at": re.reported_at.isoformat()
        })

    # Leaderboard ranking and percentile
    company_employees = db.query(Employee).filter(
        Employee.company_id == emp.company_id,
        Employee.is_active == True
    ).all()
    company_employees.sort(key=lambda x: (100.0 - x.risk_score), reverse=True)
    
    leaderboard_rank = 1
    for index, item in enumerate(company_employees):
        if item.id == emp.id:
            leaderboard_rank = index + 1
            break
            
    total_count = len(company_employees)
    leaderboard_percentile = round(((total_count - leaderboard_rank + 1) / total_count) * 100) if total_count > 0 else 100

    # Unread message count
    from app.models.message import Message
    unread_message_count = db.query(Message).filter(
        Message.employee_id == emp.id,
        Message.admin_id == emp.admin_id,
        Message.sender_role == "admin",
        Message.is_read == False
    ).count()

    # Activity Log Timeline
    activity_log = []
    
    for att in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        quiz_name = quiz.quizName if quiz else "Quiz"
        activity_log.append({
            "id": f"quiz-{att.id}",
            "type": "quiz",
            "title": f"Attempted {quiz_name}",
            "description": f"Scored {att.score}% ({'Passed' if att.passed else 'Failed'})",
            "timestamp": att.attempted_at.isoformat()
        })
        
    for comp in completions:
        mod = db.query(TrainingModule).filter(TrainingModule.id == comp.training_module_id).first()
        mod_title = mod.title if mod else "Training Module"
        activity_log.append({
            "id": f"comp-{comp.id}",
            "type": "training",
            "title": f"Completed Course: {mod_title}",
            "description": "Earned completion certificate and XP reward.",
            "timestamp": comp.completed_at.isoformat() if comp.completed_at else comp.created_at.isoformat()
        })
        
    for re in rep_emails:
        activity_log.append({
            "id": f"report-{re.id}",
            "type": "report",
            "title": "Reported Suspicious Email",
            "description": f"Subject: '{re.email_subject or re.subject}'",
            "timestamp": re.reported_at.isoformat()
        })
        
    activity_log.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "employee_id": str(emp.id),
        "name": f"{emp.first_name} {emp.last_name}",
        "email": emp.email,
        "department": db.query(Department.name).filter(Department.id == emp.department_id).scalar() or "Security",
        "role": emp.role,
        "company_name": company_name,
        "company_address": company_address,
        "security_score": round(100.0 - emp.risk_score, 1),
        "risk_score": emp.risk_score,
        "training_completion": training_completion_percentage,
        "campaigns_received": campaigns_received,
        "campaigns_opened": campaigns_opened,
        "campaigns_clicked": campaigns_clicked,
        "campaigns_reported": campaigns_reported,
        "leaderboard_rank": leaderboard_rank,
        "leaderboard_percentile": leaderboard_percentile,
        "rewards_balance": rewards_balance,
        "activity_log": activity_log[:20],
        "assigned_trainings": assigned_trainings,
        "quiz_results": quiz_results,
        "certificates": certificates,
        "rewards": rewards,
        "notifications": notifications,
        "campaign_participation": campaign_participation,
        "reported_emails": reported_emails_list,
        "unread_message_count": unread_message_count
    }

class AddonTokenRequest(BaseModel):
    email: EmailStr
    addon_key: str

@router.post("/auth/addon/generate-token")
@router.post("/addon/generate-token")
def generate_addon_token(payload: AddonTokenRequest, db: Session = Depends(get_db)):
    """Generate a secure, short-lived SSO token for the Gmail Add-on."""
    import os
    expected_key = os.getenv("PHINTRA_ADDON_KEY", "phintra-dev-key-123")
    if payload.addon_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Gmail Add-on key"
        )
    
    emp = db.query(Employee).filter(Employee.email == payload.email).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee email not found"
        )
    
    from app.utils.security import create_access_token
    from datetime import timedelta
    sso_token = create_access_token(
        data={"sub": payload.email, "scope": "addon_sso", "employee_id": str(emp.id)},
        expires_delta=timedelta(minutes=5)
    )
    return {"sso_token": sso_token}

class VerifyAddonTokenRequest(BaseModel):
    token: str

@router.post("/auth/addon/validate-token")
@router.post("/addon/validate-token")
def validate_addon_token(payload: VerifyAddonTokenRequest, db: Session = Depends(get_db)):
    """Validate Gmail Add-on token and issue a session JWT."""
    from app.utils.security import decode_access_token, create_access_token
    claims = decode_access_token(payload.token)
    if not claims or claims.get("scope") != "addon_sso":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired SSO token"
        )
    
    email = claims.get("sub")
    emp = db.query(Employee).filter(Employee.email == email).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found"
        )
        
    if not emp.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee account is inactive"
        )

    access_token = create_access_token(data={
        "sub": emp.email,
        "role": "Employee",
        "employee_id": str(emp.id)
    })
    
    # Get department name
    dept = db.query(Department).filter(Department.id == emp.department_id).first()
    dept_name = dept.name if dept else "Unknown"
    
    # Audit log
    db_audit = AuditLog(action="Add-on SSO Login", details=f"Employee {emp.email} logged in via Gmail Add-on SSO.")
    db.add(db_audit)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "employee": {
            "name": emp.name or f"{emp.first_name} {emp.last_name}".strip() or "Employee",
            "email": emp.email,
            "department": dept_name,
            "role": "Employee"
        }
    }

@router.get("/employee/quiz-results")
def get_employee_quiz_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve quiz results for the logged-in employee."""
    emp = db.query(Employee).filter(Employee.id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    attempts = db.query(QuizAttempt).filter(QuizAttempt.employee_id == emp.id).all()
    results = []
    for att in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == att.quiz_id).first()
        mod_title = "Unknown Module"
        if quiz:
            mod = db.query(TrainingModule).filter(TrainingModule.id == quiz.module_id).first()
            if mod:
                mod_title = mod.title
        results.append({
            "id": str(att.id),
            "module_title": mod_title,
            "score": att.score,
            "passed": att.passed,
            "attempted_at": att.attempted_at.isoformat()
        })
    return results

@router.get("/employee/rewards")
def get_employee_rewards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve reward XP entries for the logged-in employee."""
    emp = db.query(Employee).filter(Employee.id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    rew_list = db.query(Reward).filter(Reward.employee_id == emp.id).all()
    return [{
        "id": str(r.id),
        "xp_amount": r.xp_amount,
        "description": r.description,
        "earned_at": r.earned_at.isoformat()
    } for r in rew_list]

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Invalidate active session credentials."""
    audit = AuditLog(user_id=current_user.id, action="Logout", details=f"User {current_user.email} logged out successfully.")
    db.add(audit)
    db.commit()
    return {"message": f"Successfully logged out user {current_user.email}"}

def verify_microsoft_id_token(id_token: str, client_id: str, tenant_id: str) -> dict:
    import requests
    from jose import jwt, JWTError
    
    openid_url = f"https://login.microsoftonline.com/{tenant_id}/v2.0/.well-known/openid-configuration"
    config_res = requests.get(openid_url)
    if config_res.status_code != 200:
        raise ValueError("Failed to fetch Microsoft OpenID configuration")
        
    config = config_res.json()
    jwks_uri = config.get("jwks_uri")
    
    keys_res = requests.get(jwks_uri)
    if keys_res.status_code != 200:
        raise ValueError("Failed to fetch Microsoft JWKS keys")
        
    jwks = keys_res.json()
    
    try:
        unverified_header = jwt.get_unverified_header(id_token)
    except Exception as e:
        raise ValueError(f"Invalid token format: {str(e)}")
        
    kid = unverified_header.get("kid")
    if not kid:
        raise ValueError("Token header missing 'kid'")
        
    public_key = None
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            public_key = key
            break
            
    if not public_key:
        raise ValueError("Matching public key not found in Microsoft JWKS")
        
    issuer = f"https://login.microsoftonline.com/{tenant_id}/v2.0"
    
    try:
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=issuer
        )
        return payload
    except JWTError as jwt_err:
        raise ValueError(f"Token verification failed: {str(jwt_err)}")

class MicrosoftAuthRequest(BaseModel):
    id_token: str

@router.post("/microsoft")
def microsoft_auth(payload: MicrosoftAuthRequest, db: Session = Depends(get_db)):
    """Securely verify MSAL ID Token and log in or auto-register user."""
    from app.config import settings
    from app.utils.security import create_access_token, hash_password
    from app.models.employee import Employee
    from app.models.audit_log import AuditLog
    import uuid

    client_id = settings.MICROSOFT_CLIENT_ID
    tenant_id = settings.MICROSOFT_TENANT_ID

    if not client_id or not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Microsoft OAuth parameters are not configured on the backend."
        )

    try:
        payload_data = verify_microsoft_id_token(payload.id_token, client_id, tenant_id)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Microsoft token verification failed: {str(val_err)}"
        )

    email = payload_data.get("email") or payload_data.get("preferred_username") or payload_data.get("upn")
    name = payload_data.get("name") or "Microsoft User"
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Microsoft ID token does not contain an email address."
        )

    email = email.strip().lower()

    # 1. Query users table (Admin/Manager/Employee in users table)
    user = db.query(User).filter(sa.func.lower(User.email) == email).first()
    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your account is inactive. Please contact admin."
            )
        
        phintra_token = create_access_token(data={"sub": user.email, "role": user.role})
        
        audit = AuditLog(user_id=user.id, action="Microsoft Login", details=f"User {user.email} logged in via Microsoft Entra ID.")
        db.add(audit)
        db.commit()
        
        redirect_path = "/admin/dashboard" if user.role in ["Admin", "Security Administrator", "Security Manager", "Manager"] else "/employee/dashboard"
        
        return {
            "access_token": phintra_token,
            "token_type": "bearer",
            "role": user.role,
            "redirect_path": redirect_path,
            "user": {
                "id": str(user.id),
                "name": user.name or name,
                "email": user.email,
                "role": user.role
            }
        }

    # 2. Query employees table (Employee)
    emp = db.query(Employee).filter(sa.func.lower(Employee.email) == email).first()
    if emp:
        if not emp.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your account is inactive. Please contact admin."
            )
        
        phintra_token = create_access_token(data={
            "sub": emp.email,
            "role": "Employee",
            "employee_id": str(emp.id)
        })
        
        from app.models.department import Department
        dept = db.query(Department).filter(Department.id == emp.department_id).first()
        dept_name = dept.name if dept else "Unknown"

        audit = AuditLog(action="Employee Microsoft Login", details=f"Employee {emp.email} logged in via Microsoft Entra ID.")
        db.add(audit)
        db.commit()

        return {
            "access_token": phintra_token,
            "token_type": "bearer",
            "role": "Employee",
            "redirect_path": "/employee/dashboard",
            "employee": {
                "name": emp.name or f"{emp.first_name} {emp.last_name}".strip() or name,
                "email": emp.email,
                "department": dept_name,
                "role": "Employee",
                "employee_id": str(emp.id)
            }
        }

    # 3. Create a new user record automatically
    new_user = User(
        email=email,
        hashed_password=hash_password(str(uuid.uuid4())),
        role="Employee",
        is_active=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        phintra_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
        
        audit = AuditLog(user_id=new_user.id, action="Microsoft Autoregister", details=f"New user {new_user.email} registered and logged in via Microsoft Entra ID.")
        db.add(audit)
        db.commit()
        
        return {
            "access_token": phintra_token,
            "token_type": "bearer",
            "role": new_user.role,
            "redirect_path": "/employee/dashboard",
            "user": {
                "id": str(new_user.id),
                "name": name,
                "email": new_user.email,
                "role": new_user.role
            }
        }
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to auto-register new user: {str(err)}"
        )

@router.get("/microsoft-config")
def get_microsoft_config():
    from app.config import settings
    return {
        "client_id": settings.MICROSOFT_CLIENT_ID,
        "tenant_id": settings.MICROSOFT_TENANT_ID,
        "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
        "authorization_endpoint": f"https://login.microsoftonline.com/{settings.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize"
    }

class MicrosoftLoginPKCERequest(BaseModel):
    access_token: str
    id_token: str
    portal_type: str

@router.post("/microsoft-login")
def microsoft_login_pkce(payload: MicrosoftLoginPKCERequest, db: Session = Depends(get_db)):
    import requests
    from app.config import settings
    from app.utils.security import create_access_token
    from app.models.employee import Employee
    from app.models.department import Department
    from app.models.audit_log import AuditLog
    import uuid

    # 1. Fetch user from Microsoft Graph API using the access_token
    graph_url = "https://graph.microsoft.com/v1.0/me"
    headers = {"Authorization": f"Bearer {payload.access_token}"}
    try:
        profile_res = requests.get(graph_url, headers=headers)
        if profile_res.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate access token with Microsoft Graph API."
            )
        profile = profile_res.json()
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Microsoft Graph API connection failed: {str(err)}"
        )

    microsoft_email = profile.get("mail") or profile.get("userPrincipalName")
    display_name = profile.get("displayName") or "Microsoft User"

    if not microsoft_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Microsoft user profile does not contain an email address."
        )

    email = microsoft_email.strip().lower()
    print(f"[SSO LOGIN ATTEMPT] Attempted Microsoft login with email: {email}")

    # 2. Query users table (case-insensitive email matching)
    user = db.query(User).filter(sa.func.lower(User.email) == email).first()
    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is inactive. Please contact admin."
            )
        
        # Generate Phintra JWT with specified claims: sub, user_id, role, email
        phintra_token = create_access_token(data={
            "sub": user.email,
            "user_id": str(user.id),
            "role": user.role,
            "email": user.email
        })
        
        audit = AuditLog(user_id=user.id, action="Microsoft Login", details=f"User {user.email} logged in via Microsoft Entra ID PKCE.")
        db.add(audit)
        db.commit()
        
        redirect_path = "/admin/dashboard" if user.role in ["Admin", "Security Administrator", "Security Manager", "Manager"] else "/employee/dashboard"
        
        return {
            "access_token": phintra_token,
            "token_type": "bearer",
            "role": user.role,
            "redirect_path": redirect_path,
            "user": {
                "id": str(user.id),
                "name": display_name,
                "email": user.email,
                "role": user.role
            }
        }

    # 3. Query employees table (case-insensitive email matching)
    emp = db.query(Employee).filter(sa.func.lower(Employee.email) == email).first()
    if emp:
        if not emp.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is inactive. Please contact admin."
            )
        
        # Generate Phintra JWT with sub, user_id, role, email, employee_id
        phintra_token = create_access_token(data={
            "sub": emp.email,
            "user_id": str(emp.id),
            "role": "Employee",
            "email": emp.email,
            "employee_id": str(emp.id)
        })
        
        dept = db.query(Department).filter(Department.id == emp.department_id).first()
        dept_name = dept.name if dept else "Unknown"

        audit = AuditLog(action="Employee Microsoft Login", details=f"Employee {emp.email} logged in via Microsoft Entra ID PKCE.")
        db.add(audit)
        db.commit()

        return {
            "access_token": phintra_token,
            "token_type": "bearer",
            "role": "Employee",
            "redirect_path": "/employee/dashboard",
            "employee": {
                "name": emp.name or f"{emp.first_name} {emp.last_name}".strip() or display_name,
                "email": emp.email,
                "department": dept_name,
                "role": "Employee",
                "employee_id": str(emp.id)
            }
        }

    # 4. If email does not exist, check auto-registration settings
    if settings.ENABLE_MICROSOFT_AUTO_REGISTRATION:
        if settings.TEST_ADMIN_EMAIL and email == settings.TEST_ADMIN_EMAIL.strip().lower():
            # Auto-register as Admin
            new_user = User(
                email=email,
                hashed_password="MICROSOFT_SSO_ONLY",
                role="Admin",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            phintra_token = create_access_token(data={
                "sub": new_user.email,
                "user_id": str(new_user.id),
                "role": new_user.role,
                "email": new_user.email
            })

            audit = AuditLog(user_id=new_user.id, action="Microsoft Autoregister", details=f"New Admin {new_user.email} registered and logged in via Microsoft Entra ID PKCE.")
            db.add(audit)
            db.commit()

            return {
                "access_token": phintra_token,
                "token_type": "bearer",
                "role": new_user.role,
                "redirect_path": "/admin/dashboard",
                "user": {
                    "id": str(new_user.id),
                    "name": display_name,
                    "email": new_user.email,
                    "role": new_user.role
                }
            }

        elif settings.TEST_EMPLOYEE_EMAIL and email == settings.TEST_EMPLOYEE_EMAIL.strip().lower():
            # Auto-register as Employee
            from app.models.company import Company
            company = db.query(Company).first()
            if not company:
                company = Company(name="Test Company")
                db.add(company)
                db.commit()
                db.refresh(company)

            # Find or create a default department
            dept = db.query(Department).filter(Department.company_id == company.id).first()
            if not dept:
                dept = Department(name="IT Security", company_id=company.id)
                db.add(dept)
                db.commit()
                db.refresh(dept)

            # Create Employee record
            new_emp = Employee(
                email=email,
                name=display_name,
                hashed_password="MICROSOFT_SSO_ONLY",
                role="Employee",
                is_active=True,
                company_id=company.id,
                department_id=dept.id
            )
            db.add(new_emp)
            db.commit()
            db.refresh(new_emp)

            phintra_token = create_access_token(data={
                "sub": new_emp.email,
                "user_id": str(new_emp.id),
                "role": "Employee",
                "email": new_emp.email,
                "employee_id": str(new_emp.id)
            })

            audit = AuditLog(action="Employee Microsoft Autoregister", details=f"New Employee {new_emp.email} registered and logged in via Microsoft Entra ID PKCE.")
            db.add(audit)
            db.commit()

            return {
                "access_token": phintra_token,
                "token_type": "bearer",
                "role": "Employee",
                "redirect_path": "/employee/dashboard",
                "employee": {
                    "name": new_emp.name or display_name,
                    "email": new_emp.email,
                    "department": dept.name,
                    "role": "Employee",
                    "employee_id": str(new_emp.id)
                }
            }

    # Not registered
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Your account is not registered in Phintra."
    )


