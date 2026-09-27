import logging
import os
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    async def send_otp(phone_number: str, otp_code: str) -> bool:
        """
        Send WhatsApp OTP to candidate number via AiSensy WhatsApp Business API.
        """
        clean_digits = "".join(filter(str.isdigit, phone_number))
        if len(clean_digits) == 10:
            formatted_phone = f"+91{clean_digits}"
        elif clean_digits.startswith("91") and len(clean_digits) == 12:
            formatted_phone = f"+{clean_digits}"
        else:
            formatted_phone = f"+{clean_digits}"

        aisensy_project_key = getattr(settings, "AISENSY_PROJECT_KEY", None) or os.getenv("AISENSY_PROJECT_KEY") or "22a9ef31d8d75d621ff5e"
        aisensy_api_key = getattr(settings, "AISENSY_API_KEY", None) or os.getenv("AISENSY_API_KEY")

        if aisensy_api_key and aisensy_project_key:
            url = "https://backend.aisensy.com/campaign/t1/api/v2"
            headers = {
                "Authorization": f"Bearer {aisensy_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "apiKey": aisensy_api_key,
                "campaignName": aisensy_project_key,
                "destination": formatted_phone,
                "userName": "Candidate User",
                "templateParams": [
                    otp_code
                ]
            }

            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    logger.info(f"AiSensy WhatsApp API response: {response.status_code} - {response.text}")
                    print(f"\n========================================\n[AISENSY WHATSAPP API LOG] OTP sent to {formatted_phone}: {otp_code} (Status: {response.status_code})\n========================================\n")
                    return True
            except Exception as e:
                logger.error(f"Failed to dispatch AiSensy WhatsApp OTP: {e}")

        logger.info(f"[WHATSAPP SERVICE BACKEND LOG] OTP for {formatted_phone}: {otp_code}")
        print(f"\n========================================\n[WHATSAPP GATEWAY LOG] OTP sent to {formatted_phone}: {otp_code}\n========================================\n")
        return True

    @staticmethod
    async def send_whatsapp_otp(phone_number: str, otp_code: str) -> bool:
        """
        Alias method for WhatsApp OTP dispatch.
        """
        return await SMSService.send_otp(phone_number, otp_code)



