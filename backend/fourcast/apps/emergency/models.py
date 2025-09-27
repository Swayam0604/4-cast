from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EmergencyContact(models.Model):
    """User's emergency contacts"""
    CONTACT_TYPES = [
        ('family', 'Family Member'),
        ('friend', 'Friend'),
        ('neighbor', 'Neighbor'),
        ('medical', 'Medical Emergency'),
        ('workplace', 'Workplace Contact'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_contacts')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    relationship = models.CharField(max_length=20, choices=CONTACT_TYPES)
    priority = models.IntegerField(default=1)  # 1 = highest priority
    is_primary = models.BooleanField(default=False)
    auto_notify_on_red_alert = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority', 'name']
        unique_together = ['user', 'phone']  # Prevent duplicate contacts

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.relationship})"

class EmergencyService(models.Model):
    """Pre-defined emergency services (Police, Fire, etc.)"""
    SERVICE_TYPES = [
        ('police', 'Police'),
        ('fire', 'Fire Department'),
        ('medical', 'Medical Emergency'),
        ('disaster', 'Disaster Management'),
    ]
    
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    location = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.phone}"

class SOSAlert(models.Model):
    """SOS alerts sent by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=200, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"SOS - {self.user.username} - {self.created_at}"
