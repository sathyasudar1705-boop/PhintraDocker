from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to retrieve currently authenticated user from database via JWT token."""
    from app.config import settings
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    emp_id: str = payload.get("employee_id")
    token_role: str = payload.get("role")
    if email is None:
        raise credentials_exception

    import sqlalchemy as sa
    email_lower = email.strip().lower()
        
    # Check Employee table first if explicitly logged in as Employee or has employee_id
    if token_role == "Employee" or emp_id:
        from app.models.employee import Employee
        from app.models.company import Company
        emp = None
        if emp_id:
            import uuid as uuid_pkg
            try:
                emp_uuid = uuid_pkg.UUID(str(emp_id))
                emp = db.query(Employee).filter(Employee.id == emp_uuid).first()
            except Exception:
                emp = None
        else:
            emp = db.query(Employee).filter(sa.func.lower(Employee.email) == email_lower).first()
            
        if emp:
            if not emp.is_active:
                raise HTTPException(status_code=400, detail="Inactive employee")
                
            # Single company enforcement
            if settings.APP_MODE == "single_company":
                allowed_admin = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
                company = db.query(Company).filter(sa.func.lower(Company.company_name) == settings.COMPANY_NAME.strip().lower()).first()
                if not company:
                    company = db.query(Company).first()
                    
                if allowed_admin and emp.admin_id != allowed_admin.id:
                    raise HTTPException(status_code=403, detail="Access denied. Employee does not belong to configured admin.")
                if company and emp.company_id != company.id:
                    raise HTTPException(status_code=403, detail="Access denied. Employee does not belong to configured company.")
                
            class MockUser:
                def __init__(self, id, email, role, is_active, admin_id):
                    self.id = id
                    self.email = email
                    self.role = role
                    self.is_active = is_active
                    self.admin_id = admin_id
            return MockUser(id=emp.id, email=emp.email, role="Employee", is_active=emp.is_active, admin_id=emp.admin_id)

    user = db.query(User).filter(sa.func.lower(User.email) == email_lower).first()
    if user is None:
        from app.models.employee import Employee
        from app.models.company import Company
        emp = None
        if emp_id:
            import uuid as uuid_pkg
            try:
                emp_uuid = uuid_pkg.UUID(str(emp_id))
                emp = db.query(Employee).filter(Employee.id == emp_uuid).first()
            except Exception:
                emp = None
        else:
            emp = db.query(Employee).filter(sa.func.lower(Employee.email) == email_lower).first()
            
        if emp is None:
            raise credentials_exception
        if not emp.is_active:
            raise HTTPException(status_code=400, detail="Inactive employee")
            
        # Single company enforcement
        if settings.APP_MODE == "single_company":
            allowed_admin = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
            company = db.query(Company).filter(sa.func.lower(Company.company_name) == settings.COMPANY_NAME.strip().lower()).first()
            if not company:
                company = db.query(Company).first()
                
            if allowed_admin and emp.admin_id != allowed_admin.id:
                raise HTTPException(status_code=403, detail="Access denied. Employee does not belong to configured admin.")
            if company and emp.company_id != company.id:
                raise HTTPException(status_code=403, detail="Access denied. Employee does not belong to configured company.")
            
        class MockUser:
            def __init__(self, id, email, role, is_active, admin_id):
                self.id = id
                self.email = email
                self.role = role
                self.is_active = is_active
                self.admin_id = admin_id
        return MockUser(id=emp.id, email=emp.email, role="Employee", is_active=emp.is_active, admin_id=emp.admin_id)
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    if settings.APP_MODE == "single_company":
        if user.role in ["Admin", "admin", "Security Administrator"] and user.email.strip().lower() != settings.ALLOWED_ADMIN_EMAIL.strip().lower():
            raise HTTPException(status_code=403, detail="Access denied. Only the allowed administrator is authorized.")
            
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user.role}' does not have permission to access this resource"
            )
        return user

# Helper definitions for route injection
require_admin = RoleChecker(["Admin"])
require_manager = RoleChecker(["Admin", "Manager"])
require_employee = RoleChecker(["Admin", "Manager", "Employee"])

# New dependency for admin-only routes
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Retrieve the currently authenticated admin user.
    Raises 403 if the user is not an admin.
    """
    user = get_current_user(token=token, db=db)
    if user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user

def get_user_admin_id(db: Session, user: User) -> str:
    """Retrieve the admin ID that owns/scopes this user's workspace."""
    from app.config import settings
    import sqlalchemy as sa
    
    if settings.APP_MODE == "single_company":
        admin_user = db.query(User).filter(sa.func.lower(User.email) == settings.ALLOWED_ADMIN_EMAIL.strip().lower()).first()
        if admin_user:
            return admin_user.id
            
    if user.role in ["Admin", "admin", "Security Administrator"]:
        return user.id
    
    # If the user is a MockUser or has an admin_id attribute
    if hasattr(user, "admin_id") and user.admin_id:
        return user.admin_id
        
    # Check Employee table lookup by email
    from app.models.employee import Employee
    emp = db.query(Employee).filter(Employee.email == user.email).first()
    if emp and emp.admin_id:
        return emp.admin_id
        
    return getattr(user, "admin_id", user.id)

def get_user_company_id(db: Session, user: User) -> str:
    """Retrieve the company ID that scopes this user's workspace."""
    from app.config import settings
    from app.models.company import Company
    import sqlalchemy as sa
    
    if settings.APP_MODE == "single_company":
        comp = db.query(Company).filter(sa.func.lower(Company.company_name) == settings.COMPANY_NAME.strip().lower()).first()
        if comp:
            return comp.id
        # Fallback to allowed admin's company
        admin_id = get_user_admin_id(db, user)
        if admin_id:
            comp = db.query(Company).filter(Company.admin_id == admin_id).first()
            if comp:
                return comp.id
        # Fallback to first company in DB
        comp = db.query(Company).first()
        if comp:
            return comp.id
            
    # If Admin, check company owned by this admin
    if user.role in ["Admin", "admin", "Security Administrator"]:
        comp = db.query(Company).filter(Company.admin_id == user.id).first()
        if comp:
            return comp.id
            
    # Check Employee table lookup by email
    from app.models.employee import Employee
    emp = db.query(Employee).filter(Employee.email == user.email).first()
    if emp and emp.company_id:
        return emp.company_id
        
    # Fallback to fetching company by resolved admin ID
    admin_id = get_user_admin_id(db, user)
    if admin_id:
        comp = db.query(Company).filter(Company.admin_id == admin_id).first()
        if comp:
            return comp.id
            
    return None
