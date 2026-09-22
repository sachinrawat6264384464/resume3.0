from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from datetime import datetime
import uuid
from app.models.base import TimeStampedModel

class PaymentGatewayConfig(TimeStampedModel):
    __tablename__ = "payment_gateway_configs"

    provider_name = Column(String(50), nullable=False, default="razorpay") # razorpay
    is_enabled = Column(Boolean, default=False, nullable=False)
    is_test_mode = Column(Boolean, default=True, nullable=False)
    
    publishable_key = Column(String(255), nullable=True)
    encrypted_secret_key = Column(Text, nullable=True) # Masked/encrypted on response
    webhook_secret = Column(Text, nullable=True)
    
    currency = Column(String(10), default="INR", nullable=False)
    amount = Column(String(50), default="1", nullable=False) # Candidate Assessment Prep Fee in INR
    additional_settings = Column(JSON, nullable=True)
    
    last_updated_by = Column(String(255), nullable=True)


class PaymentTransaction(TimeStampedModel):
    __tablename__ = "payment_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), nullable=True)
    candidate_name = Column(String(255), nullable=True)
    candidate_email = Column(String(255), nullable=True)
    candidate_phone = Column(String(50), nullable=True)
    
    provider = Column(String(50), nullable=False, default="razorpay")
    transaction_id = Column(String(255), nullable=True)
    order_id = Column(String(255), nullable=True)
    amount = Column(String(50), nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), nullable=False, default="success") # success, pending, failed, refunded
    payment_method = Column(String(50), nullable=True)
    coupon_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)

