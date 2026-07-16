import smtplib
import requests
from email.message import EmailMessage
from typing import Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.email_log import EmailLog
from app.database import SessionLocal

# ─────────────────────────────────────────────────────────────────────────────
# Microsoft Graph API — Token & Mail Sending
# ─────────────────────────────────────────────────────────────────────────────

GRAPH_TOKEN_URL = "https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
GRAPH_SEND_URL  = "https://graph.microsoft.com/v1.0/users/{from_email}/sendMail"

def _get_graph_access_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    """
    Obtain an OAuth2 access token via client_credentials flow from Microsoft Identity.
    Raises RuntimeError on failure.
    """
    url = GRAPH_TOKEN_URL.format(tenant_id=tenant_id)
    payload = {
        "grant_type":    "client_credentials",
        "client_id":     client_id,
        "client_secret": client_secret,
        "scope":         "https://graph.microsoft.com/.default",
    }
    resp = requests.post(url, data=payload, timeout=15)
    if resp.status_code != 200:
        raise RuntimeError(
            f"Microsoft Graph token request failed ({resp.status_code}): {resp.text}"
        )
    return resp.json()["access_token"]


def _send_via_graph(
    access_token: str,
    from_email: str,
    from_name: str,
    to_email: str,
    subject: str,
    html_body: str,
    text_body: str,
) -> None:
    """
    Send an email using Microsoft Graph API Mail.Send.
    Raises RuntimeError on failure.
    """
    url = GRAPH_SEND_URL.format(from_email=from_email)
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type":  "application/json",
    }
    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": html_body,
            },
            "toRecipients": [
                {"emailAddress": {"address": to_email}}
            ],
            "from": {
                "emailAddress": {
                    "address": from_email,
                    "name": from_name or from_email
                }
            },
        },
        "saveToSentItems": "true",
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=20)
    if resp.status_code not in (200, 202):
        err_text = resp.text
        # If permission is missing (403/401/AccessDenied/SendAsDenied/ResourceNotFound)
        if resp.status_code in (401, 403) or "ErrorAccessDenied" in err_text or "SendAsDenied" in err_text or "ResourceNotFound" in err_text:
            raise RuntimeError("Microsoft sender permission missing.")
        raise RuntimeError(
            f"Microsoft Graph Mail.Send failed ({resp.status_code}): {err_text}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Outlook SMTP — fallback domain validation
# ─────────────────────────────────────────────────────────────────────────────

_BLOCKED_SMTP_PROVIDERS = {"gmail.com", "yahoo.com", "aol.com", "icloud.com", "yandex.com"}

def _validate_outlook_smtp_user(smtp_user: str) -> tuple:
    if not smtp_user or "@" not in smtp_user:
        return False, "SMTP_USER is not set or is invalid."
    domain = smtp_user.split("@")[-1].lower()
    if domain in _BLOCKED_SMTP_PROVIDERS:
        return False, (
            f"SMTP_USER '{smtp_user}' uses a non-Microsoft email provider ({domain}). "
            "Outlook SMTP requires an Outlook/Office 365 account or a corporate domain "
            "routed through Microsoft Exchange/Office 365."
        )
    return True, ""


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def send_email(*args, **kwargs) -> bool:
    """
    Send email using Microsoft Graph API (primary) or Outlook SMTP (fallback).

    Priority:
      1. Microsoft Graph API — if MAIL_MICROSOFT_CLIENT_ID, MAIL_MICROSOFT_TENANT_ID,
         MAIL_MICROSOFT_CLIENT_SECRET, and MAIL_FROM_EMAIL are all set.
      2. Outlook SMTP — if SMTP_HOST and SMTP_USER are set.
      3. Simulation mode — logs to console only (no credentials configured).

    Supports two call signatures:
      send_email(db, to_email, subject, body) -> bool
      send_email(to_email, subject, body)     -> bool
    """
    # ── Unpack arguments ─────────────────────────────────────────────────────
    db       = None
    to_email = None
    subject  = None
    body     = None

    if len(args) > 0 and (isinstance(args[0], Session) or hasattr(args[0], "commit")):
        db       = args[0]
        to_email = args[1] if len(args) > 1 else kwargs.get("to_email")
        subject  = args[2] if len(args) > 2 else kwargs.get("subject")
        body     = args[3] if len(args) > 3 else kwargs.get("body")
    else:
        to_email = args[0] if len(args) > 0 else kwargs.get("to_email")
        subject  = args[1] if len(args) > 1 else kwargs.get("subject")
        body     = args[2] if len(args) > 2 else kwargs.get("body")
        db       = args[3] if len(args) > 3 else kwargs.get("db")

    # ── DB session ───────────────────────────────────────────────────────────
    db_created = False
    if db is None:
        db = SessionLocal()
        db_created = True

    # ── Validate recipient ───────────────────────────────────────────────────
    if not to_email or "@" not in to_email or "." not in to_email:
        err_msg = f"Invalid recipient email format: {to_email}"
        print(f"[DEBUG] Validation Failed - {err_msg}")
        if db_created:
            db.close()
        if kwargs.get("raise_on_error"):
            raise ValueError(err_msg)
        return False

    raise_on_error = kwargs.get("raise_on_error", False)

    # ── Resolve custom sender (for rotation) ──────────────────────────────────
    sender_email = kwargs.get("sender_email")
    sender_display_name = kwargs.get("sender_display_name")

    # Determine effective From address and display name
    graph_from = sender_email or (settings.MAIL_FROM_EMAIL.strip() if settings.MAIL_FROM_EMAIL else "")
    smtp_from  = sender_email or (settings.SMTP_FROM_EMAIL or settings.SMTP_USER).strip()
    from_display_name = sender_display_name or (sender_email.split("@")[0] if sender_email else "Security Awareness")

    # ── Sender profile display name override ─────────────────────────────────
    sender_profile = kwargs.get("sender_profile")
    sender_profile_id = kwargs.get("sender_profile_id")
    sp = None
    if sender_profile:
        sp = sender_profile
    elif sender_profile_id:
        try:
            from app.models.sender_profile import SenderProfile
            sp = db.query(SenderProfile).filter(
                SenderProfile.profile_id == sender_profile_id
            ).first()
        except Exception:
            pass

    if sp and not sender_email:
        graph_from = sp.email_address
        smtp_from = sp.email_address
        from_display_name = sp.display_name

    display_from = f"{from_display_name} <{smtp_from}>" if smtp_from else ""

    # ── Safety: block sending to the sender / admin addresses ────────────────
    blocked = {graph_from.lower(), smtp_from.lower(), settings.SMTP_USER.lower()}
    blocked.discard("")
    if to_email.lower() in blocked:
        err_msg = f"Delivery blocked: recipient {to_email} matches sender/admin credentials."
        print(f"[DEBUG] Safety Block - {err_msg}")
        if db_created:
            db.close()
        if raise_on_error:
            raise ValueError(err_msg)
        return False

    # ── Body preparation ─────────────────────────────────────────────────────
    safe_disclaimer = (
        "\n\n---\nDisclaimer: This is an educational notification or authorized security "
        "training communication from the Phintra Platform. Never share passwords or click "
        "links from unknown sources."
    )
    full_body = body + safe_disclaimer

    # Build plain/html variants
    is_html  = "html" in full_body.lower() or "<" in full_body
    html_body = full_body if is_html else full_body.replace("\n", "<br>")
    text_body = full_body

    # ── Log entry ─────────────────────────────────────────────────────────────
    campaign_id  = kwargs.get("campaign_id")
    template_id  = kwargs.get("template_id")
    employee_id  = kwargs.get("employee_id")
    admin_id     = kwargs.get("admin_id")

    if not admin_id and employee_id:
        from app.models.employee import Employee
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if emp:
            admin_id = emp.admin_id

    log_entry = EmailLog(
        recipient_email=to_email,
        subject=subject,
        campaign_id=campaign_id,
        template_id=template_id,
        employee_id=employee_id,
        admin_id=admin_id,
        sender_email=graph_from or smtp_from,
        sender_display_name=from_display_name
    )

    try:
        # ── Path 1: Microsoft Graph API ───────────────────────────────────────
        graph_client_id     = settings.MAIL_MICROSOFT_CLIENT_ID.strip()
        graph_tenant_id     = settings.MAIL_MICROSOFT_TENANT_ID.strip()
        graph_client_secret = settings.MAIL_MICROSOFT_CLIENT_SECRET.strip()

        if graph_client_id and graph_tenant_id and graph_client_secret and graph_from:
            print(f"[GRAPH] Sending via Microsoft Graph API | From: {from_display_name} <{graph_from}> -> To: {to_email}")
            token = _get_graph_access_token(graph_tenant_id, graph_client_id, graph_client_secret)
            _send_via_graph(token, graph_from, from_display_name, to_email, subject, html_body, text_body)
            log_entry.status = "Sent"
            log_entry.error_message = f"Sent via Microsoft Graph API from {graph_from}"
            db.add(log_entry)
            db.commit()
            print(f"[GRAPH] [OK] Delivered to {to_email}")
            return True

        # ── Path 2: Outlook SMTP fallback ────────────────────────────────────
        if settings.SMTP_HOST and settings.SMTP_USER:
            print(f"[SMTP] Sending via Outlook SMTP | From: {display_from} -> To: {to_email}")

            is_valid, validation_warning = _validate_outlook_smtp_user(settings.SMTP_USER)
            if not is_valid:
                raise RuntimeError(f"Outlook SMTP configuration error: {validation_warning}")

            if smtp_from.lower() != settings.SMTP_USER.lower():
                print(
                    f"[SMTP WARNING] SMTP_FROM_EMAIL ({smtp_from}) differs from "
                    f"SMTP_USER ({settings.SMTP_USER}). 'Send As' permission may be required."
                )

            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"]    = display_from
            msg["To"]      = to_email
            if is_html:
                msg.set_content(text_body)
                msg.add_alternative(html_body, subtype="html")
            else:
                msg.set_content(text_body)

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(smtp_from, [to_email], msg.as_string())
            server.quit()

            log_entry.status = "Sent"
            db.add(log_entry)
            db.commit()
            print(f"[SMTP] [OK] Delivered to {to_email}")
            return True

        # ── Path 3: Simulation mode ───────────────────────────────────────────
        print(f"[SIMULATION] No credentials configured — logging only.")
        print(f"[SIMULATION] To: {to_email} | Subject: {subject}")
        log_entry.status = "Sent"
        log_entry.error_message = "Simulated delivery (no Graph/SMTP credentials in .env)"
        db.add(log_entry)
        db.commit()
        return True

    except Exception as e:
        error_msg = str(e)
        # Handle Graph permission error specifically
        if "Microsoft sender permission missing" in error_msg:
            log_entry.error_message = "Microsoft sender permission missing."
        else:
            log_entry.error_message = (
                f"Outlook email sending failed. Please check Microsoft Graph credentials "
                f"and MAIL.Send permissions. Detail: {error_msg}"
            )
        print(f"[EMAIL ERROR] {log_entry.error_message}")
        log_entry.status = "Failed"
        db.add(log_entry)
        db.commit()
        if raise_on_error:
            raise e
        return False
    finally:
        if db_created:
            db.close()
