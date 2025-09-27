from rest_framework import serializers
from .models import WeatherData, WeatherAlert, UserWeatherPreference, UserAlertHistory

class WeatherDataSerializer(serializers.ModelSerializer):
    """Serializer for weather data from API"""
    class Meta:
        model = WeatherData
        fields = [
            'id', 'city', 'latitude', 'longitude', 
            'temperature', 'humidity', 'rainfall', 
            'wind_speed', 'weather_condition', 'timestamp'
        ]

class WeatherAlertSerializer(serializers.ModelSerializer):
    """Serializer for weather alerts"""
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = WeatherAlert
        fields = [
            'id', 'location', 'alert_level', 'alert_type',
            'message', 'rainfall_threshold', 'is_active',
            'created_at', 'expires_at', 'time_remaining'
        ]
    
    def get_time_remaining(self, obj):
        """Calculate time remaining until alert expires"""
        from django.utils import timezone
        if obj.expires_at > timezone.now():
            remaining = obj.expires_at - timezone.now()
            hours = remaining.total_seconds() / 3600
            return f"{hours:.1f} hours"
        return "Expired"

class UserWeatherPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user weather preferences"""
    class Meta:
        model = UserWeatherPreference
        fields = [
            'default_location', 'latitude', 'longitude',
            'enable_rain_alerts', 'enable_storm_alerts', 'enable_flood_alerts',
            'email_notifications', 'sms_notifications', 'push_notifications',
            'rain_threshold_yellow', 'rain_threshold_orange', 'rain_threshold_red'
        ]

class SimpleWeatherSerializer(serializers.Serializer):
    """Simple serializer for API response data (not from database)"""
    city = serializers.CharField()
    temperature = serializers.FloatField()
    humidity = serializers.IntegerField()
    rainfall = serializers.FloatField()
    wind_speed = serializers.FloatField()
    weather_condition = serializers.CharField()
    icon = serializers.CharField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
