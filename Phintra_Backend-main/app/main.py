from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import (
    auth_router, users_router, employees_router, departments_router,
    campaigns_router, training_router, quizzes_router, certificates_router,
    emails_router, analytics_router, notifications_router, audit_logs_router,
    companies_router, messages_router, leaderboard_router,
    sender_profiles_router, outlook_router, approved_senders_router
)

# Startup schema validation utility
def validate_db_schema():
    from sqlalchemy import inspect
    inspector = inspect(engine)
    
    # 1. Validate companies table columns
    companies_columns = {col['name'] for col in inspector.get_columns('companies')}
    required_companies = {'id', 'company_name', 'company_email', 'company_address', 'created_at', 'admin_id'}
    missing_companies = required_companies - companies_columns
    if missing_companies:
        raise ValueError(f"Database schema mismatch: 'companies' table is missing columns {missing_companies}")
        
    # 2. Validate departments table columns
    departments_columns = {col['name'] for col in inspector.get_columns('departments')}
    required_departments = {'id', 'name', 'company_id', 'admin_id'}
    missing_departments = required_departments - departments_columns
    if missing_departments:
        raise ValueError(f"Database schema mismatch: 'departments' table is missing columns {missing_departments}")

    # 3. Validate employees table columns
    employees_columns = {col['name'] for col in inspector.get_columns('employees')}
    required_employees = {'id', 'first_name', 'last_name', 'email', 'company_id', 'department_id', 'admin_id'}
    missing_employees = required_employees - employees_columns
    if missing_employees:
        raise ValueError(f"Database schema mismatch: 'employees' table is missing columns {missing_employees}")
        
    print("[INFO] Database schema validation succeeded. All required tables and columns are present.")

def _run_startup_migrations():
    try:
        import app.models
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text

        def run_migration_sql(sql_str, log_msg=None):
            try:
                with engine.begin() as conn:
                    conn.execute(text(sql_str))
                    if log_msg:
                        print(log_msg)
            except Exception:
                pass

        run_migration_sql("""CREATE TABLE IF NOT EXISTS companies (id UUID PRIMARY KEY, company_name VARCHAR UNIQUE NOT NULL, company_email VARCHAR, company_address VARCHAR, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""")
        run_migration_sql("ALTER TABLE companies ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to companies.")
        run_migration_sql("ALTER TABLE companies ADD COLUMN company_email VARCHAR;")
        run_migration_sql("ALTER TABLE companies ADD COLUMN company_address VARCHAR;")
        run_migration_sql("ALTER TABLE companies ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();")
        run_migration_sql("ALTER TABLE departments ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE departments ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to departments.")
        run_migration_sql("ALTER TABLE employees ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to employees.")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS dashboard_token VARCHAR;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN dashboard_token_expires_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS security_score DOUBLE PRECISION DEFAULT 0.0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS training_completed_count INTEGER DEFAULT 0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees ADD COLUMN IF NOT EXISTS quiz_completed_count INTEGER DEFAULT 0 NOT NULL;")
        run_migration_sql("ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;", "[INFO] Dropped global unique constraint employees_email_key.")
        run_migration_sql("DROP INDEX IF EXISTS uq_employees_email;", "[INFO] Dropped global unique index uq_employees_email.")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS sender_profiles (profile_id UUID PRIMARY KEY, domain VARCHAR NOT NULL, email_address VARCHAR UNIQUE NOT NULL, display_name VARCHAR NOT NULL, company_name VARCHAR, department VARCHAR);""", "[INFO] Created sender_profiles table.")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS approved_senders (id UUID PRIMARY KEY, email VARCHAR UNIQUE NOT NULL, display_name VARCHAR NOT NULL, domain VARCHAR NOT NULL, is_active BOOLEAN DEFAULT TRUE NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""", "[INFO] Created approved_senders table.")
        run_migration_sql("ALTER TABLE campaigns ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to campaigns.")
        run_migration_sql("ALTER TABLE campaigns ADD COLUMN sender_profile_id UUID REFERENCES sender_profiles(profile_id) ON DELETE SET NULL;")
        run_migration_sql("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sender_email VARCHAR;")
        run_migration_sql("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS sender_display_name VARCHAR;")
        run_migration_sql("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS randomize_sender BOOLEAN DEFAULT FALSE;")
        run_migration_sql("ALTER TABLE email_templates ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to email_templates.")
        run_migration_sql("ALTER TABLE email_templates ADD COLUMN difficulty VARCHAR DEFAULT 'Medium';")
        run_migration_sql("ALTER TABLE email_templates ADD COLUMN sender_name VARCHAR DEFAULT 'System Notification';")
        run_migration_sql("ALTER TABLE email_templates ADD COLUMN body_text VARCHAR;")
        run_migration_sql("ALTER TABLE email_templates ADD COLUMN sender_email VARCHAR;")
        run_migration_sql("ALTER TABLE email_logs ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to email_logs.")
        run_migration_sql("ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS sender_email VARCHAR;")
        run_migration_sql("ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS sender_display_name VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to reported_emails.")
        run_migration_sql("ALTER TABLE quizzes ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to quizzes.")
        run_migration_sql("ALTER TABLE certificates ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;", "[INFO] Added admin_id to certificates.")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN category VARCHAR;")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN duration INTEGER DEFAULT 10;")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN difficulty VARCHAR;")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN video_url VARCHAR;")
        run_migration_sql("ALTER TABLE training_modules ADD COLUMN uploaded_video_url VARCHAR;")
        run_migration_sql("ALTER TABLE training_assignments ADD COLUMN admin_id UUID REFERENCES users(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE training_assignments ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE training_assignments ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE training_assignments ALTER COLUMN employee_id DROP NOT NULL;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES users(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS email_log_id UUID REFERENCES email_logs(id) ON DELETE SET NULL;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS training_completed_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE campaign_recipients ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS employee_activity_events (id UUID PRIMARY KEY, admin_id UUID REFERENCES users(id) ON DELETE CASCADE, company_id UUID REFERENCES companies(id) ON DELETE CASCADE, department_id UUID REFERENCES departments(id) ON DELETE CASCADE, employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE, campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE, event_type VARCHAR NOT NULL, event_value VARCHAR, points_change INTEGER DEFAULT 0 NOT NULL, risk_change INTEGER DEFAULT 0 NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""", "[INFO] Created employee_activity_events table.")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS report_logs (id UUID PRIMARY KEY, employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE, campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, action VARCHAR NOT NULL, reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS training_completions (id UUID PRIMARY KEY, training_module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE, employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE, status VARCHAR NOT NULL DEFAULT 'not_started', completed_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""")
        run_migration_sql("""CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY, employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE, admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, sender_id UUID NOT NULL, sender_role VARCHAR NOT NULL, sender_name VARCHAR NOT NULL, message_text TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());""")
        run_migration_sql("ALTER TABLE messages ADD COLUMN reported_email_id UUID REFERENCES reported_emails(id) ON DELETE CASCADE;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN email_sender VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN sender_email VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN email_body TEXT;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN threat_score INTEGER;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN report_reason VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN report_status VARCHAR DEFAULT 'Pending';")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN report_source VARCHAR DEFAULT 'direct';")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN message_id VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN thread_id VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN reported_by UUID REFERENCES users(id) ON DELETE SET NULL;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN subject VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN sender VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN email_date TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN risk_score INTEGER DEFAULT 0;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN risk_level VARCHAR DEFAULT 'Low';")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN status VARCHAR DEFAULT 'Pending';")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN analysis_results JSON;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN provider VARCHAR DEFAULT 'direct';")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN outlook_message_id VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN internet_message_id VARCHAR;")
        run_migration_sql("ALTER TABLE reported_emails ADD COLUMN reported_from VARCHAR;")

        # Seed per-admin companies and backfill
        try:
            with engine.begin() as conn:
                import uuid as _uuid_mod
                admin_rows = conn.execute(text("SELECT id, email FROM users WHERE role = 'Admin' OR role = 'admin'")).fetchall()
                for admin_row in admin_rows:
                    admin_id, admin_email = admin_row[0], admin_row[1]
                    existing_company = conn.execute(text("SELECT id FROM companies WHERE admin_id = :admin_id LIMIT 1"), {"admin_id": admin_id}).fetchone()
                    if not existing_company:
                        company_name = f"Organization ({admin_email})"
                        company_id = str(_uuid_mod.uuid4())
                        try:
                            conn.execute(text("INSERT INTO companies (id, company_name, company_email, company_address, admin_id) VALUES (:id, :company_name, :company_email, '123 Cyber Way', :admin_id) ON CONFLICT DO NOTHING"), {"id": company_id, "company_name": company_name, "company_email": admin_email, "admin_id": admin_id})
                            print(f"[INFO] Created company for {admin_email}.")
                        except Exception as ce:
                            row = conn.execute(text("SELECT id FROM companies WHERE admin_id = :admin_id LIMIT 1"), {"admin_id": admin_id}).fetchone()
                            company_id = str(row[0]) if row else company_id
                    else:
                        company_id = str(existing_company[0])
                    conn.execute(text("UPDATE employees SET admin_id = :admin_id WHERE admin_id IS NULL AND company_id = :company_id"), {"admin_id": admin_id, "company_id": company_id})
                    conn.execute(text("UPDATE departments SET admin_id = :admin_id WHERE admin_id IS NULL AND company_id = :company_id"), {"admin_id": admin_id, "company_id": company_id})
                    conn.execute(text("UPDATE employees SET company_id = :company_id WHERE admin_id = :admin_id AND company_id IS NULL"), {"company_id": company_id, "admin_id": admin_id})
                conn.execute(text("UPDATE employees e SET admin_id = c.admin_id FROM companies c WHERE e.company_id = c.id AND e.admin_id IS NULL AND c.admin_id IS NOT NULL"))
                conn.execute(text("UPDATE departments d SET admin_id = c.admin_id FROM companies c WHERE d.company_id = c.id AND d.admin_id IS NULL AND c.admin_id IS NOT NULL"))

                # Seed sender profiles
                res_sp = conn.execute(text("SELECT COUNT(*) FROM sender_profiles")).fetchone()
                if res_sp and res_sp[0] == 0:
                    import uuid
                    for p in [
                        {"profile_id": str(uuid.uuid4()), "display_name": "Security Update", "email_address": "security-update@account-review-mail.com", "domain": "account-review-mail.com", "company_name": "Security Operations", "department": "Security"},
                        {"profile_id": str(uuid.uuid4()), "display_name": "HR Support", "email_address": "hr-support@employee-benefits-mail.com", "domain": "employee-benefits-mail.com", "company_name": "Human Resources", "department": "HR"},
                        {"profile_id": str(uuid.uuid4()), "display_name": "Access Center Notifications", "email_address": "notifications@secure-access-center.com", "domain": "secure-access-center.com", "company_name": "IT Helpdesk", "department": "IT"},
                        {"profile_id": str(uuid.uuid4()), "display_name": "Payroll Center", "email_address": "payroll@salary-review-center.com", "domain": "salary-review-center.com", "company_name": "Finance Dept", "department": "Payroll"},
                        {"profile_id": str(uuid.uuid4()), "display_name": "Microsoft Auth Verification", "email_address": "verify@login.microsoft-auth-verify.com", "domain": "login.microsoft-auth-verify.com", "company_name": "Microsoft Authentication", "department": "IT Security"},
                    ]:
                        conn.execute(text("INSERT INTO sender_profiles (profile_id, domain, email_address, display_name, company_name, department) VALUES (:profile_id, :domain, :email_address, :display_name, :company_name, :department)"), p)
                    print("[INFO] Seeded predefined sender profiles.")

                # Seed approved senders
                import uuid
                for s in [
                    {"email": "security@systechusa.com", "display_name": "Systech Security Team", "domain": "systechusa.com", "is_active": True},
                    {"email": "it-support@systechusa.com", "display_name": "Systech IT Helpdesk", "domain": "systechusa.com", "is_active": True},
                    {"email": "hr@systechusa.com", "display_name": "Systech Human Resources", "domain": "systechusa.com", "is_active": True},
                    {"email": "training@systechusa.com", "display_name": "Systech Compliance Training", "domain": "systechusa.com", "is_active": True},
                    {"email": "alerts@systechusa.com", "display_name": "Systech Activity Alerts", "domain": "systechusa.com", "is_active": True},
                    {"email": "sathyasudarv@systechusa.com", "display_name": "Systech Security Alert Office", "domain": "systechusa.com", "is_active": True},
                    {"email": "tharunp1@systechusa.com", "display_name": "Tharun P (Approved)", "domain": "systechusa.com", "is_active": True},
                    {"email": "saravananc@systechusa.com", "display_name": "Saravanan C (Approved)", "domain": "systechusa.com", "is_active": True},
                ]:
                    exist = conn.execute(text("SELECT id FROM approved_senders WHERE lower(email) = :email"), {"email": s["email"].lower()}).fetchone()
                    if not exist:
                        s_copy = dict(s)
                        s_copy["id"] = str(uuid.uuid4())
                        conn.execute(text("INSERT INTO approved_senders (id, email, display_name, domain, is_active) VALUES (:id, :email, :display_name, :domain, :is_active)"), s_copy)
                        print(f"[INFO] Seeded approved sender: {s['email']}")
        except Exception as e:
            print(f"[WARNING] Startup seeding/backfill failed: {e}")

        validate_db_schema()
    except Exception as e:
        print(f"[WARNING] Startup migrations failed: {e}")

import threading as _threading
_threading.Thread(target=_run_startup_migrations, daemon=True, name="startup-migrations").start()


app = FastAPI(
    title="Phintra API",
    description="Production-ready FastAPI backend for Phintra cybersecurity awareness and training platform.",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8501",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:8501",
    "https://phintra.vercel.app",
    "https://phintra-frontend.vercel.app",
    "https://phintra-backend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers & Logging Middlewares
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"[DEBUG ERROR] Validation error on {request.method} {request.url.path}: {exc.errors()}")
    body_data = b""
    try:
        body_data = await request.body()
    except Exception:
        pass
    print(f"[DEBUG ERROR] Request body was: {body_data.decode('utf-8', errors='ignore')}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid request payload or query parameters.", "errors": exc.errors()}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    print(f"[DEBUG ERROR] HTTP exception on {request.method} {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

from sqlalchemy.exc import ProgrammingError

@app.exception_handler(ProgrammingError)
async def programming_error_handler(request: Request, exc: ProgrammingError):
    error_msg = str(exc.orig) if exc.orig else str(exc)
    print(f"[DATABASE ERROR] Schema mismatch or query programming error: {error_msg}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Database schema mismatch. Please contact administrator to run database migrations.",
            "error_code": "DB_SCHEMA_MISMATCH",
            "message": error_msg
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(f"[DEBUG ERROR] Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

@app.middleware("http")
async def debug_logging_middleware(request: Request, call_next):
    # Log preflight/OPTIONS requests and authentication routes
    is_options = request.method == "OPTIONS"
    is_auth_route = "/auth/" in request.url.path
    
    if is_options or is_auth_route:
        print("=" * 60)
        print(f"[DEBUG REQUEST] {request.method} {request.url.path}")
        print(f"[DEBUG REQUEST] Headers: {dict(request.headers)}")
        print(f"[DEBUG REQUEST] Origin Header: {request.headers.get('origin')}")
        print("=" * 60)
        
    response = await call_next(request)
    
    if is_options or is_auth_route:
        print("=" * 60)
        print(f"[DEBUG RESPONSE] Status Code: {response.status_code}")
        print(f"[DEBUG RESPONSE] Headers: {dict(response.headers)}")
        print("=" * 60)
        
    return response

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(employees_router)
app.include_router(departments_router)
app.include_router(campaigns_router)
app.include_router(training_router)
app.include_router(quizzes_router)
app.include_router(certificates_router)
app.include_router(emails_router)
app.include_router(analytics_router)
app.include_router(notifications_router)
app.include_router(audit_logs_router)
app.include_router(companies_router)
app.include_router(messages_router)
app.include_router(leaderboard_router)
app.include_router(sender_profiles_router)
app.include_router(outlook_router)
app.include_router(approved_senders_router)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Phintra Cybersecurity Platform API",
        "documentation": "/docs"
    }

# Outlook Add-in generic report endpoint (simple echo/log)
@app.post("/report-email")
async def report_email(request: Request):
    data = await request.json()

    print("=" * 50)
    print("PHISHING EMAIL REPORTED")
    print("=" * 50)
    print(data)
    print("=" * 50)

    return {
        "status": "success",
        "message": "Email reported successfully",
        "email": data
    }


