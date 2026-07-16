from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.department import Department
from app.models.employee import Employee
from app.models.training import TrainingModule, TrainingAssignment
from app.models.campaign import Campaign, CampaignRecipient, EmailTemplate, AwarenessPage
from app.models.company import Company
from app.models.email_log import ThreatFeed
from app.models.audit_log import SecurityScore
from app.utils.security import hash_password
from datetime import datetime, timedelta

def seed_data():
    """Seeds the database with initial demonstration and administrative records."""
    db = SessionLocal()
    from app.config import settings
    import sqlalchemy as sa
    
    try:
        # 1. Base table schema checks
        Base.metadata.create_all(bind=engine)
        import app.main
        print("Ensured database tables exist.")

        # 2. Seed Single Company & Admin if app mode is single_company
        if settings.APP_MODE == "single_company":
            allowed_admin = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
            if not allowed_admin:
                allowed_admin = User(
                    email=settings.ALLOWED_ADMIN_EMAIL.strip().lower(),
                    hashed_password=hash_password("admin123"),
                    role="Admin",
                    is_active=True
                )
                db.add(allowed_admin)
                db.commit()
                db.refresh(allowed_admin)
                print(f"Created default admin user: {allowed_admin.email}")
            else:
                allowed_admin.hashed_password = hash_password("admin123")
                db.commit()
                print(f"Ensured admin user password is admin123: {allowed_admin.email}")
            
            # Delete any other users with role Admin
            other_admins = db.query(User).filter(User.role == "Admin", User.id != allowed_admin.id).all()
            for other_adm in other_admins:
                db.delete(other_adm)
            db.commit()

            # Resolve or Create the Company record
            from app.models.company import Company
            company = db.query(Company).filter(Company.company_name == settings.COMPANY_NAME.strip()).first()
            if not company:
                company = Company(
                    company_name=settings.COMPANY_NAME.strip(),
                    admin_id=allowed_admin.id
                )
                db.add(company)
                db.commit()
                db.refresh(company)
                print(f"Created default company: {company.company_name}")
            
            # Ensure exactly one company record exists - delete any other companies
            other_companies = db.query(Company).filter(Company.id != company.id).all()
            for other_comp in other_companies:
                db.delete(other_comp)
            db.commit()

            # Map all departments to the single company and allowed admin
            from app.models.department import Department
            depts = db.query(Department).all()
            for dept in depts:
                dept.company_id = company.id
                dept.admin_id = allowed_admin.id
            db.commit()

            # Map all existing employees to that company_id and admin_id
            from app.models.employee import Employee
            employees = db.query(Employee).all()
            for emp in employees:
                emp.company_id = company.id
                emp.admin_id = allowed_admin.id
            db.commit()
            print("Mapped all departments and employees to default company and admin.")
            
        else:
            # 2. Seed Users
            users = [
                {"email": "admin@phintra.com", "password": "admin123", "role": "Admin"},
                {"email": "manager@phintra.com", "password": "manager123", "role": "Manager"},
                {"email": "employee@phintra.com", "password": "employee123", "role": "Employee"}
            ]
            for u in users:
                existing = db.query(User).filter(User.email == u["email"]).first()
                if not existing:
                    db_user = User(
                        email=u["email"],
                        hashed_password=hash_password(u["password"]),
                        role=u["role"],
                        is_active=True
                    )
                    db.add(db_user)
                    print(f"Seeded user: {u['email']}")
            db.commit()

        # 3. Seed Departments
        depts = [
            {"name": "Security Operations", "description": "Responsible for corporate security vigilance, monitoring, and controls."},
            {"name": "Finance Department", "description": "Handles transaction processing, treasury, accounts, and audits."},
            {"name": "Human Resources", "description": "Manages talent acquisitions, corporate policies, and employee wellness."},
            {"name": "Information Technology", "description": "Oversees corporate network infrastructure, services, and hardware assets."},
            {"name": "Sales and Marketing", "description": "Responsible for customer acquisitions, campaigns, and outreach."}
        ]
        dept_map = {}
        for d in depts:
            existing = db.query(Department).filter(Department.name == d["name"]).first()
            if not existing:
                existing = Department(name=d["name"], description=d["description"])
                db.add(existing)
                db.commit()
                db.refresh(existing)
                print(f"Seeded department: {d['name']}")
            dept_map[d["name"]] = existing
        
        # 4. Seed Employees
        employees = [
            {"first_name": "Saravana", "last_name": "Employee", "email": "saravanas@systechusa.com", "dept": "Information Technology", "risk": 0.0, "status": "Low Risk"},
            {"first_name": "Hari", "last_name": "Employee", "email": "hariharana@systechusa.com", "dept": "Information Technology", "risk": 0.0, "status": "Low Risk"},
            {"first_name": "ramya", "last_name": "Employee", "email": "ramyak@systechusa.com", "dept": "Information Technology", "risk": 0.0, "status": "Low Risk"},
            {"first_name": "Sathyasudarv", "last_name": "Admin", "email": "sathyasudarv@systechusa.com", "dept": "Information Technology", "risk": 0.0, "status": "Low Risk"}
        ]
        admin_email_to_find = settings.ALLOWED_ADMIN_EMAIL.strip().lower() if settings.APP_MODE == "single_company" else "admin@phintra.com"
        admin_user = db.query(User).filter(sa.func.lower(User.email) == admin_email_to_find).first()
        admin_id = admin_user.id if admin_user else None

        for emp in employees:
            existing = db.query(Employee).filter(Employee.email == emp["email"]).first()
            if not existing:
                db_emp = Employee(
                    first_name=emp["first_name"],
                    last_name=emp["last_name"],
                    email=emp["email"],
                    department_id=dept_map[emp["dept"]].id,
                    risk_score=emp["risk"],
                    status=emp["status"],
                    admin_id=admin_id,
                    created_by=admin_id,
                    password_hash=hash_password("password123"),
                    is_active=True
                )
                db.add(db_emp)
                db.commit()
                db.refresh(db_emp)
                print(f"Seeded employee: {emp['email']}")
                
                # Store historical score trend
                score_entry = SecurityScore(employee_id=db_emp.id, score=(100.0 - db_emp.risk_score))
                db.add(score_entry)
                db.commit()

        # 5. Seed Training Modules
        from app.models.quiz import Quiz, QuizQuestion
        modules = [
            {"title": "Phishing 101: Identifying Email Threats", "description": "Master core concepts of recognizing phishing sender cues, suspicious hyperlinks, and payload vectors.", "duration": 10, "xp": 200},
            {"title": "Password Hygiene: Building Bulletproof Credentials", "description": "Learn correct methodologies for password formulation, entropy levels, and credential vault management.", "duration": 12, "xp": 250},
            {"title": "Multi-Factor Authentication: Your Ultimate Defense Layer", "description": "Configure authenticator push profiles and understand the vital significance of secondary identity challenges.", "duration": 8, "xp": 180}
        ]
        for m in modules:
            existing = db.query(TrainingModule).filter(TrainingModule.title == m["title"]).first()
            if not existing:
                db_mod = TrainingModule(
                    title=m["title"],
                    description=m["description"],
                    duration=m["duration"],
                    xp_reward=m["xp"],
                    admin_id=admin_id
                )
                db.add(db_mod)
                db.commit()
                db.refresh(db_mod)
                existing = db_mod
                print(f"Seeded training module: {m['title']}")

            
            # Seed Quiz for this module
            quiz_existing = db.query(Quiz).filter(Quiz.module_id == existing.id).first()
            if not quiz_existing:
                quiz_existing = Quiz(module_id=existing.id, passing_score=100)
                db.add(quiz_existing)
                db.commit()
                db.refresh(quiz_existing)
                print(f"Seeded quiz for module: {m['title']}")
                
            # Seed questions
            if m["title"].startswith("Phishing 101"):
                questions = [
                    {
                        "text": "Which of the following email addresses is the most suspicious for an alert claiming to be from Microsoft Security Support?",
                        "options": [
                            "security@microsoft.com",
                            "support@microsoft-alert.security-update.com",
                            "alerts@mail.microsoft.com",
                            "no-reply@microsoft.com"
                        ],
                        "correct": 1
                    },
                    {
                        "text": "What is the very first thing you should do if you receive an email from your Bank claiming your account is locked and asking you to click a link to unlock it?",
                        "options": [
                            "Click the link immediately to prevent lock-out",
                            "Reply to the email asking for confirmation",
                            "Ignore the link, open a new browser tab, and navigate to the bank's official URL directly",
                            "Forward the email to all your colleagues"
                        ],
                        "correct": 2
                    }
                ]
            elif m["title"].startswith("Password Hygiene"):
                questions = [
                    {
                        "text": "Which password possesses the highest level of security against modern brute-force attacks?",
                        "options": [
                            "Short12!",
                            "securepass123",
                            "crimson-guitar-skate-ocean-99",
                            "P@$$w0rd2026"
                        ],
                        "correct": 2
                    }
                ]
            else: # Multi-Factor Authentication
                questions = [
                    {
                        "text": "You receive a push notification on your phone asking you to verify a Microsoft login, but you are not actively logging in. What should you do?",
                        "options": [
                            "Tap approve to clear the notification from your screen",
                            "Tap deny, immediately change your corporate password, and report the event to Security",
                            "Do nothing and sleep",
                            "Approve it, then log in to check who was trying to access your account"
                        ],
                        "correct": 1
                    }
                ]
                
            for q in questions:
                q_exist = db.query(QuizQuestion).filter(
                    QuizQuestion.quiz_id == quiz_existing.id,
                    QuizQuestion.question_text == q["text"]
                ).first()
                if not q_exist:
                    db_q = QuizQuestion(
                        quiz_id=quiz_existing.id,
                        question_text=q["text"],
                        options=q["options"],
                        correct_option_index=q["correct"]
                    )
                    db.add(db_q)
                    print(f"Seeded question: {q['text'][:30]}...")
        db.commit()

        # 6. Seed Campaigns
        existing_campaign = db.query(Campaign).first()
        if not existing_campaign:
            campaign = Campaign(
                name="Q3 Finance Spear Phish Drill",
                type="Spear Phishing",
                status="Active",
                launch_date=datetime.utcnow() - timedelta(days=2)
            )
            db.add(campaign)
            db.commit()
            db.refresh(campaign)
            print("Seeded sample simulation campaign.")

            # Assign IT target employee
            it_dept = dept_map["Information Technology"]
            it_emps = db.query(Employee).filter(Employee.department_id == it_dept.id).all()
            for emp in it_emps:
                recipient = CampaignRecipient(
                    campaign_id=campaign.id,
                    employee_id=emp.id,
                    status="Sent"
                )
                db.add(recipient)
            db.commit()

        # 7. Seed Threat Feed Intel
        existing_feed = db.query(ThreatFeed).first()
        if not existing_feed:
            feed_items = [
                {"title": "Active Spear Phishing targeting corporate finance routing codes", "desc": "Attackers mimicking bank payment remittance notices are targeting invoice clearance staff.", "src": "CISA Alert Summary", "severity": "High"},
                {"title": "MFA Exhaustion attack tactics increasing globally", "desc": "Threat actors are spamming targets with access push approvals repeatedly to induce authorization triggers.", "src": "Internal Security Ops", "severity": "Medium"}
            ]
            for f in feed_items:
                feed = ThreatFeed(
                    title=f["title"],
                    description=f["desc"],
                    source=f["src"],
                    severity=f["severity"]
                )
                db.add(feed)
            db.commit()
            print("Seeded sample threat intelligence feed.")

        # 8. Seed Default Templates
        templates_to_seed = [
            {
                "title": "Password Reset Alert",
                "subject": "Urgent: Your Password Expires in 24 Hours",
                "category": "Phishing",
                "difficulty": "Easy",
                "sender_name": "IT Security Desk",
                "sender_email": "security-alert@phintra-auth.com",
                "body_html": "<h3>Account Action Required</h3><p>Dear {{EmployeeName}},</p><p>Your password for {{Company}} is set to expire in 24 hours. Please click the link below to verify your current password and reset it:</p><p><a href='{{TrackingLink}}'>Reset Password Now</a></p><p>Best regards,<br>IT Security Team</p>",
                "body_text": "Account Action Required\n\nDear {{EmployeeName}},\n\nYour password for {{Company}} is set to expire in 24 hours. Please copy and paste the link below to verify your current password and reset it:\n\n{{TrackingLink}}\n\nBest regards,\nIT Security Team"
            },
            {
                "title": "HR Policy Update",
                "subject": "Important: Updated Employee Policy - Action Required",
                "category": "Phishing",
                "difficulty": "Medium",
                "sender_name": "Human Resources",
                "sender_email": "hr-updates@company-alert.com",
                "body_html": "<h3>HR Policy Guidelines Update</h3><p>Dear {{EmployeeName}},</p><p>We have updated our internal corporate employee guidelines policy. Please review and sign the document at your earliest convenience to acknowledge compliance:</p><p><a href='{{TrackingLink}}'>Access Policy Document</a></p><p>Best regards,<br>Human Resources Department</p>",
                "body_text": "HR Policy Guidelines Update\n\nDear {{EmployeeName}},\n\nWe have updated our internal corporate employee guidelines policy. Please review and sign the document at your earliest convenience to acknowledge compliance:\n\n{{TrackingLink}}\n\nBest regards,\nHuman Resources Department"
            },
            {
                "title": "Security Awareness Reminder",
                "subject": "Mandatory: Complete Your Annual Security Training",
                "category": "Awareness",
                "difficulty": "Easy",
                "sender_name": "Security Compliance",
                "sender_email": "compliance@company-alert.com",
                "body_html": "<h3>Mandatory Training Notice</h3><p>Dear {{EmployeeName}},</p><p>This is a reminder that you have pending training assignments. Please log in to complete your annual cyber security modules:</p><p><a href='{{TrackingLink}}'>Access Training Portal</a></p><p>Best regards,<br>Security Compliance</p>",
                "body_text": "Mandatory Training Notice\n\nDear {{EmployeeName}},\n\nThis is a reminder that you have pending training assignments. Please log in to complete your annual cyber security modules:\n\n{{TrackingLink}}\n\nBest regards,\nSecurity Compliance"
            },
            {
                "title": "Account Verification",
                "subject": "Action Required: Verify Your Corporate Account",
                "category": "Phishing",
                "difficulty": "Hard",
                "sender_name": "SecOps Center",
                "sender_email": "secops@phintra-auth.com",
                "body_html": "<h3>Corporate Account Verification</h3><p>Dear {{EmployeeName}},</p><p>We detected unusual activity on your account. To maintain your corporate access, please verify your profile using the link below:</p><p><a href='{{TrackingLink}}'>Verify Account Profile</a></p><p>Best regards,<br>SecOps Center</p>",
                "body_text": "Corporate Account Verification\n\nDear {{EmployeeName}},\n\nWe detected unusual activity on your account. To maintain your corporate access, please verify your profile using the link below:\n\n{{TrackingLink}}\n\nBest regards,\nSecOps Center"
            }
        ]
        for t_data in templates_to_seed:
            existing = db.query(EmailTemplate).filter(EmailTemplate.title == t_data["title"]).first()
            if not existing:
                template = EmailTemplate(
                    title=t_data["title"],
                    subject=t_data["subject"],
                    category=t_data["category"],
                    difficulty=t_data.get("difficulty", "Medium"),
                    sender_name=t_data.get("sender_name", "System Notification"),
                    sender_email=t_data.get("sender_email"),
                    body_html=t_data["body_html"],
                    body_text=t_data["body_text"]
                )
                db.add(template)
                db.commit()
                print(f"Seeded template: {t_data['title']}")

        # 9. Seed Default Landing Page
        existing_page = db.query(AwarenessPage).first()
        if not existing_page:
            page = AwarenessPage(
                title="Security Awareness Training Landing Page",
                html_content="<h1>This was a simulation run!</h1><p>You clicked on an authorized educational simulation link. Please complete your training modules.</p>"
            )
            db.add(page)
            db.commit()
            print("Seeded standard awareness warning page.")

        # Map everything to company and admin at the end of seed_data
        if settings.APP_MODE == "single_company":
            allowed_admin = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
            company = db.query(Company).filter(Company.company_name == settings.COMPANY_NAME.strip()).first()
            if allowed_admin and company:
                # Map Departments
                depts = db.query(Department).all()
                for dept in depts:
                    dept.company_id = company.id
                    dept.admin_id = allowed_admin.id
                
                # Map Employees
                employees = db.query(Employee).all()
                for emp in employees:
                    emp.company_id = company.id
                    emp.admin_id = allowed_admin.id
                
                # Map campaigns
                campaigns = db.query(Campaign).all()
                for camp in campaigns:
                    camp.admin_id = allowed_admin.id
                    camp.company_id = company.id
                    
                db.commit()
                print("Successfully ran final mapping of all records to single company/admin.")

        print("Database seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
