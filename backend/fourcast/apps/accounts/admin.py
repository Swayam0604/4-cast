from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Add custom fields to the admin interface
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'date_of_birth', 'is_verified', 'created_at', 'updated_at')
        }),
    )
    
    # Make created_at and updated_at read-only
    readonly_fields = ('created_at', 'updated_at')
    
    # Add fields to the list display
    list_display = UserAdmin.list_display + ('phone_number', 'is_verified', 'created_at')
    
    # Add filters
    list_filter = UserAdmin.list_filter + ('is_verified', 'created_at')
