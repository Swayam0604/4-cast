from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import WeatherData, WeatherAlert
from .services import WeatherService
from .serializers import (
    WeatherDataSerializer, 
    WeatherAlertSerializer, 
    SimpleWeatherSerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def current_weather(request):
    """
    Get current weather for a city
    Usage: GET /api/weather/current/?city=Mumbai
    """
    city = request.GET.get('city', 'Mumbai')
    
    try:
        # Fetch fresh weather data from API
        weather_data = WeatherService.fetch_current_weather(city)
        
        if weather_data:
            # Use simple serializer for API response data
            serializer = SimpleWeatherSerializer(weather_data)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': f'Weather data fetched successfully for {city}'
            }, status=status.HTTP_200_OK)
        else:
            # Try to get latest cached data from database
            latest_weather = WeatherData.objects.filter(
                city__iexact=city
            ).first()
            
            if latest_weather:
                serializer = WeatherDataSerializer(latest_weather)
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': f'Showing cached weather data for {city}',
                    'cached': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': 'Weather data not available for this location',
                    'message': 'Please check the city name and try again'
                }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Internal server error while fetching weather data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def weather_alerts(request):
    """
    Get active weather alerts
    Usage: GET /api/weather/alerts/?location=Mumbai
    """
    location = request.GET.get('location')
    
    try:
        # Deactivate expired alerts first
        WeatherService.deactivate_expired_alerts()
        
        # Get active alerts
        alerts = WeatherService.get_active_alerts(location)
        serializer = WeatherAlertSerializer(alerts, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': alerts.count(),
            'message': f'Found {alerts.count()} active alerts'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Error fetching weather alerts'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def weather_forecast(request):
    """
    Get weather forecast for a city
    Usage: GET /api/weather/forecast/?city=Mumbai&days=5
    """
    city = request.GET.get('city', 'Mumbai')
    days = int(request.GET.get('days', 5))
    
    # Limit days to reasonable range
    if days < 1:
        days = 1
    elif days > 5:
        days = 5
    
    try:
        forecast_data = WeatherService.get_forecast(city, days)
        
        if forecast_data:
            return Response({
                'success': True,
                'data': forecast_data,
                'message': f'{days}-day forecast for {city}'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': 'Forecast data not available',
                'message': 'Please check the city name and try again'
            }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Error fetching weather forecast'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def weather_history(request):
    """
    Get recent weather history for a city
    Usage: GET /api/weather/history/?city=Mumbai&limit=10
    """
    city = request.GET.get('city', 'Mumbai')
    limit = int(request.GET.get('limit', 10))
    
    try:
        weather_history = WeatherData.objects.filter(
            city__iexact=city
        ).order_by('-timestamp')[:limit]
        
        serializer = WeatherDataSerializer(weather_history, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': weather_history.count(),
            'message': f'Weather history for {city}'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Error fetching weather history'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Test endpoint to verify API is working
@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """Simple endpoint to test if API is working"""
    return Response({
        'success': True,
        'message': '4-Cast Weather API is running!',
        'timestamp': timezone.now(),
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)
