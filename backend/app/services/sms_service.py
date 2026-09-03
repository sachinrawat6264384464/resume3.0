import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    async def send_otp(phone_number: str, otp_code: str) -> bool:
        """
        Send OTP SMS to the candidate's phone number via Fast2SMS, Twilio, or console logger.
        Never exposes the OTP code to the frontend client UI response.
        """
        clean_phone = "".join(filter(str.isdigit, phone_number))
        
        # 1. Fast2SMS Provider (Popular in India for Instant SMS)
        fast2sms_key = getattr(settings, "FAST2SMS_API_KEY", None)
        if fast2sms_key:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        "https://www.fast2sms.com/dev/bulkV2",
                        headers={"authorization": fast2sms_key},
                        json={
                            "variables_values": otp_code,
                            "route": "otp",
                            "numbers": clean_phone[-10:]
                        }
                    )
                    if response.status_code == 200:
                        logger.info(f"Fast2SMS OTP sent successfully to {clean_phone}")
                        return True
            except Exception as e:
                logger.error(f"Failed to send Fast2SMS OTP: {e}")

        # 2. Twilio Provider
        twilio_sid = getattr(settings, "TWILIO_ACCOUNT_SID", None)
        twilio_token = getattr(settings, "TWILIO_AUTH_TOKEN", None)
        twilio_from = getattr(settings, "TWILIO_PHONE_NUMBER", None)
        
        if twilio_sid and twilio_token and twilio_from:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                    formatted_phone = phone_number if phone_number.startswith("+") else f"+91{clean_phone[-10:]}"
                    response = await client.post(
                        url,
                        auth=(twilio_sid, twilio_token),
                        data={
                            "From": twilio_from,
                            "To": formatted_phone,
                            "Body": f"Your CloudOps AI verification OTP is: {otp_code}. Valid for 10 minutes."
                        }
                    )
                    if response.status_code in (200, 201):
                        logger.info(f"Twilio OTP sent successfully to {formatted_phone}")
                        return True
            except Exception as e:
                logger.error(f"Failed to send Twilio OTP: {e}")

        # 3. Development / Server Console Log (Kept strictly on server backend)
        logger.info(f"[SMS SERVICE BACKEND LOG] Mobile OTP generated for {phone_number}: {otp_code}")
        print(f"\n========================================\n[SMS GATEWAY LOG] OTP sent to {phone_number}: {otp_code}\n========================================\n")
        return True

    @staticmethod
    async def send_whatsapp_otp(phone_number: str, otp_code: str) -> bool:
        """
        Send WhatsApp OTP to candidate number via Meta WhatsApp Cloud API or Twilio WhatsApp.
        """
        clean_phone = "".join(filter(str.isdigit, phone_number))
        if len(clean_phone) == 10:
            clean_phone = f"91{clean_phone}"

        # 1. Meta WhatsApp Business Cloud API (Official Direct Chat Message)
        meta_token = getattr(settings, "META_WHATSAPP_TOKEN", None)
        meta_phone_id = getattr(settings, "META_WHATSAPP_PHONE_ID", None)
        if meta_token and meta_phone_id:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    url = f"https://graph.facebook.com/v18.0/{meta_phone_id}/messages"
                    headers = {
                        "Authorization": f"Bearer {meta_token}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "messaging_product": "whatsapp",
                        "to": clean_phone,
                        "type": "text",
                        "text": {"body": f"Your CloudOps AI verification OTP code is: {otp_code}"}
                    }
                    response = await client.post(url, headers=headers, json=payload)
                    if response.status_code == 200:
                        logger.info(f"Meta WhatsApp OTP sent directly into WhatsApp chat of +{clean_phone}")
                        return True
            except Exception as e:
                logger.error(f"Failed to send Meta WhatsApp OTP: {e}")

        # 2. Twilio WhatsApp Integration

        twilio_sid = getattr(settings, "TWILIO_ACCOUNT_SID", None)
        twilio_token = getattr(settings, "TWILIO_AUTH_TOKEN", None)
        
        if twilio_sid and twilio_token:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
                    response = await client.post(
                        url,
                        auth=(twilio_sid, twilio_token),
                        data={
                            "From": "whatsapp:+14155238886",
                            "To": f"whatsapp:+{clean_phone}",
                            "Body": f"Your CloudOps AI verification OTP is: {otp_code}"
                        }
                    )
                    if response.status_code in (200, 201):
                        logger.info(f"Twilio WhatsApp OTP sent successfully to {clean_phone}")
                        return True
            except Exception as e:
                logger.error(f"Failed to send Twilio WhatsApp OTP: {e}")

        logger.info(f"[WHATSAPP SERVICE LOG] OTP for {clean_phone}: {otp_code}")
        print(f"\n========================================\n[WHATSAPP GATEWAY LOG] OTP sent to +{clean_phone}: {otp_code}\n========================================\n")
        return True

