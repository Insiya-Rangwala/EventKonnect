from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ticket

@receiver(post_save, sender=Ticket)
def generate_ticket_qr(sender, instance, created, **kwargs):
    if created and not instance.qr_code:
        instance.generate_qr()
