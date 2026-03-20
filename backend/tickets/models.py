from django.db import models
from django.conf import settings
from events.models import Event
import qrcode
from io import BytesIO
from django.core.files import File
import random
import string

User = settings.AUTH_USER_MODEL

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('used', 'Used'),
        ('cancelled', 'Cancelled'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    attendee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')
    verification_code = models.CharField(max_length=6, unique=True, null=True, blank=True)
    check_in_status = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_verification_code(self):
        # Generate a unique 6-digit verification code
        while True:
            code = ''.join(random.choices(string.digits, k=6))
            if not Ticket.objects.filter(verification_code=code).exists():
                self.verification_code = code
                break

    # save method removed in favor of signal for QR generation

    def generate_qr(self):
        qr_content = f"TICKET_ID:{self.id},CODE:{self.verification_code}"
        qr = qrcode.make(qr_content)
        canvas = BytesIO()
        qr.save(canvas, format='PNG')
        file_name = f'qr_{self.event.id}_{self.attendee.id}_{self.id}.png'
        self.qr_code.save(file_name, File(canvas), save=False)
        self.save()
