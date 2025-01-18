from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),  # Auth endpoints
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),  # Registration endpoints
    path('api/transactions/', include('transactions.urls')),
]