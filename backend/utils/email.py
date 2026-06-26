import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import time
from backend.core.config import settings
from backend.core.logger import logger

def send_otp_email(to_email: str, otp_code: str, verification_link: str = None) -> bool:
    """
    Sends an email containing both a 6-digit OTP code and a clickable email verification link.
    If SMTP host & credentials (e.g. Brevo) are configured, sends via SMTP.
    Otherwise, if RESEND_API_KEY is configured, sends via Resend REST API.
    Otherwise, logs to console and appends to d:\cli\otp_emails.log as a fallback.
    """
    subject = "Verify your STUDLYF Account"
    
    link_html = ""
    if verification_link:
        link_html = f"""
        <div style="text-align: center; margin: 24px 0;">
            <a href="{verification_link}" style="background-color: #6366f1; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                Verify Email Address
            </a>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 10px;">Or copy-paste this link into your browser: <br/><a href="{verification_link}" style="color: #6366f1;">{verification_link}</a></p>
        </div>
        """
        
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; color: #333333;">
        <h2 style="color: #6366f1; text-align: center; margin-bottom: 24px;">STUDLYF Verification Email</h2>
        <p>Hello,</p>
        <p>Thank you for signing up for STUDLYF. Please verify your email using either the quick verification link or the 6-digit One-Time Password (OTP) below:</p>
        
        <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #f3f4f6; padding: 12px 24px; border-radius: 6px; border: 1px solid #d1d5db; display: inline-block;">
                {otp_code}
            </span>
            <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">6-digit verification code</p>
        </div>
        
        {link_html}
        
        <p>This code and link will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">STUDLYF Workspace • Elevate Your Startup Journey</p>
    </div>
    """
    
    # Always write to the log file for easy local debugging/viewing
    log_path = "d:\\cli\\otp_emails.log"
    try:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        link_str = f" | Link: {verification_link}" if verification_link else ""
        with open(log_path, "a") as f:
            f.write(f"[{timestamp}] To: {to_email} | OTP Code: {otp_code}{link_str}\n")
        logger.info(f"Saved email details to local log file: {log_path}")
    except Exception as e:
        logger.error(f"Failed to write to log file: {e}")
        
    # 1. Try sending via SMTP (Brevo/others) if configured
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        logger.info(f"Attempting to send verification email to {to_email} via SMTP ({settings.SMTP_HOST})...")
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_SENDER
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_SENDER, to_email, msg.as_string())
            logger.info(f"Successfully sent verification email via SMTP to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP: {e}")

    # 2. Try sending via Resend API if SMTP not set
    api_key = settings.RESEND_API_KEY
    if api_key and api_key != "your_resend_api_key" and api_key.strip():
        logger.info(f"Attempting to send verification email to {to_email} via Resend API...")
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            from_sender = "STUDLYF <onboarding@resend.dev>"
            if settings.SMTP_SENDER and settings.SMTP_SENDER != "onboarding@studlyf.com":
                from_sender = f"STUDLYF <{settings.SMTP_SENDER}>"
                
            payload = {
                "from": from_sender,
                "to": to_email,
                "subject": subject,
                "html": html_content
            }
            r = httpx.post(url, headers=headers, json=payload, timeout=5.0)
            if r.status_code in (200, 201):
                logger.info(f"Successfully sent email via Resend to {to_email}")
                return True
            else:
                logger.error(f"Failed to send email via Resend. Status: {r.status_code}, Response: {r.text}")
        except Exception as e:
            logger.error(f"Error connecting to Resend API: {e}")
            
    logger.info(f"Email Verification Fallback: To: {to_email} | Code: {otp_code} | Link: {verification_link}")
    return True
