import resend
from core.config import settings

if not settings.RESEND_API_KEY:
    raise RuntimeError("Set RESEND_API_KEY to test Resend email delivery.")
if not settings.RESEND_EMAIL_FROM or not settings.RESEND_EMAIL_TO:
    raise RuntimeError(
        "Set RESEND_EMAIL_FROM and RESEND_EMAIL_TO before running the test."
    )

resend.api_key = settings.RESEND_API_KEY

try:
    print("Testing Resend email delivery...")
    resend.Emails.send({
        "from": settings.RESEND_EMAIL_FROM,
        "to": settings.RESEND_EMAIL_TO,
        "subject": "Test Email from ShieldStream",
        "html": "<p>This is a test email to verify the Resend integration.</p>"
    })
    print(f"✅ Email sent successfully to {settings.RESEND_EMAIL_TO}!")
except Exception as e:
    print(f"❌ Failed to send email: {e}")
