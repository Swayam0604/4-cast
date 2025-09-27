from django.contrib import admin
from .models import UserWeatherPreference, WeatherData, WeatherAlert, UserAlertHistory

@admin.register(UserWeatherPreference)
class UserWeatherPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'default_location', 'enable_rain_alerts', 'email_notifications', 'created_at']
    list_filter = ['enable_rain_alerts', 'email_notifications', 'created_at']
    search_fields = ['user__username', 'default_location']

@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ['city', 'temperature', 'rainfall', 'weather_condition', 'timestamp']
    list_filter = ['city', 'timestamp']
    search_fields = ['city', 'weather_condition']
    ordering = ['-timestamp']

@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ['location', 'alert_level', 'alert_type', 'is_active', 'created_at', 'expires_at']
    list_filter = ['alert_level', 'alert_type', 'is_active', 'created_at']
    search_fields = ['location', 'message']
    ordering = ['-created_at']

@admin.register(UserAlertHistory)
class UserAlertHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert', 'acknowledged', 'created_at']
    list_filter = ['acknowledged', 'created_at']
    search_fields = ['user__username']
