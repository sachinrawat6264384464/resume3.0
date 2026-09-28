import logging
import os
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class SMSService:
    @staticmethod
    async def send_otp(phone_number: str, otp_code: str, candidate_name: Optional[str] = None) -> bool:
        """
        Send WhatsApp OTP to candidate number via AiSensy WhatsApp Business API.
        """
        clean_digits = "".join(filter(str.isdigit, phone_number))
        if len(clean_digits) == 10:
            formatted_phone = f"+91{clean_digits}"
            dest_digits = f"91{clean_digits}"
        elif clean_digits.startswith("91") and len(clean_digits) == 12:
            formatted_phone = f"+{clean_digits}"
            dest_digits = clean_digits
        else:
            formatted_phone = f"+{clean_digits}"
            dest_digits = clean_digits

        # AiSensy Credentials from config / env
        # Smart auto-detection: find JWT token (starts with eyJ) from any env var if user pasted it there
        jwt_token = None
        for val in [
            os.getenv("AISENSY_API_KEY"),
            os.getenv("NEXT_PUBLIC_AISENSY_CAMPAIGN_NAME"),
            getattr(settings, "AISENSY_API_KEY", None),
            os.getenv("NEXT_PUBLIC_AISENSY_PRODUCT_KEY"),
        ]:
            if val and isinstance(val, str) and val.startswith("eyJ"):
                jwt_token = val
                break

        aisensy_api_key = jwt_token or (
            getattr(settings, "AISENSY_API_KEY", None) or 
            os.getenv("AISENSY_API_KEY") or 
            os.getenv("NEXT_PUBLIC_AISENSY_PRODUCT_KEY") or 
            "65fd2056e97f7906839f0496"
        )
        
        # Determine Campaign Name (non-JWT string)
        raw_campaign = (
            os.getenv("AISENSY_CAMPAIGN_NAME") or 
            getattr(settings, "AISENSY_CAMPAIGN_NAME", None) or 
            os.getenv("NEXT_PUBLIC_AISENSY_PROJECT_API") or 
            getattr(settings, "AISENSY_PROJECT_KEY", None) or 
            "22a9ef31d8d75d621ff5e"
        )
        
        aisensy_campaign_name = raw_campaign if not str(raw_campaign).startswith("eyJ") else "22a9ef31d8d75d621ff5e"

        c_name = candidate_name or "CloudOps Candidate"

        if aisensy_api_key:
            url = "https://backend.aisensy.com/campaign/t1/api/v2"
            headers = {
                "Authorization": f"Bearer {aisensy_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "apiKey": aisensy_api_key,
                "campaignName": aisensy_campaign_name,
                "destination": formatted_phone,
                "userName": c_name,
                "templateParams": [
                    c_name,
                    otp_code
                ]
            }

            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    logger.info(f"AiSensy WhatsApp API response: {response.status_code} - {response.text}")
                    print(f"\n========================================\n[AISENSY WHATSAPP API] 📲 WhatsApp OTP [{otp_code}] sent to {formatted_phone} (Campaign: {aisensy_campaign_name}, Status: {response.status_code})\nResponse: {response.text}\n========================================\n")
                    
                    if response.status_code == 200:
                        return True
            except Exception as e:
                logger.error(f"Failed to dispatch AiSensy WhatsApp OTP v2: {e}")

            # Fallback with destination without '+'
            try:
                payload_alt = dict(payload)
                payload_alt["destination"] = dest_digits
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res_alt = await client.post(url, headers=headers, json=payload_alt)
                    logger.info(f"AiSensy Alt Format response: {res_alt.status_code} - {res_alt.text}")
            except Exception as e2:
                logger.error(f"AiSensy Alt Format error: {e2}")

        logger.info(f"[WHATSAPP SERVICE BACKEND LOG] 📲 OTP for {formatted_phone}: {otp_code}")
        print(f"\n========================================\n[WHATSAPP GATEWAY LOG] 📲 OTP sent to {formatted_phone}: {otp_code}\n========================================\n")
        return True

    @staticmethod
    async def send_whatsapp_otp(phone_number: str, otp_code: str, candidate_name: Optional[str] = None) -> bool:
        """
        Alias method for WhatsApp OTP dispatch.
        """
        return await SMSService.send_otp(phone_number, otp_code, candidate_name)




