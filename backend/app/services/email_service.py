import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_otp_email(to_email: str, otp_code: str) -> bool:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USERNAME", "")
        smtp_pass = os.getenv("SMTP_PASSWORD", "")
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "noreply@cloudops.ai")
        from_name = os.getenv("SMTP_FROM_NAME", "CloudOps AI Assessment Platform")

        if not smtp_user or not smtp_pass:
            logger.info(f"📧 [DEV MODE] Email OTP [{otp_code}] generated for {to_email}. (Add SMTP_USERNAME & SMTP_PASSWORD to .env to send real email)")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"{otp_code} is your CloudOps AI Verification Code"
            msg["From"] = f"{from_name} <{from_email}>"
            msg["To"] = to_email

            text_body = f"Your CloudOps AI verification code is: {otp_code}. Valid for 10 minutes."
            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #232F3E; margin: 0;">CloudOps <span style="color: #FF9900;">AI</span></h2>
                    <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Student Onboarding Verification</p>
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 12px; border: 1px solid #cbd5e1;">
                    <p style="font-size: 14px; color: #334155; margin: 0 0 10px 0;">Your 6-Digit Email OTP Verification Code:</p>
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #FF9900; font-family: monospace;">{otp_code}</div>
                </div>
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
                    If you did not request this verification code, please ignore this email.
                </p>
            </div>
            """

            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()

            logger.info(f"🚀 Real Email OTP [{otp_code}] dispatched successfully to {to_email} via SMTP")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to dispatch Email OTP via SMTP ({e})")
            return False
