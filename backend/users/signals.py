from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User

from .models import User, AdminProfile, OrganizerProfile, AttendeeProfile

@receiver(post_save, sender=User)
def create_user_profile_and_group(sender, instance, created, **kwargs):
    """
    1. Assign User to Django Group.
    2. Create corresponding Role Profile.
    """
    if created:
        # 1. Group Assignment
        if instance.role:
            group, _ = Group.objects.get_or_create(name=instance.role.capitalize())
            instance.groups.add(group)

        # 2. Profile Creation
        if instance.role == User.ADMIN:
            AdminProfile.objects.get_or_create(user=instance)
        elif instance.role == User.ORGANIZER:
            OrganizerProfile.objects.get_or_create(user=instance)
        else:
            # Default to Attendee logic
            AttendeeProfile.objects.get_or_create(user=instance)
