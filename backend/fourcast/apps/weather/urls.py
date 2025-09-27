from django.urls import path
from . import views

urlpatterns = [
    path('current/', views.current_weather, name='current_weather'),
    path('alerts/', views.weather_alerts, name='weather_alerts'),
    path('forecast/', views.weather_forecast, name='weather_forecast'),
    path('history/', views.weather_history, name='weather_history'),
    path('status/', views.api_status, name='api_status'),
]
