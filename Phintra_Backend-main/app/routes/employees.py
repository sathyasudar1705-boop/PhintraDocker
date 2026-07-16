from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.employee import Employee
from app.models.department import Department
from app.models.audit_log import SecurityScore
from app.schemas.employee_schema import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeDetailResponse
from app.dependencies import require_manager, require_admin, get_user_admin_id, get_user_company_id
from app.models.audit_log import AuditLog
from app.models.user import User
from uuid import UUID
from typing import List, Optional
import requests
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=List[EmployeeDetailResponse])
def list_employees(
    department_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """List employees with optional filters (Managers & Admins)."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)
    
    query = db.query(Employee).filter(Employee.admin_id == admin_id)
    
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if status_filter:
        query = query.filter(Employee.status == status_filter)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Employee.first_name.ilike(search_pattern)) | 
            (Employee.last_name.ilike(search_pattern)) | 
            (Employee.email.ilike(search_pattern))
        )
        
    employees = query.all()
    
    from sqlalchemy import func
    from app.models.employee import EmployeeActivityEvent
    from app.models.training import TrainingAssignment, TrainingCompletion
    
    # Sum points_change per employee
    points_rows = db.query(
        EmployeeActivityEvent.employee_id,
        func.sum(EmployeeActivityEvent.points_change)
    ).group_by(EmployeeActivityEvent.employee_id).all()
    points_map = {row[0]: int(row[1]) for row in points_rows if row[0] is not None}

    # Count reported events per employee
    reported_rows = db.query(
        EmployeeActivityEvent.employee_id,
        func.count(EmployeeActivityEvent.id)
    ).filter(EmployeeActivityEvent.event_type == "email_reported").group_by(EmployeeActivityEvent.employee_id).all()
    reported_map = {row[0]: int(row[1]) for row in reported_rows if row[0] is not None}

    # Count click events per employee
    clicked_rows = db.query(
        EmployeeActivityEvent.employee_id,
        func.count(EmployeeActivityEvent.id)
    ).filter(EmployeeActivityEvent.event_type == "link_clicked").group_by(EmployeeActivityEvent.employee_id).all()
    clicked_map = {row[0]: int(row[1]) for row in clicked_rows if row[0] is not None}

    # Training modules completion count
    training_total_rows = db.query(
        TrainingAssignment.employee_id,
        func.count(TrainingAssignment.id)
    ).group_by(TrainingAssignment.employee_id).all()
    training_total_map = {row[0]: int(row[1]) for row in training_total_rows if row[0] is not None}

    training_completed_rows = db.query(
        TrainingCompletion.employee_id,
        func.count(TrainingCompletion.id)
    ).filter(TrainingCompletion.status == "completed").group_by(TrainingCompletion.employee_id).all()
    training_completed_map = {row[0]: int(row[1]) for row in training_completed_rows if row[0] is not None}

    # Enrich with department name and activity analytics
    enriched_results = []
    for emp in employees:
        dept = db.query(Department).filter(
            Department.id == emp.department_id,
            Department.admin_id == admin_id
        ).first()
        
        enriched = EmployeeDetailResponse.from_orm(emp)
        enriched.department_name = dept.name if dept else "Unknown"
        enriched.has_password = bool(emp.password_hash)
        
        # Populate live scoring behavior stats
        enriched.total_points = points_map.get(emp.id, 0)
        enriched.report_count = reported_map.get(emp.id, 0)
        enriched.click_count = clicked_map.get(emp.id, 0)
        
        tot_t = training_total_map.get(emp.id, 0)
        com_t = training_completed_map.get(emp.id, 0)
        enriched.training_progress = f"{round(com_t / tot_t * 100.0, 1)}%" if tot_t > 0 else "0.0%"
        
        enriched_results.append(enriched)
        
    return enriched_results

class MicrosoftImportUser(BaseModel):
    name: str
    email: str
    department: str

class MicrosoftImportRequest(BaseModel):
    users: List[MicrosoftImportUser]

@router.get("/microsoft/users")
def get_microsoft_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Fetch users from Microsoft Directory using Client Credentials flow"""
    client_id = settings.MICROSOFT_CLIENT_ID
    client_secret = settings.MICROSOFT_CLIENT_SECRET
    tenant_id = settings.MICROSOFT_TENANT_ID

    if not client_id or not client_secret or not tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Microsoft OAuth parameters are not configured on the backend."
        )

    # 1. Get App-Only Token
    token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
    token_data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default",
        "grant_type": "client_credentials"
    }

    try:
        token_res = requests.post(token_url, data=token_data)
        token_res.raise_for_status()
        access_token = token_res.json().get("access_token")
    except Exception as e:
        raise HTTPException(
            status_code=403,
            detail="Microsoft directory permission is required to import employees. Please ensure the app has Admin Consent for User.Read.All."
        )

    # 2. Fetch Users
    graph_url = "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,jobTitle,department"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        users_res = requests.get(graph_url, headers=headers)
        users_res.raise_for_status()
        ms_users = users_res.json().get("value", [])
        return {"users": ms_users}
    except Exception as e:
        raise HTTPException(
            status_code=403,
            detail="Failed to fetch Microsoft users. Ensure the app has User.Read.All Application permission."
        )

@router.post("/microsoft/import")
def import_microsoft_users(
    payload: MicrosoftImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Import selected Microsoft users into Employee DB"""
    from app.config import settings
    import sqlalchemy as sa
    
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)
    
    if settings.APP_MODE == "single_company":
        admin_user = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
        if admin_user:
            admin_id = admin_user.id
        from app.models.company import Company
        comp = db.query(Company).filter(sa.func.lower(Company.company_name) == settings.COMPANY_NAME.strip().lower()).first()
        if not comp:
            comp = db.query(Company).first()
        if comp:
            company_id = comp.id

    domain_conf = settings.COMPANY_DOMAIN.strip().lower()
    if "://" in domain_conf:
        domain_conf = domain_conf.split("://")[1]
    domain_conf = domain_conf.split("/")[0]
    if domain_conf.startswith("www."):
        domain_conf = domain_conf[4:]
    
    imported_count = 0
    for user_data in payload.users:
        # Check if exists
        email = user_data.email.strip().lower()
        if not email:
            continue
            
        # Verify email domain
        email_domain = email.split("@")[-1].lower()
        if email_domain != domain_conf:
            continue
            
        # Do not import admin account
        if email == settings.ALLOWED_ADMIN_EMAIL.strip().lower():
            continue
            
        existing = db.query(Employee).filter(
            Employee.email == email,
            Employee.admin_id == admin_id
        ).first()
        
        if existing:
            continue
            
        # Ensure department exists
        dept_name = user_data.department or "Unknown"
        department = db.query(Department).filter(
            Department.name == dept_name,
            Department.admin_id == admin_id
        ).first()
        
        if not department:
            department = Department(name=dept_name, admin_id=admin_id, company_id=company_id)
            db.add(department)
            db.commit()
            db.refresh(department)
            
        # Create Employee
        new_emp = Employee(
            name=user_data.name,
            first_name=user_data.name.split()[0] if user_data.name else "",
            last_name=" ".join(user_data.name.split()[1:]) if user_data.name and len(user_data.name.split()) > 1 else "",
            email=email,
            department_id=department.id,
            company_id=company_id,
            admin_id=admin_id,
            is_active=True,
            status="Low Risk",
            role="employee"
        )
        db.add(new_emp)
        imported_count += 1
        
    db.commit()
    
    audit = AuditLog(
        user_id=current_user.id,
        action="Microsoft Employee Import",
        details=f"Admin imported {imported_count} employees from Microsoft."
    )
    db.add(audit)
    db.commit()
    
    return {"message": f"Successfully imported {imported_count} employees."}

@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Get single employee profile by UUID (Managers & Admins)."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)
    
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if emp.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this employee")
    return emp

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(emp_in: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Create a new employee profile (Admins only)."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)

    if emp_in.company_id:
        from app.models.company import Company
        comp = db.query(Company).filter(Company.id == emp_in.company_id, Company.admin_id == admin_id).first()
        if not comp:
            raise HTTPException(status_code=403, detail="Company does not belong to this admin")

    # Reject duplicate emails within this company/admin scope
    existing_emp = db.query(Employee).filter(
        Employee.email == emp_in.email,
        Employee.admin_id == admin_id
    ).first()
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee email already registered")
        
    existing_user = db.query(User).filter(User.email == emp_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already in use by a portal user")
        
    # Verify department exists and belongs to this admin's company scope
    dept = db.query(Department).filter(
        Department.id == emp_in.department_id,
        Department.admin_id == admin_id
    ).first()
    if not dept:
        raise HTTPException(status_code=400, detail="Department does not exist or access denied")
        
    emp_data = emp_in.dict(exclude={"password", "role"})
    
    # Handle name and first/last name alignment for backward compatibility
    if emp_in.name:
        parts = emp_in.name.strip().split(" ")
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else "Employee"
        emp_data["first_name"] = first_name
        emp_data["last_name"] = last_name
    else:
        first_name = emp_in.first_name or "Unknown"
        last_name = emp_in.last_name or "Employee"
        emp_data["name"] = f"{first_name} {last_name}".strip()
        emp_data["first_name"] = first_name
        emp_data["last_name"] = last_name

    db_emp = Employee(**emp_data)
    
    if emp_in.password:
        from app.utils.security import hash_password
        hashed = hash_password(emp_in.password)
        db_emp.hashed_password = hashed
        db_emp.password_hash = hashed
        
    db_emp.role = "employee"
    db_emp.created_by = current_user.id
    db_emp.admin_id = admin_id
    db_emp.company_id = emp_in.company_id if emp_in.company_id else company_id
        
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    
    # Store initial historical score
    score_entry = SecurityScore(employee_id=db_emp.id, score=(100.0 - db_emp.risk_score))
    db.add(score_entry)
    db.commit()
    
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="Employee Creation", details=f"Created employee: {db_emp.name or (db_emp.first_name + ' ' + db_emp.last_name)}")
    db.add(audit)
    db.commit()
    
    return db_emp

@router.put("/{id}", response_model=EmployeeResponse)
def update_employee(id: UUID, emp_in: EmployeeUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Update details of employee profile (Managers & Admins)."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)

    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if emp.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this employee")
        
    update_data = emp_in.dict(exclude_unset=True, exclude={"password"})
    
    if "company_id" in update_data and update_data["company_id"]:
        from app.models.company import Company
        comp = db.query(Company).filter(Company.id == update_data["company_id"], Company.admin_id == admin_id).first()
        if not comp:
            raise HTTPException(status_code=403, detail="Company does not belong to this admin")

    # Verify department exists if being updated
    if "department_id" in update_data and update_data["department_id"]:
        dept = db.query(Department).filter(
            Department.id == update_data["department_id"],
            Department.admin_id == admin_id
        ).first()
        if not dept:
            raise HTTPException(status_code=400, detail="Department does not exist")
            
    for key, val in update_data.items():
        setattr(emp, key, val)
        
    if emp_in.password:
        from app.utils.security import hash_password
        emp.password_hash = hash_password(emp_in.password)
        
    db.commit()
    db.refresh(emp)
    
    # Store updated historical score if risk score changed
    if "risk_score" in update_data:
        score_entry = SecurityScore(employee_id=emp.id, score=(100.0 - emp.risk_score))
        db.add(score_entry)
        db.commit()
        
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="Employee Modification", details=f"Modified employee: {emp.first_name} {emp.last_name}")
    db.add(audit)
    db.commit()
    
    return emp

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_employee(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(require_manager)):
    """Remove an employee profile from database (Managers & Admins)."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)

    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    if emp.admin_id != admin_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this employee")
    emp_name = f"{emp.first_name} {emp.last_name}"
    
    # Clean up ReportLog records for this employee to prevent NOT NULL violation
    from app.models.campaign import ReportLog
    db.query(ReportLog).filter(ReportLog.employee_id == id).delete()
    
    db.delete(emp)
    db.commit()
    
    # Audit log
    audit = AuditLog(user_id=current_user.id, action="Employee Deletion", details=f"Deleted employee: {emp_name}")
    db.add(audit)
    db.commit()
    
    return {"detail": "Employee successfully deleted"}

