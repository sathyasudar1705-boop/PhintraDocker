from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from uuid import UUID
from app.database import get_db
from app.models.employee import Employee, EmployeeActivityEvent
from app.models.company import Company
from app.models.department import Department
from app.models.training import TrainingCompletion, TrainingModule
from app.models.reported_email import ReportedEmail
from app.models.user import User
from app.dependencies import get_current_user, get_user_admin_id, get_user_company_id

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("")
def get_company_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(9999, ge=1, le=9999),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the live company leaderboard for the current user's organization."""
    admin_id = get_user_admin_id(db, current_user)
    company_id = get_user_company_id(db, current_user)
    viewer_employee_id = None

    if current_user.role in ["Employee", "employee"]:
        emp = db.query(Employee).filter(Employee.id == current_user.id).first()
        if not emp:
            emp = db.query(Employee).filter(Employee.email == current_user.email).first()
        if emp:
            viewer_employee_id = emp.id

    if not admin_id:
        return {
            "leaderboard": [],
            "total_count": 0,
            "viewer_stats": None
        }

    # Fetch active employees
    import sqlalchemy as sa
    if current_user.role in ["Employee", "employee"]:
        employees = db.query(Employee).filter(
            ((Employee.company_id == company_id) | (Employee.admin_id == admin_id)),
            Employee.is_active == True,
            sa.func.lower(sa.func.coalesce(Employee.role, '')) != 'admin'
        ).all()
    else:
        employees = db.query(Employee).filter(
            Employee.admin_id == admin_id,
            Employee.is_active == True,
            sa.func.lower(sa.func.coalesce(Employee.role, '')) != 'admin'
        ).all()

    total_employees = len(employees)

    # Sort in memory:
    # 1. xp descending
    # 2. security_score descending
    # 3. training_completed_count descending
    # 4. created_at ascending (meaning oldest first, reverse-reverse)
    employees.sort(
        key=lambda x: (x.xp, x.security_score, x.training_completed_count, -x.created_at.timestamp() if x.created_at else 0),
        reverse=True
    )

    # Pre-fetch department names
    departments = {d.id: d.name for d in db.query(Department).all()}

    viewer_stats = None
    final_leaderboard = []

    for index, emp in enumerate(employees):
        rank = index + 1
        percentile = round(((total_employees - rank + 1) / total_employees) * 100) if total_employees > 0 else 100
        
        # Determine badges
        badges = []
        if emp.security_score >= 90:
            badges.append("Security Champion")
        if emp.report_count >= 3:
            badges.append("Top Reporter")
        if emp.xp >= 500:
            badges.append("Perfect Month")

        item = {
            "employee_id": str(emp.id),
            "name": emp.name or f"{emp.first_name or ''} {emp.last_name or ''}".strip() or "Employee",
            "email": emp.email,
            "department_id": str(emp.department_id),
            "department": departments.get(emp.department_id, "General"),
            "security_score": emp.security_score,
            "completion_percentage": emp.training_completed_count * 20, # assumes 5 modules total or completion relative
            "reports_count": emp.report_count,
            "total_xp": emp.xp,
            "risk_score": emp.risk_score,
            "rank": rank,
            "percentile": percentile,
            "badges": badges
        }

        if viewer_employee_id and emp.id == viewer_employee_id:
            viewer_stats = {
                "rank": rank,
                "percentile": percentile,
                "security_score": emp.security_score,
                "total_xp": emp.xp,
                "completion_percentage": emp.training_completed_count * 20,
                "reports_count": emp.report_count
            }

        final_leaderboard.append(item)

    paginated_list = final_leaderboard[skip:skip+limit]

    return {
        "leaderboard": paginated_list,
        "total_count": total_employees,
        "viewer_stats": viewer_stats
    }


@router.get("/employee", response_model=List[Dict[str, Any]])
def get_employee_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the scoped leaderboard for employees belonging to the same company or admin."""
    from app.models.quiz import QuizAttempt
    
    # Retrieve the current employee record using the logged-in user id
    current_employee = db.query(Employee).filter(Employee.id == current_user.id).first()
    if not current_employee:
        current_employee = db.query(Employee).filter(Employee.email == current_user.email).first()
    if not current_employee and current_user.role in ["Admin", "admin", "Security Administrator", "Security Manager", "Manager"]:
        current_employee = db.query(Employee).filter(Employee.admin_id == current_user.id).first()
    if not current_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee record not found for the authenticated user."
        )

    # Query active employees belonging to the same company or admin scope (excluding admin roles)
    import sqlalchemy as sa
    employees = db.query(Employee).filter(
        Employee.is_active == True,
        sa.func.lower(sa.func.coalesce(Employee.role, '')) != 'admin',
        (Employee.company_id == current_employee.company_id) | (Employee.admin_id == current_employee.admin_id)
    ).all()

    # Pre-fetch departments and companies scoped to the current employee's admin
    departments = {d.id: d.name for d in db.query(Department).filter(Department.admin_id == current_employee.admin_id).all()}
    companies = {c.id: c.company_name for c in db.query(Company).filter(Company.admin_id == current_employee.admin_id).all()}

    processed_list = []
    for emp in employees:
        # Compute dynamic best badge
        badge = "Active Agent"
        if emp.security_score >= 90:
            badge = "Security Champion"
        elif emp.report_count >= 3:
            badge = "Top Reporter"
        elif emp.xp >= 500:
            badge = "Perfect Month"

        processed_list.append({
            "employee_id": str(emp.id),
            "employee_name": emp.name or f"{emp.first_name or ''} {emp.last_name or ''}".strip() or "Employee",
            "email": emp.email,
            "department": departments.get(emp.department_id, "General"),
            "company": companies.get(emp.company_id, "No Company"),
            "total_points": emp.xp,
            "risk_score": emp.risk_score,
            "report_count": emp.report_count,
            "safe_report_count": emp.report_count, # backward compatibility
            "training_completed_count": emp.training_completed_count,
            "quiz_pass_count": emp.quiz_completed_count,
            "badge": badge,
            "security_score": emp.security_score,
            "created_at": emp.created_at
        })

    # Sorting rules:
    # 1. Total points (xp) descending
    # 2. Security score descending
    # 3. Training completed count descending
    # 4. Quiz completed count descending
    # 5. Created at ascending (oldest first, reverse-reverse)
    processed_list.sort(
        key=lambda x: (
            x["total_points"],
            x["security_score"],
            x["training_completed_count"],
            x["quiz_pass_count"],
            -x["created_at"].timestamp() if x.get("created_at") else 0
        ),
        reverse=True
    )

    # Assign ranks
    for index, item in enumerate(processed_list):
        item["rank"] = index + 1
        if "created_at" in item:
            del item["created_at"]

    return processed_list
