from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]

    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('COLLEGE', 'College Only')
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    category = models.CharField(max_length=100, default='General')
    venue = models.CharField(max_length=200)
    location_lat = models.FloatField(null=True, blank=True)
    location_lng = models.FloatField(null=True, blank=True)
    capacity = models.PositiveIntegerField()
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    college_mode = models.BooleanField(default=False) # Manual Verification Required if True
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    visibility = models.CharField(max_length=15, choices=VISIBILITY_CHOICES, default='PUBLIC')
    college = models.ForeignKey('users.College', on_delete=models.CASCADE, null=True, blank=True, related_name='college_events')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class MemoryBook(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='memory_books')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='memories/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_memories', null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Memory for {self.event.title}"

class MemoryComment(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='memory_comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memory_comments')
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.event.title}"
