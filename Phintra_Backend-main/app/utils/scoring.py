import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.employee import Employee, EmployeeActivityEvent
from app.models.campaign import CampaignRecipient
from app.models.audit_log import SecurityScore

def log_activity_event(
    db: Session,
    employee_id: uuid.UUID,
    event_type: str,
    campaign_id: uuid.UUID = None,
    event_value: str = None
) -> EmployeeActivityEvent:
    """
    Log a behavior event, calculate point changes and risk changes,
    update employee risk score, and add audit log.
    """
    # 1. Fetch Employee
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        return None

    # Idempotency checks to prevent double scoring
    if campaign_id and event_type in ["email_sent", "email_opened", "link_clicked", "email_reported"]:
        exists = db.query(EmployeeActivityEvent).filter(
            EmployeeActivityEvent.campaign_id == campaign_id,
            EmployeeActivityEvent.employee_id == employee_id,
            EmployeeActivityEvent.event_type == event_type
        ).first()
        if exists:
            return exists

    if event_type == "training_completed" and event_value:
        exists = db.query(EmployeeActivityEvent).filter(
            EmployeeActivityEvent.employee_id == employee_id,
            EmployeeActivityEvent.event_type == event_type,
            EmployeeActivityEvent.event_value == event_value
        ).first()
        if exists:
            return exists

    if event_type == "quiz_passed" and event_value:
        exists = db.query(EmployeeActivityEvent).filter(
            EmployeeActivityEvent.employee_id == employee_id,
            EmployeeActivityEvent.event_type == event_type,
            EmployeeActivityEvent.event_value == event_value
        ).first()
        if exists:
            return exists

    # 2. Determine point and risk changes
    points_change = 0
    risk_change = 0

    if event_type == "email_sent":
        points_change = 0
        risk_change = 0
    elif event_type == "email_opened":
        points_change = -10
        risk_change = 10
    elif event_type == "link_clicked":
        points_change = -75  # Clicked without reporting initially
        risk_change = 25
    elif event_type == "email_reported":
        # Check if already clicked in this campaign
        has_clicked = False
        if campaign_id:
            cr = db.query(CampaignRecipient).filter(
                CampaignRecipient.campaign_id == campaign_id,
                CampaignRecipient.employee_id == employee_id
            ).first()
            if cr and (cr.clicked_at is not None or cr.status == "Clicked"):
                has_clicked = True

        if has_clicked:
            points_change = 125  # net +50 (-75 click + 125 = 50)
        else:
            points_change = 150  # reported before clicking
        risk_change = -20
    elif event_type == "training_completed":
        points_change = 50
        risk_change = -15
    elif event_type == "quiz_passed":
        points_change = 125  # Completed quiz (+50) + Passed quiz (+75)
        risk_change = -10
    elif event_type == "quiz_failed":
        points_change = -20
        risk_change = 0

    # 3. Create activity event log
    event = EmployeeActivityEvent(
        id=uuid.uuid4(),
        admin_id=emp.admin_id,
        company_id=emp.company_id,
        department_id=emp.department_id,
        employee_id=employee_id,
        campaign_id=campaign_id,
        event_type=event_type,
        event_value=event_value,
        points_change=points_change,
        risk_change=risk_change,
        created_at=datetime.utcnow()
    )
    db.add(event)

    # 4. Update employee risk score (clamped between 0.0 and 100.0)
    new_risk = max(0.0, min(100.0, emp.risk_score + risk_change))
    emp.risk_score = new_risk

    # 0-30 = Low risk, 31-70 = Medium risk, 71-100 = High risk
    if new_risk <= 30.0:
        emp.status = "Low Risk"
    elif new_risk <= 70.0:
        emp.status = "Medium Risk"
    else:
        emp.status = "High Risk"

    # Add security score audit log
    score_entry = SecurityScore(
        employee_id=emp.id,
        score=(100.0 - new_risk),
        recorded_at=datetime.utcnow()
    )
    db.add(score_entry)
    db.commit()

    recalculate_employee_score(employee_id, db)
    return event


def recalculate_employee_score(employee_id: uuid.UUID, db: Session) -> Employee:
    """
    Recalculate an employee's XP, level, security score, status, and activity counts
    based strictly on actual database records (real user actions only).
    """
    from app.models.employee import Employee
    from app.models.reported_email import ReportedEmail
    from app.models.campaign import CampaignRecipient
    from app.models.training import TrainingCompletion, TrainingAssignment
    from app.models.quiz import QuizAttempt, QuizQuestion
    import sqlalchemy as sa

    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        return None

    # 1. Counts real reports submitted (suspicious vs campaign)
    suspicious_reports = db.query(ReportedEmail).filter(
        ReportedEmail.employee_id == employee_id,
        ReportedEmail.campaign_id.is_(None)
    ).count()

    phishing_reports = db.query(ReportedEmail).filter(
        ReportedEmail.employee_id == employee_id,
        ReportedEmail.campaign_id.isnot(None)
    ).count()

    # 2. Counts simulation links clicked
    clicked_count = db.query(CampaignRecipient).filter(
        CampaignRecipient.employee_id == employee_id,
        sa.or_(CampaignRecipient.clicked_at.isnot(None), CampaignRecipient.status == "Clicked")
    ).count()

    # 3. Counts completed trainings
    completed_trainings = db.query(TrainingCompletion).filter(
        TrainingCompletion.employee_id == employee_id,
        TrainingCompletion.status == "completed"
    ).count()

    # 4. Counts completed quizzes (passed unique quizzes)
    passed_quiz_ids = db.query(QuizAttempt.quiz_id).filter(
        QuizAttempt.employee_id == employee_id,
        QuizAttempt.passed == True
    ).distinct().all()

    completed_quizzes = len(passed_quiz_ids)

    # 5. Counts correct quiz answers across unique passed quizzes (best score attempt)
    total_correct_answers = 0
    for row in passed_quiz_ids:
        quiz_id = row[0]
        # Find best attempt for this quiz
        best_attempt = db.query(QuizAttempt).filter(
            QuizAttempt.employee_id == employee_id,
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.passed == True
        ).order_by(QuizAttempt.score.desc()).first()

        if best_attempt:
            total_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).count()
            correct_answers = round((best_attempt.score / 100.0) * total_questions) if total_questions > 0 else 0
            total_correct_answers += correct_answers

    # 6. Recalculate XP from these real actions
    # Rules:
    # - Suspicious email reported: +50 XP
    # - Phishing simulation reported correctly: +100 XP
    # - Clicked phishing simulation link: -50 XP
    # - Training module completed: +100 XP
    # - Quiz completed: +50 XP
    # - Quiz correct answer: +10 XP
    total_xp = (
        (suspicious_reports * 50) +
        (phishing_reports * 100) +
        (clicked_count * -50) +
        (completed_trainings * 100) +
        (completed_quizzes * 50) +
        (total_correct_answers * 10)
    )
    total_xp = max(0, total_xp)

    # 7. Recalculate level from XP
    def calculate_level_from_xp(xp_val: int) -> int:
        if xp_val < 100:
            return 1
        elif xp_val < 250:
            return 2
        elif xp_val < 500:
            return 3
        elif xp_val < 800:
            return 4
        elif xp_val < 1200:
            return 5
        else:
            return 5 + ((xp_val - 1200) // 500) + 1

    level = calculate_level_from_xp(total_xp)

    # 8. Recalculate security_score and status
    has_activity = (suspicious_reports > 0 or phishing_reports > 0 or clicked_count > 0 or completed_trainings > 0 or completed_quizzes > 0)
    if not has_activity:
        security_score = 0.0
        emp.risk_score = 100.0
        status_str = "New"
    else:
        # Base risk of 100.0 for new employees, reduced by security actions and increased by clicks
        risk_val = 100.0 - (suspicious_reports * 10.0) - (phishing_reports * 15.0) + (clicked_count * 25.0) - (completed_trainings * 15.0) - (completed_quizzes * 10.0)
        emp.risk_score = max(0.0, min(100.0, round(risk_val, 1)))
        security_score = round(100.0 - emp.risk_score, 1)
        
        if emp.risk_score <= 30.0:
            status_str = "Low Risk"
        elif emp.risk_score <= 70.0:
            status_str = "Medium Risk"
        else:
            status_str = "High Risk"

    # Write changes to DB
    emp.xp = total_xp
    emp.level = level
    emp.security_score = security_score
    emp.status = status_str
    emp.report_count = suspicious_reports + phishing_reports
    emp.clicked_count = clicked_count
    emp.training_completed_count = completed_trainings
    emp.quiz_completed_count = completed_quizzes

    db.commit()
    db.refresh(emp)
    return emp
