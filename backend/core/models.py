from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('alert', 'Alert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class SystemSettings(models.Model):
    # Core Configurations
    college_mode = models.BooleanField(default=False)
    allowed_domains = models.CharField(max_length=255, default='gmail.com, edu', blank=True)
    max_events_per_organizer = models.IntegerField(default=5)
    
    # Policies
    cancellation_policy = models.CharField(
        max_length=20, 
        choices=[('flexible', 'Flexible (24h before)'), ('moderate', 'Moderate (50% refund)'), ('strict', 'Strict (No refund)')],
        default='flexible'
    )
    password_policy = models.CharField(
        max_length=20,
        choices=[('weak', 'Weak'), ('medium', 'Medium'), ('strong', 'Strong')],
        default='strong'
    )
    session_timeout = models.IntegerField(default=30)
    
    # Modules
    enable_chatbot = models.BooleanField(default=True)
    enable_memory_book = models.BooleanField(default=True)
    enable_feedback_moderation = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Override save to ensure it's a Singleton (id=1 always)
        self.pk = 1
        super(SystemSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Global System Settings"
