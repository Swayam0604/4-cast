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
        
        # DEBUG: Check API key loading
        print(f"DEBUG: Loaded API Key: {cls.API_KEY[:8]}...{cls.API_KEY[-4:] if cls.API_KEY else 'None'}")
        
        # Check if we have a real API key
        if not cls.API_KEY or cls.API_KEY in ['your-api-key-here', '', 'None']:
            print(f"DEBUG: Using mock data for {city} - API key not configured properly")
            return cls._generate_mock_data(city)  # We'll create this method below
        
        print(f"DEBUG: Using REAL OpenWeatherMap API for {city}")
        
        # REAL API CODE
        try:
            url = f"{cls.BASE_URL}/weather"
            params = {
                'q': city,
                'appid': cls.API_KEY,
                'units': 'metric'
            }
            
           
            
            logger.info(f"Fetching weather for {city}")
            response = requests.get(url, params=params, timeout=10)
            
           
            if response.status_code != 200:
               
                response.raise_for_status()
            
            data = response.json()
            
            
            # Extract rainfall properly
            rainfall = 0.0
            if 'rain' in data:
             
                rainfall = data['rain'].get('1h', data['rain'].get('3h', 0.0) / 3)
            elif 'snow' in data:
               
                rainfall = data['snow'].get('1h', data['snow'].get('3h', 0.0) / 3)
            else:
                print("DEBUG: No rain or snow data in API response - it's not raining")
            
            # Extract and structure weather data
            weather_data = {
                'city': data['name'],
                'latitude': data['coord']['lat'],
                'longitude': data['coord']['lon'],
                'temperature': round(data['main']['temp'], 1),
                'humidity': data['main']['humidity'],
                'rainfall': round(rainfall, 1),
                'wind_speed': round(data['wind']['speed'] * 3.6, 1),  # Convert m/s to km/h
                'weather_condition': data['weather'][0]['description'],
                'icon': data['weather'][0]['icon'],
            }
            
            print(f"DEBUG: Extracted weather data: {weather_data}")
            
            # Save to database
            try:
                weather_record = WeatherData.objects.create(**weather_data)
                logger.info(f"REAL weather data saved for {city}: {weather_data['temperature']}°C, {weather_data['rainfall']}mm rainfall")
            except Exception as db_error:
                print(f"DEBUG: Database save error: {db_error}")
            
            # Check if we need to create alerts
            cls._check_alert_thresholds(weather_data)
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: API Request Exception: {str(e)}")
            logger.error(f"API request failed for {city}: {str(e)}")
            
            # Fallback to latest cached data
            try:
                latest_weather = WeatherData.objects.filter(city__iexact=city).first()
                if latest_weather:
                    print(f"DEBUG: Using cached data for {city}")
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
            except Exception as cache_error:
                print(f"DEBUG: Cache retrieval error: {cache_error}")
            
            return None
            
        except Exception as e:
            print(f"DEBUG: General Exception: {str(e)}")
            logger.error(f"Error processing weather data for {city}: {str(e)}")
            return None

    @classmethod
    def _generate_mock_data(cls, city):
        """Generate mock data as fallback"""
        import random
        mock_weather_data = {
            'city': city,
            'latitude': 19.0728 if city.lower() == 'mumbai' else 28.6139,
            'longitude': 72.8826 if city.lower() == 'mumbai' else 77.2090,
            'temperature': round(28.5 + random.uniform(-3, 5), 1),
            'humidity': 75 + random.randint(-10, 15),
            'rainfall': round(random.choice([0, 0, 0, 0.5, 1.2, 2.1, 0.8]), 1),
            'wind_speed': round(12.3 + random.uniform(-4, 8), 1),
            'weather_condition': random.choice(['partly cloudy', 'clear sky', 'light rain']),
            'icon': random.choice(['02d', '01d', '10d']),
        }
        
        # Save mock data to database
        try:
            weather_record = WeatherData.objects.create(**mock_weather_data)
            print(f"Mock weather data saved for {city}: {mock_weather_data['temperature']}°C")
        except Exception as e:
            print(f"Error saving mock data: {e}")
        
        cls._check_alert_thresholds(mock_weather_data)
        return mock_weather_data


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
