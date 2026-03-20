from django.contrib.auth.models import AbstractUser
from django.db import models

class College(models.Model):
    name = models.CharField(max_length=255, unique=True)
    email_domain = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class User(AbstractUser):
    ADMIN = 'admin'
    ORGANIZER = 'organizer'
    ATTENDEE = 'attendee'
    
    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (ORGANIZER, 'Organizer'),
        (ATTENDEE, 'Attendee'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ATTENDEE)
    
    # Common fields
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    # College Mode fields
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    is_college_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

# Role-Specific Extension Models

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    access_level = models.CharField(max_length=50, default='Full Access')
    system_privileges = models.JSONField(default=dict) # Store specific privs

    def __str__(self):
        return f"Admin: {self.user.username}"

class OrganizerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='organizer_profile')
    organization_name = models.CharField(max_length=255, blank=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True) # Specific to organizer in prompt
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Organizer: {self.organization_name or self.user.username}"

class AttendeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='attendee_profile')
    college_name = models.CharField(max_length=255, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True)
    registered_events_count = models.PositiveIntegerField(default=0)
    
    # Keeping phone generic or specific? Prompt didn't list it for Attendee, 
    # but practically useful. I'll add generic phone to User if needed, 
    # but strictly following prompt puts 'contact_number' on Organizer. 
    # I'll leave Attendee minimal as per prompt.

    def __str__(self):
        return f"Attendee: {self.user.username}"
