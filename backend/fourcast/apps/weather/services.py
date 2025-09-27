import requests
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from .models import WeatherData, WeatherAlert

logger = logging.getLogger(__name__)

class WeatherService:
    """Service class to handle OpenWeatherMap API integration"""
    
    BASE_URL = "http://api.openweathermap.org/data/2.5"
    API_KEY = settings.OPENWEATHER_API_KEY
    
    @classmethod
    def fetch_current_weather(cls, city):
        """
        Fetch current weather data from OpenWeatherMap API
        Returns: dict with weather data or None if error
        """
        
        # TEMPORARY: Mock data for development
        if not cls.API_KEY or cls.API_KEY == 'your-api-key-here':
            print(f"DEBUG: Using mock data for {city}")
            mock_weather_data = {
                'city': city,
                'latitude': 19.0728 if city.lower() == 'mumbai' else 28.6139,
                'longitude': 72.8826 if city.lower() == 'mumbai' else 77.2090,
                'temperature': round(28.5 + (hash(city) % 10), 1),  # Vary by city
                'humidity': 75 + (hash(city) % 20),
                'rainfall': 0.0 if hash(city) % 3 == 0 else round((hash(city) % 5) * 2.5, 1),
                'wind_speed': round(12.3 + (hash(city) % 8), 1),
                'weather_condition': 'partly cloudy' if hash(city) % 2 == 0 else 'clear sky',
                'icon': '02d' if hash(city) % 2 == 0 else '01d',
            }
            
            # Save mock data to database
            try:
                weather_record = WeatherData.objects.create(**mock_weather_data)
                print(f"Mock weather data saved for {city}: {mock_weather_data['temperature']}°C")
            except Exception as e:
                print(f"Error saving mock data: {e}")
            
            # Check alerts with mock data
            cls._check_alert_thresholds(mock_weather_data)
            
            return mock_weather_data
        
        # REAL API CODE (when you have API key)
        try:
            url = f"{cls.BASE_URL}/weather"
            params = {
                'q': city,
                'appid': cls.API_KEY,
                'units': 'metric'
            }
            
            logger.info(f"Fetching weather for {city}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract and structure weather data
            weather_data = {
                'city': data['name'],
                'latitude': data['coord']['lat'],
                'longitude': data['coord']['lon'],
                'temperature': round(data['main']['temp'], 1),
                'humidity': data['main']['humidity'],
                'rainfall': data.get('rain', {}).get('1h', 0.0),
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),
                'weather_condition': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
            }
            
            # Save to database
            weather_record = WeatherData.objects.create(**weather_data)
            logger.info(f"Weather data saved for {city}: {weather_data['temperature']}°C")
            
            # Check if we need to create alerts
            cls._check_alert_thresholds(weather_data)
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed for {city}: {str(e)}")
            # Fallback to latest cached data
            try:
                latest_weather = WeatherData.objects.filter(city__iexact=city).first()
                if latest_weather:
                    return {
                        'city': latest_weather.city,
                        'latitude': latest_weather.latitude,
                        'longitude': latest_weather.longitude,
                        'temperature': latest_weather.temperature,
                        'humidity': latest_weather.humidity,
                        'rainfall': latest_weather.rainfall,
                        'wind_speed': latest_weather.wind_speed,
                        'weather_condition': latest_weather.weather_condition,
                        'icon': '01d',  # Default icon
                    }
            except:
                pass
            return None
        except Exception as e:
            logger.error(f"Error processing weather data for {city}: {str(e)}")
            return None

    
    @classmethod
    def get_forecast(cls, city, days=5):
        """
        Get weather forecast for next few days
        Returns: dict with forecast data or None if error
        """
        try:
            url = f"{cls.BASE_URL}/forecast"
            params = {
                'q': city,
                'appid': cls.API_KEY,
                'units': 'metric',
                'cnt': days * 8  # API returns 3-hour intervals, 8 per day
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            forecast_data = response.json()
            
            # Process forecast data
            processed_forecast = {
                'city': forecast_data['city']['name'],
                'forecasts': []
            }
            
            for item in forecast_data['list']:
                forecast_item = {
                    'datetime': item['dt_txt'],
                    'temperature': round(item['main']['temp'], 1),
                    'humidity': item['main']['humidity'],
                    'rainfall': item.get('rain', {}).get('3h', 0.0),
                    'weather_condition': item['weather'][0]['description'],
                    'icon': item['weather'][0]['icon']
                }
                processed_forecast['forecasts'].append(forecast_item)
            
            return processed_forecast
            
        except Exception as e:
            logger.error(f"Error fetching forecast for {city}: {str(e)}")
            return None
    
    @classmethod
    def _check_alert_thresholds(cls, weather_data):
        """
        Check weather data against thresholds and create alerts
        Based on IMD (Indian Meteorological Department) standards
        """
        rainfall = weather_data['rainfall']
        location = weather_data['city']
        
        alert_level = None
        alert_type = 'rain'
        message = ""
        
        # Define alert thresholds (mm/hour)
        if rainfall >= 50:  # Extremely heavy rain
            alert_level = 'red'
            message = f"🚨 EXTREME RAINFALL WARNING: {rainfall}mm/hr in {location}. STAY INDOORS! Flooding likely. Contact emergency services if needed."
        elif rainfall >= 15:  # Very heavy rain  
            alert_level = 'orange'
            message = f"⚠️ HEAVY RAIN ALERT: {rainfall}mm/hr in {location}. Avoid unnecessary travel. Waterlogging possible in low-lying areas."
        elif rainfall >= 2.6:  # Heavy rain
            alert_level = 'yellow'
            message = f"🌧️ Moderate rain alert: {rainfall}mm/hr in {location}. Carry umbrella and allow extra travel time."
        
        # Create alert if threshold exceeded
        if alert_level:
            expires_at = timezone.now() + timedelta(hours=6)  # Alert expires in 6 hours
            
            # Check if similar active alert already exists
            existing_alert = WeatherAlert.objects.filter(
                location=location,
                alert_level=alert_level,
                is_active=True,
                expires_at__gt=timezone.now()
            ).first()
            
            if not existing_alert:
                alert = WeatherAlert.objects.create(
                    location=location,
                    alert_level=alert_level,
                    alert_type=alert_type,
                    message=message,
                    rainfall_threshold=rainfall,
                    expires_at=expires_at
                )
                logger.warning(f"Weather alert created: {alert_level.upper()} for {location}")
            else:
                # Update existing alert
                existing_alert.message = message
                existing_alert.rainfall_threshold = rainfall
                existing_alert.save()
                logger.info(f"Updated existing {alert_level.upper()} alert for {location}")
    
    @classmethod
    def get_active_alerts(cls, location=None):
        """Get all active weather alerts, optionally filtered by location"""
        queryset = WeatherAlert.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        )
        
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        return queryset.order_by('-created_at')
    
    @classmethod
    def deactivate_expired_alerts(cls):
        """Deactivate alerts that have expired"""
        expired_count = WeatherAlert.objects.filter(
            is_active=True,
            expires_at__lte=timezone.now()
        ).update(is_active=False)
        
        if expired_count > 0:
            logger.info(f"Deactivated {expired_count} expired alerts")
        
        return expired_count
