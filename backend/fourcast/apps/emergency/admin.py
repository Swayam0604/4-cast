from django.contrib import admin
from .models import EmergencyContact, EmergencyService, SOSAlert

@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'phone', 'relationship', 'priority', 'is_primary']
    list_filter = ['relationship', 'is_primary', 'priority']
    search_fields = ['user__username', 'name', 'phone']
    ordering = ['user', 'priority']

@admin.register(EmergencyService)
class EmergencyServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'service_type', 'location', 'is_active']
    list_filter = ['service_type', 'is_active']
    search_fields = ['name', 'phone', 'location']

@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'location', 'is_resolved', 'created_at', 'resolved_at']
    list_filter = ['is_resolved', 'created_at']
    search_fields = ['user__username', 'location']
    ordering = ['-created_at']
